"""Rule-based, deterministic Nutrition Engine.

Pure, typed computation — no DB/network I/O, no dependency on repositories,
the ``AIOrchestrator``, or the generic
:class:`~app.ai.engine.AIEngine` protocol. Deliberately consumes its own
``NutritionInput``/returns its own ``NutritionOutput`` rather than the
generic ``EngineInput``/``EngineOutput`` contracts, and is not registered
into ``AIOrchestrator.engines`` this sprint — see Decision 011 in
``docs/DECISIONS.md``. See Decision 010 for why target calculation is a
formula against the user's existing profile rather than an LLM call, and
Decision 013 for why BMR calculation is injected as a swappable
:class:`~app.ai.bmr_strategies.BMRStrategy` rather than inlined here.
"""

import uuid
from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from pydantic import BaseModel

from app.ai.bmr_strategies import BMRStrategy, NutritionProfile
from app.ai.nutrition_constants import ACTIVITY_MULTIPLIERS, PROTEIN_G_PER_KG_BY_GOAL
from app.core.config import settings
from app.models.user import Goal

__all__ = [
    "NutritionProfile",
    "NutritionTotals",
    "NutritionInput",
    "NutritionTargets",
    "NutritionOutput",
    "NutritionEngine",
    "IncompleteNutritionProfileError",
]


class IncompleteNutritionProfileError(Exception):
    """Raised when a user's profile is missing a field required for target calculation.

    The Nutrition Engine documents this precondition but never checks for
    it itself; :class:`~app.services.nutrition_service.NutritionService` is
    responsible for validating profile completeness (and naming the
    missing fields) before ever constructing a :class:`NutritionInput`.
    """


class NutritionTotals(BaseModel):
    """A flat calorie/macro breakdown — used for both logged totals and targets."""

    calories: Decimal
    protein_g: Decimal
    carbs_g: Decimal
    fat_g: Decimal


class NutritionInput(BaseModel):
    """Everything :meth:`NutritionEngine.handle` needs for one calculation.

    ``logged_totals`` is pre-aggregated by
    :class:`~app.services.nutrition_service.NutritionService` (summed across
    that date's ``MealLog`` rows) — the engine never queries the database.
    """

    user_id: uuid.UUID
    profile: NutritionProfile
    logged_totals: NutritionTotals
    for_date: date


class NutritionTargets(BaseModel):
    """Computed calorie/macro targets for one day."""

    calories: Decimal
    protein_g: Decimal
    carbs_g: Decimal
    fat_g: Decimal


class NutritionOutput(BaseModel):
    """The full result of one :meth:`NutritionEngine.handle` call."""

    targets: NutritionTargets
    actual: NutritionTotals
    adherence: dict[str, str]
    summary_text: str
    for_date: date


_ADHERENCE_UNDER = "under"
_ADHERENCE_ON_TRACK = "on_track"
_ADHERENCE_OVER = "over"


class NutritionEngine:
    """Computes daily calorie/macro targets and adherence from a profile and logged intake.

    Stateless per invocation — ``bmr_strategy`` is the only thing carried on
    the instance, and it is itself stateless (see
    ``app/ai/bmr_strategies.py``).
    """

    def __init__(self, bmr_strategy: BMRStrategy) -> None:
        self._bmr_strategy = bmr_strategy

    def handle(self, nutrition_input: NutritionInput) -> NutritionOutput:
        """Compute targets, adherence, and a templated summary for one day.

        Assumes ``nutrition_input.profile`` is complete — see
        :class:`IncompleteNutritionProfileError`'s docstring for why that
        validation is the caller's responsibility, not this method's.
        """
        profile = nutrition_input.profile
        bmr = self._bmr_strategy.calculate(profile)
        tdee = bmr * Decimal(str(ACTIVITY_MULTIPLIERS[profile.activity_level]))

        target_calories = self._apply_goal_adjustment(tdee, profile.goal)
        target_calories = max(
            target_calories, Decimal(settings.nutrition_min_calories_floor)
        )

        protein_g = Decimal(str(PROTEIN_G_PER_KG_BY_GOAL[profile.goal])) * profile.weight_kg
        fat_g = (
            target_calories * Decimal(str(settings.nutrition_fat_pct_of_calories))
        ) / Decimal(9)
        remaining_calories = target_calories - (protein_g * Decimal(4)) - (fat_g * Decimal(9))
        carbs_g = max(remaining_calories, Decimal(0)) / Decimal(4)

        targets = NutritionTargets(
            calories=self._quantize(target_calories),
            protein_g=self._quantize(protein_g),
            carbs_g=self._quantize(carbs_g),
            fat_g=self._quantize(fat_g),
        )

        adherence = {
            "calories": self._classify_adherence(
                nutrition_input.logged_totals.calories, targets.calories
            ),
            "protein_g": self._classify_adherence(
                nutrition_input.logged_totals.protein_g, targets.protein_g
            ),
            "carbs_g": self._classify_adherence(
                nutrition_input.logged_totals.carbs_g, targets.carbs_g
            ),
            "fat_g": self._classify_adherence(
                nutrition_input.logged_totals.fat_g, targets.fat_g
            ),
        }

        return NutritionOutput(
            targets=targets,
            actual=nutrition_input.logged_totals,
            adherence=adherence,
            summary_text=self._build_summary_text(
                targets, nutrition_input.logged_totals, adherence
            ),
            for_date=nutrition_input.for_date,
        )

    @staticmethod
    def _apply_goal_adjustment(tdee: Decimal, goal: Goal) -> Decimal:
        """Shift TDEE by the configured deficit/surplus for weight-change goals."""
        if goal == Goal.LOSE_WEIGHT:
            return tdee - Decimal(settings.nutrition_calorie_deficit_kcal)
        if goal == Goal.GAIN_MUSCLE:
            return tdee + Decimal(settings.nutrition_calorie_surplus_kcal)
        return tdee

    @staticmethod
    def _classify_adherence(actual: Decimal, target: Decimal) -> str:
        """Classify ``actual`` against ``target`` using the configured tolerance band."""
        if target <= 0:
            return _ADHERENCE_ON_TRACK
        tolerance = Decimal(settings.nutrition_adherence_tolerance_pct) / Decimal(100)
        lower_bound = target * (Decimal(1) - tolerance)
        upper_bound = target * (Decimal(1) + tolerance)
        if actual < lower_bound:
            return _ADHERENCE_UNDER
        if actual > upper_bound:
            return _ADHERENCE_OVER
        return _ADHERENCE_ON_TRACK

    @staticmethod
    def _quantize(value: Decimal) -> Decimal:
        """Round to 2 decimal places, matching the ``Numeric(6, 2)`` storage precision."""
        return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @staticmethod
    def _build_summary_text(
        targets: NutritionTargets,
        actual: NutritionTotals,
        adherence: dict[str, str],
    ) -> str:
        """Return a deterministic, templated natural-language summary.

        Framed strictly around training/body-composition goals, with a
        brief disclaimer that this is a general estimate, not medical
        guidance — matches the fitness/sports-nutrition-only constraint on
        this sprint's scope.
        """
        return (
            f"Today's targets: {targets.calories} kcal "
            f"({targets.protein_g}g protein, {targets.carbs_g}g carbs, {targets.fat_g}g fat). "
            f"Logged so far: {actual.calories} kcal "
            f"({actual.protein_g}g protein, {actual.carbs_g}g carbs, {actual.fat_g}g fat). "
            f"Adherence — calories: {adherence['calories']}, protein: {adherence['protein_g']}, "
            f"carbs: {adherence['carbs_g']}, fat: {adherence['fat_g']}. "
            "This is a general estimate for training/body-composition purposes only, "
            "not medical or dietary therapy advice."
        )
