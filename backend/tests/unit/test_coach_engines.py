"""Unit tests for the Sprint 4.5 coach engine adapters (``app/ai/coach_engines.py``).

Each adapter's injected domain :class:`~app.services...Service` is mocked —
these tests exercise the happy path (Service returns a real output, adapter
formats a reply/artifacts) and the graceful-degradation path (Service
raises its documented "missing data" exception, adapter never lets it
propagate) in isolation, with no database involved. See
``tests/integration/test_coach_api.py`` for a full end-to-end flow against
a real PostgreSQL instance.
"""

import uuid
from datetime import date
from decimal import Decimal

import pytest

from app.ai.coach_engines import NutritionCoachEngine, RecoveryCoachEngine, WorkoutCoachEngine
from app.ai.contracts import EngineInput, Intent, MemoryContext
from app.ai.nutrition_engine import (
    IncompleteNutritionProfileError,
    NutritionOutput,
    NutritionTargets,
    NutritionTotals,
)
from app.ai.recovery_engine import ReadinessLevel, RecoveryOutput
from app.models.program import Program
from app.models.workout import Workout
from app.schemas.workout_resolution import TodayLogStatus, WorkoutResolutionState
from app.services.recovery_service import CheckInNotFoundError
from app.services.workout_resolution_service import ResolutionResult

USER_ID = uuid.uuid4()


def _engine_input(*, intent: Intent, message: str = "hello") -> EngineInput:
    return EngineInput(
        user_id=USER_ID,
        intent=intent,
        message=message,
        context=MemoryContext(conversation_id=uuid.uuid4(), turns=[]),
    )


# -- WorkoutCoachEngine ---------------------------------------------------------


@pytest.fixture()
def workout_resolution_service(mocker):
    return mocker.Mock()


@pytest.fixture()
def workout_engine(workout_resolution_service):
    return WorkoutCoachEngine(workout_resolution_service)


def test_workout_engine_reports_no_active_program(workout_engine, workout_resolution_service):
    workout_resolution_service.resolve_current.return_value = ResolutionResult(
        state=WorkoutResolutionState.NO_ACTIVE_PROGRAM
    )

    output = workout_engine.handle(_engine_input(intent=Intent.WORKOUT))

    workout_resolution_service.resolve_current.assert_called_once_with(USER_ID)
    assert output.engine_name == "workout_coach_engine"
    assert "don't have an active program" in output.reply_text
    assert output.artifacts["state"] == "no_active_program"


def test_workout_engine_reports_a_training_day(workout_engine, workout_resolution_service):
    program = Program(id=uuid.uuid4(), name="PPL", slug="ppl", duration_weeks=4)
    workout = Workout(id=uuid.uuid4(), name="Push Day")
    workout_resolution_service.resolve_current.return_value = ResolutionResult(
        state=WorkoutResolutionState.TRAINING_DAY,
        program=program,
        workout=workout,
        today_log_status=TodayLogStatus.NONE,
    )

    output = workout_engine.handle(_engine_input(intent=Intent.WORKOUT))

    assert "Push Day" in output.reply_text
    assert output.artifacts["workout_name"] == "Push Day"
    assert output.artifacts["today_log_status"] == "none"


def test_workout_engine_reports_an_already_completed_training_day(
    workout_engine, workout_resolution_service
):
    workout = Workout(id=uuid.uuid4(), name="Push Day")
    workout_resolution_service.resolve_current.return_value = ResolutionResult(
        state=WorkoutResolutionState.TRAINING_DAY,
        workout=workout,
        today_log_status=TodayLogStatus.COMPLETED,
    )

    output = workout_engine.handle(_engine_input(intent=Intent.WORKOUT))

    assert "already completed" in output.reply_text


def test_workout_engine_reports_a_rest_day(workout_engine, workout_resolution_service):
    workout_resolution_service.resolve_current.return_value = ResolutionResult(
        state=WorkoutResolutionState.REST_DAY
    )

    output = workout_engine.handle(_engine_input(intent=Intent.WORKOUT))

    assert "rest day" in output.reply_text.lower()
    assert output.artifacts["state"] == "rest_day"


def test_workout_engine_reports_program_complete(workout_engine, workout_resolution_service):
    program = Program(id=uuid.uuid4(), name="PPL", slug="ppl", duration_weeks=4)
    workout_resolution_service.resolve_current.return_value = ResolutionResult(
        state=WorkoutResolutionState.PROGRAM_COMPLETE, program=program
    )

    output = workout_engine.handle(_engine_input(intent=Intent.WORKOUT))

    assert "PPL" in output.reply_text
    assert "completed every scheduled day" in output.reply_text


# -- NutritionCoachEngine -------------------------------------------------------


@pytest.fixture()
def nutrition_service(mocker):
    return mocker.Mock()


@pytest.fixture()
def nutrition_engine(nutrition_service):
    return NutritionCoachEngine(nutrition_service)


def _make_nutrition_output() -> NutritionOutput:
    totals = NutritionTotals(
        calories=Decimal("500"), protein_g=Decimal("40"), carbs_g=Decimal("50"), fat_g=Decimal("15")
    )
    targets = NutritionTargets(
        calories=Decimal("2000"),
        protein_g=Decimal("150"),
        carbs_g=Decimal("200"),
        fat_g=Decimal("55"),
    )
    return NutritionOutput(
        targets=targets,
        actual=totals,
        adherence={"calories": "under", "protein_g": "under", "carbs_g": "under", "fat_g": "under"},
        summary_text="Today's targets: 2000 kcal...",
        for_date=date(2026, 1, 1),
    )


def test_nutrition_engine_formats_a_reply_from_the_service_output(
    nutrition_engine, nutrition_service
):
    nutrition_service.get_daily_nutrition.return_value = _make_nutrition_output()

    output = nutrition_engine.handle(_engine_input(intent=Intent.NUTRITION))

    nutrition_service.get_daily_nutrition.assert_called_once_with(USER_ID)
    assert output.engine_name == "nutrition_coach_engine"
    assert output.reply_text == "Today's targets: 2000 kcal..."
    assert output.artifacts["targets"]["calories"] == "2000"
    assert output.artifacts["adherence"]["protein_g"] == "under"


def test_nutrition_engine_degrades_gracefully_when_profile_is_incomplete(
    nutrition_engine, nutrition_service
):
    nutrition_service.get_daily_nutrition.side_effect = IncompleteNutritionProfileError(
        "Cannot compute nutrition targets: profile is missing gender."
    )

    output = nutrition_engine.handle(_engine_input(intent=Intent.NUTRITION))

    assert output.artifacts is None
    assert "gender" in output.reply_text


# -- RecoveryCoachEngine --------------------------------------------------------


@pytest.fixture()
def recovery_service(mocker):
    return mocker.Mock()


@pytest.fixture()
def recovery_engine(recovery_service):
    return RecoveryCoachEngine(recovery_service)


def _make_recovery_output() -> RecoveryOutput:
    return RecoveryOutput(
        readiness_score=Decimal("72.50"),
        readiness_level=ReadinessLevel.MODERATE,
        recommendation_text="Train as planned, but keep an eye on intensity.",
        protocols=["10 min mobility warmup"],
        for_date=date(2026, 1, 1),
    )


def test_recovery_engine_formats_a_reply_from_the_service_output(
    recovery_engine, recovery_service
):
    recovery_service.get_daily_readiness.return_value = _make_recovery_output()

    output = recovery_engine.handle(_engine_input(intent=Intent.RECOVERY))

    recovery_service.get_daily_readiness.assert_called_once_with(USER_ID)
    assert output.engine_name == "recovery_coach_engine"
    assert output.reply_text == "Train as planned, but keep an eye on intensity."
    assert output.artifacts["readiness_level"] == "moderate"
    assert output.artifacts["readiness_score"] == "72.50"


def test_recovery_engine_degrades_gracefully_when_no_check_in_exists(
    recovery_engine, recovery_service
):
    recovery_service.get_daily_readiness.side_effect = CheckInNotFoundError(
        "No check-in found for 2026-01-01."
    )

    output = recovery_engine.handle(_engine_input(intent=Intent.RECOVERY))

    assert output.artifacts is None
    assert "check-in" in output.reply_text.lower()
