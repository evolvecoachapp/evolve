"""Swappable Basal Metabolic Rate (BMR) calculation strategies.

Mirrors ``app/ai/llm_provider.py``'s ``LLMProvider`` ABC-plus-resolver shape
(see Decision 008 in ``docs/DECISIONS.md``): :class:`BMRStrategy` isolates
one specific equation so :class:`~app.ai.nutrition_engine.NutritionEngine`
never contains formula-specific arithmetic — it only ever calls
``self.bmr_strategy.calculate(profile)``. See Decision 013 for why this is a
strategy rather than an inlined calculation.

``NutritionProfile`` (the shared input every ``BMRStrategy`` consumes) is
defined here rather than in ``nutrition_engine.py`` to avoid a circular
import: :class:`~app.ai.nutrition_engine.NutritionEngine` needs
``BMRStrategy`` for constructor injection, and every ``BMRStrategy`` needs
``NutritionProfile`` — so the profile contract lives with the strategies,
and ``nutrition_engine`` imports it from here.

Only :class:`MifflinStJeorBMRStrategy` ships this sprint. Formulas needing
profile data ``NutritionProfile`` doesn't carry yet (e.g. Katch-McArdle's
body-fat percentage) are deferred until that field exists — see the
"Explicitly out of scope" section of the Sprint 4.3 plan.
"""

from abc import ABC, abstractmethod
from decimal import Decimal

from pydantic import BaseModel

from app.ai.nutrition_constants import BMR_SEX_OFFSET
from app.core.config import settings
from app.models.user import ActivityLevel, Gender, Goal


class NutritionProfile(BaseModel):
    """The subset of a user's profile every BMR/TDEE/macro calculation needs.

    Assembled by :class:`~app.services.nutrition_service.NutritionService`
    from :class:`~app.models.user.User` fields; not persisted itself.
    """

    weight_kg: Decimal
    height_cm: Decimal
    age_years: int
    gender: Gender
    activity_level: ActivityLevel
    goal: Goal


class BMRStrategy(ABC):
    """Abstract interface for a single BMR equation."""

    @abstractmethod
    def calculate(self, profile: NutritionProfile) -> Decimal:
        """Return Basal Metabolic Rate in kcal/day for this profile."""
        raise NotImplementedError


class MifflinStJeorBMRStrategy(BMRStrategy):
    """The Mifflin-St Jeor equation — the only formula shipped this sprint.

    ``BMR = 10*weight_kg + 6.25*height_cm - 5*age_years + sex_offset``,
    where ``sex_offset`` comes from :data:`~app.ai.nutrition_constants.BMR_SEX_OFFSET`.
    """

    def calculate(self, profile: NutritionProfile) -> Decimal:
        """Return BMR in kcal/day using the Mifflin-St Jeor equation."""
        sex_offset = Decimal(str(BMR_SEX_OFFSET[profile.gender]))
        return (
            Decimal(10) * profile.weight_kg
            + Decimal("6.25") * profile.height_cm
            - Decimal(5) * profile.age_years
            + sex_offset
        )


def get_bmr_strategy(name: str | None = None) -> BMRStrategy:
    """Resolve the configured :class:`BMRStrategy` implementation.

    Args:
        name: Strategy selector; defaults to ``settings.nutrition_bmr_formula``.

    Raises:
        ValueError: If ``name`` names an unsupported formula. Only
            ``'mifflin_st_jeor'`` is supported until a later sprint adds
            Katch-McArdle/Cunningham/Harris-Benedict (each as its own class
            here); those need profile data (e.g. body-fat %)
            ``NutritionProfile`` doesn't carry yet, so they're deferred
            rather than stubbed.
    """
    resolved_name = name if name is not None else settings.nutrition_bmr_formula
    if resolved_name == "mifflin_st_jeor":
        return MifflinStJeorBMRStrategy()
    raise ValueError(
        f"Unsupported NUTRITION_BMR_FORMULA '{resolved_name}'. "
        "Only 'mifflin_st_jeor' is supported until another formula is implemented."
    )
