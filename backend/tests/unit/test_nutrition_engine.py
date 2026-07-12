"""Unit tests for :class:`~app.ai.nutrition_engine.NutritionEngine`.

Uses the real :class:`~app.ai.bmr_strategies.MifflinStJeorBMRStrategy` (no
mocking needed — it's pure arithmetic) and asserts target/adherence math
against hand-computed values across goals, including the calorie-floor
clamp and adherence classification boundaries. See
``test_bmr_strategies.py`` for BMR-equation-only coverage.
"""

import uuid
from datetime import date
from decimal import Decimal

import pytest

from app.ai.bmr_strategies import MifflinStJeorBMRStrategy, NutritionProfile
from app.ai.nutrition_engine import NutritionEngine, NutritionInput, NutritionTotals
from app.models.user import ActivityLevel, Gender, Goal

USER_ID = uuid.uuid4()
TODAY = date(2026, 1, 1)


@pytest.fixture()
def engine() -> NutritionEngine:
    return NutritionEngine(MifflinStJeorBMRStrategy())


def _make_input(
    *,
    weight_kg: Decimal = Decimal("70"),
    height_cm: Decimal = Decimal("175"),
    age_years: int = 25,
    gender: Gender = Gender.MALE,
    activity_level: ActivityLevel = ActivityLevel.SEDENTARY,
    goal: Goal = Goal.MAINTAIN_WEIGHT,
    logged_totals: NutritionTotals | None = None,
) -> NutritionInput:
    return NutritionInput(
        user_id=USER_ID,
        profile=NutritionProfile(
            weight_kg=weight_kg,
            height_cm=height_cm,
            age_years=age_years,
            gender=gender,
            activity_level=activity_level,
            goal=goal,
        ),
        logged_totals=logged_totals
        or NutritionTotals(
            calories=Decimal(0), protein_g=Decimal(0), carbs_g=Decimal(0), fat_g=Decimal(0)
        ),
        for_date=TODAY,
    )


def test_maintain_weight_targets_match_hand_computed_values(engine):
    # BMR = 1673.75 (see test_bmr_strategies), TDEE = 1673.75 * 1.2 = 2008.5
    # maintain_weight: no goal adjustment.
    # protein_g = 1.8 * 70 = 126; fat_g = 2008.5 * 0.25 / 9 = 55.791666... -> 55.79
    # carbs_g = (2008.5 - 126*4 - 55.791666*9) / 4 = 250.59375 -> 250.59
    result = engine.handle(
        _make_input(activity_level=ActivityLevel.SEDENTARY, goal=Goal.MAINTAIN_WEIGHT)
    )

    assert result.targets.calories == Decimal("2008.50")
    assert result.targets.protein_g == Decimal("126.00")
    assert result.targets.fat_g == Decimal("55.79")
    assert result.targets.carbs_g == Decimal("250.59")
    assert result.for_date == TODAY


def test_lose_weight_applies_configured_deficit(engine):
    # TDEE = 2008.5; lose_weight deficit = 500 -> target_calories = 1508.5
    # protein_g = 2.2 * 70 = 154; fat_g = 1508.5 * 0.25 / 9 = 41.902777... -> 41.90
    # carbs_g = (1508.5 - 154*4 - 41.902777*9) / 4 = 128.84375 -> 128.84
    result = engine.handle(
        _make_input(activity_level=ActivityLevel.SEDENTARY, goal=Goal.LOSE_WEIGHT)
    )

    assert result.targets.calories == Decimal("1508.50")
    assert result.targets.protein_g == Decimal("154.00")
    assert result.targets.fat_g == Decimal("41.90")
    assert result.targets.carbs_g == Decimal("128.84")


def test_gain_muscle_applies_configured_surplus(engine):
    # TDEE = 2008.5; gain_muscle surplus = 300 -> target_calories = 2308.5
    result = engine.handle(
        _make_input(activity_level=ActivityLevel.SEDENTARY, goal=Goal.GAIN_MUSCLE)
    )

    assert result.targets.calories == Decimal("2308.50")


def test_calorie_target_is_clamped_to_the_configured_floor(engine):
    # BMR = 10*50 + 6.25*150 - 5*60 - 161 = 976.5; TDEE = 976.5 * 1.2 = 1171.8
    # lose_weight deficit 500 -> 671.8, below the 1200 floor -> clamped to 1200.
    result = engine.handle(
        _make_input(
            weight_kg=Decimal("50"),
            height_cm=Decimal("150"),
            age_years=60,
            gender=Gender.FEMALE,
            activity_level=ActivityLevel.SEDENTARY,
            goal=Goal.LOSE_WEIGHT,
        )
    )

    assert result.targets.calories == Decimal("1200.00")
    # protein_g = 2.2 * 50 = 110; fat_g = 1200 * 0.25 / 9 = 33.33333... -> 33.33
    # carbs_g = (1200 - 110*4 - 300) / 4 = 460 / 4 = 115.00
    assert result.targets.protein_g == Decimal("110.00")
    assert result.targets.fat_g == Decimal("33.33")
    assert result.targets.carbs_g == Decimal("115.00")


@pytest.mark.parametrize(
    ("actual", "target", "expected_classification"),
    [
        (Decimal("1799.99"), Decimal(2000), "under"),
        (Decimal("1800"), Decimal(2000), "on_track"),
        (Decimal("2000"), Decimal(2000), "on_track"),
        (Decimal("2200"), Decimal(2000), "on_track"),
        (Decimal("2200.01"), Decimal(2000), "over"),
        (Decimal(0), Decimal(0), "on_track"),
    ],
)
def test_adherence_classification_boundaries(actual, target, expected_classification):
    """Exercises the pure classification helper directly against the ``+/-10%`` default tolerance.

    Isolating this from :meth:`NutritionEngine.handle` keeps these boundary
    cases exact and independent of the BMR/TDEE formula (which cannot
    otherwise be steered to an exact round target without float rounding).
    """
    assert NutritionEngine._classify_adherence(actual, target) == expected_classification


def test_summary_text_is_non_empty_and_mentions_estimate_disclaimer(engine):
    result = engine.handle(_make_input())

    assert result.summary_text
    assert "estimate" in result.summary_text.lower()
    assert "not medical" in result.summary_text.lower()


def test_handle_is_deterministic_for_the_same_input(engine):
    nutrition_input = _make_input()

    first = engine.handle(nutrition_input)
    second = engine.handle(nutrition_input)

    assert first == second
