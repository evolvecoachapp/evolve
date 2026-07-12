"""Unit tests for :mod:`app.ai.bmr_strategies`.

Verifies the Mifflin-St Jeor equation against hand-computed values across
genders, and the ``get_bmr_strategy`` resolver's selection/error behavior —
mirrors ``test_mock_llm_provider.py``'s coverage of ``get_llm_provider``.
"""

from decimal import Decimal

import pytest

from app.ai.bmr_strategies import (
    BMRStrategy,
    MifflinStJeorBMRStrategy,
    NutritionProfile,
    get_bmr_strategy,
)
from app.models.user import ActivityLevel, Gender, Goal


def _make_profile(
    *,
    weight_kg: Decimal = Decimal("70"),
    height_cm: Decimal = Decimal("175"),
    age_years: int = 25,
    gender: Gender = Gender.MALE,
    activity_level: ActivityLevel = ActivityLevel.SEDENTARY,
    goal: Goal = Goal.MAINTAIN_WEIGHT,
) -> NutritionProfile:
    return NutritionProfile(
        weight_kg=weight_kg,
        height_cm=height_cm,
        age_years=age_years,
        gender=gender,
        activity_level=activity_level,
        goal=goal,
    )


@pytest.fixture()
def strategy() -> MifflinStJeorBMRStrategy:
    return MifflinStJeorBMRStrategy()


def test_calculate_matches_hand_computed_value_for_male(strategy):
    profile = _make_profile(
        weight_kg=Decimal("70"), height_cm=Decimal("175"), age_years=25, gender=Gender.MALE
    )

    # 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
    assert strategy.calculate(profile) == Decimal("1673.75")


def test_calculate_matches_hand_computed_value_for_female(strategy):
    profile = _make_profile(
        weight_kg=Decimal("60"), height_cm=Decimal("165"), age_years=30, gender=Gender.FEMALE
    )

    # 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
    assert strategy.calculate(profile) == Decimal("1320.25")


@pytest.mark.parametrize("gender", [Gender.OTHER, Gender.PREFER_NOT_TO_SAY])
def test_calculate_uses_the_averaged_offset_for_other_and_prefer_not_to_say(strategy, gender):
    profile = _make_profile(
        weight_kg=Decimal("70"), height_cm=Decimal("175"), age_years=25, gender=gender
    )

    # 10*70 + 6.25*175 - 5*25 - 78 = 700 + 1093.75 - 125 - 78 = 1590.75
    assert strategy.calculate(profile) == Decimal("1590.75")


def test_get_bmr_strategy_returns_mifflin_st_jeor_by_default():
    resolved = get_bmr_strategy()

    assert isinstance(resolved, MifflinStJeorBMRStrategy)
    assert isinstance(resolved, BMRStrategy)


def test_get_bmr_strategy_honors_explicit_name_override():
    resolved = get_bmr_strategy("mifflin_st_jeor")

    assert isinstance(resolved, MifflinStJeorBMRStrategy)


def test_get_bmr_strategy_rejects_unsupported_formula_names():
    with pytest.raises(ValueError, match="Unsupported NUTRITION_BMR_FORMULA"):
        get_bmr_strategy("katch_mcardle")
