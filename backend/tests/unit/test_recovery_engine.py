"""Unit tests for :class:`~app.ai.recovery_engine.RecoveryEngine`.

Asserts composite readiness score/level math against hand-computed values
across a "well-recovered", "poorly-recovered", and "moderate" input
combination (using the default ``Settings.recovery_*``/``recovery_constants``
coefficients), plus the classification-boundary and no-RPE-logged fallback
behavior in isolation. Mirrors ``test_nutrition_engine.py``'s structure.
"""

from datetime import date
from decimal import Decimal

import pytest

from app.ai.recovery_engine import (
    ReadinessLevel,
    RecoveryEngine,
    RecoveryInput,
    RecoveryOutput,
    TrainingLoadSummary,
)

TODAY = date(2026, 1, 1)


@pytest.fixture()
def engine() -> RecoveryEngine:
    return RecoveryEngine()


def _make_input(
    *,
    sleep_hours: Decimal = Decimal("8"),
    sleep_quality: int = 5,
    soreness: int = 1,
    fatigue: int = 1,
    session_count: int = 0,
    total_duration_minutes: int = 0,
    avg_rpe: Decimal | None = None,
    window_days: int = 7,
) -> RecoveryInput:
    return RecoveryInput(
        sleep_hours=sleep_hours,
        sleep_quality=sleep_quality,
        soreness=soreness,
        fatigue=fatigue,
        training_load=TrainingLoadSummary(
            session_count=session_count,
            total_duration_minutes=total_duration_minutes,
            avg_rpe=avg_rpe,
            window_days=window_days,
        ),
        for_date=TODAY,
    )


def test_well_recovered_input_with_no_recent_training_scores_high(engine):
    # sleep_score = (100 + 100) / 2 = 100; soreness_fatigue_score = 100
    # training_load_score: no sessions logged, no RPE -> neutral 0.5 intensity ratio
    # load_ratio = (0 + 0 + 0.5) / 3 = 0.1666...; training_load_score = 83.3333...
    # composite = 100*0.4 + 100*0.35 + 83.3333*0.25 = 95.83
    result = engine.handle(_make_input())

    assert result.readiness_score == Decimal("95.83")
    assert result.readiness_level == ReadinessLevel.HIGH
    assert result.for_date == TODAY


def test_poor_sleep_high_soreness_and_high_training_load_scores_low(engine):
    # sleep_score = (50 + 0) / 2 = 25; soreness_fatigue_score = 0
    # training_load: session_ratio=2, duration_ratio=2, intensity_ratio=9/7 -> load_ratio > 1, clamped to 1
    # training_load_score = 0
    # composite = 25*0.4 + 0*0.35 + 0*0.25 = 10.00
    result = engine.handle(
        _make_input(
            sleep_hours=Decimal("4"),
            sleep_quality=1,
            soreness=5,
            fatigue=5,
            session_count=10,
            total_duration_minutes=600,
            avg_rpe=Decimal("9"),
        )
    )

    assert result.readiness_score == Decimal("10.00")
    assert result.readiness_level == ReadinessLevel.LOW


def test_moderate_inputs_land_in_the_moderate_band(engine):
    # sleep_score = (75 + 50) / 2 = 62.5; soreness_fatigue_score = 50
    # training_load_score ~= 34.7619
    # composite ~= 62.5*0.4 + 50*0.35 + 34.7619*0.25 = 51.19
    result = engine.handle(
        _make_input(
            sleep_hours=Decimal("6"),
            sleep_quality=3,
            soreness=3,
            fatigue=3,
            session_count=3,
            total_duration_minutes=150,
            avg_rpe=Decimal("6"),
        )
    )

    assert result.readiness_score == Decimal("51.19")
    assert result.readiness_level == ReadinessLevel.MODERATE


def test_no_logged_rpe_falls_back_to_a_neutral_intensity_ratio(engine):
    with_rpe = engine.handle(
        _make_input(session_count=0, total_duration_minutes=0, avg_rpe=Decimal("7"))
    )
    without_rpe = engine.handle(
        _make_input(session_count=0, total_duration_minutes=0, avg_rpe=None)
    )

    # avg_rpe=7 matches TRAINING_LOAD_REFERENCE_RPE exactly -> intensity_ratio=1.0,
    # which is higher (worse) than the neutral 0.5 fallback used when no RPE exists.
    assert with_rpe.readiness_score < without_rpe.readiness_score


@pytest.mark.parametrize(
    ("score", "expected_level"),
    [
        (Decimal("0"), ReadinessLevel.LOW),
        (Decimal("40"), ReadinessLevel.LOW),
        (Decimal("40.01"), ReadinessLevel.MODERATE),
        (Decimal("70"), ReadinessLevel.MODERATE),
        (Decimal("70.01"), ReadinessLevel.HIGH),
        (Decimal("100"), ReadinessLevel.HIGH),
    ],
)
def test_classify_level_boundaries(score, expected_level):
    assert RecoveryEngine._classify_level(score) == expected_level


def test_guidance_text_mentions_the_general_estimate_disclaimer(engine):
    result = engine.handle(_make_input())

    assert result.recommendation_text
    assert "not medical advice" in result.recommendation_text.lower()
    assert result.protocols


def test_handle_is_deterministic_for_the_same_input(engine):
    recovery_input = _make_input()

    first = engine.handle(recovery_input)
    second = engine.handle(recovery_input)

    assert first == second
    assert isinstance(first, RecoveryOutput)
