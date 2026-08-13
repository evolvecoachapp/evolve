"""Unit tests for :class:`~app.ai.coach_context.CoachContextAssembler`.

Domain services are mocked — these tests exercise section assembly, caps,
unavailable markers, and the guarantee that identifiers/secrets never
enter the serialized brief. No database and no ProgressAnalyzer.
"""

import json
import re
import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from types import SimpleNamespace

import pytest

from app.ai.coach_context import (
    MAX_ACTIVE_GOALS,
    MAX_PROGRESS_ENTRIES,
    MAX_RECENT_SESSIONS,
    CoachContextAssembler,
)
from app.ai.nutrition_engine import (
    IncompleteNutritionProfileError,
    NutritionOutput,
    NutritionTargets,
    NutritionTotals,
)
from app.ai.recovery_engine import ReadinessLevel, RecoveryOutput
from app.models.goal import GoalPriority, GoalStatus, GoalType
from app.models.meal import MealType
from app.models.progress import ProgressMetricType
from app.models.user import ActivityLevel, Gender, Goal as UserGoal
from app.models.workout_log import WorkoutLogStatus
from app.schemas.workout_resolution import TodayLogStatus, WorkoutResolutionState
from app.services.recovery_service import CheckInNotFoundError
from app.services.user_service import UserNotFoundError
from app.services.workout_resolution_service import ResolutionResult
from app.utils.pagination import Page

USER_ID = uuid.uuid4()
SECRET_EMAIL = "secret.user@example.com"
SECRET_HASH = "not-a-real-hash"
AS_OF = date(2026, 8, 13)

_UUID_RE = re.compile(
    r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
)


def _page(items: list, *, limit: int) -> Page:
    return Page(items=items, total=len(items), limit=limit, offset=0)


def _user(**overrides):
    fields = dict(
        id=USER_ID,
        email=SECRET_EMAIL,
        username="secret_username",
        hashed_password=SECRET_HASH,
        first_name="Alex",
        last_name="Hidden",
        birth_date=date(1990, 6, 15),
        gender=Gender.MALE,
        height_cm=Decimal("180.00"),
        current_weight_kg=Decimal("80.00"),
        target_weight_kg=Decimal("75.00"),
        activity_level=ActivityLevel.MODERATELY_ACTIVE,
        goal=UserGoal.LOSE_WEIGHT,
        is_superuser=True,
        is_active=True,
        is_verified=True,
    )
    fields.update(overrides)
    return SimpleNamespace(**fields)


def _goal(index: int):
    return SimpleNamespace(
        id=uuid.uuid4(),
        user_id=USER_ID,
        goal_type=GoalType.WEIGHT_TARGET,
        description=f"Goal {index}",
        status=GoalStatus.ACTIVE,
        priority=GoalPriority.HIGH,
        target_metric_type=ProgressMetricType.BODY_WEIGHT,
        target_value=Decimal("75.00"),
        target_unit="kg",
        target_date=date(2026, 12, 1),
    )


def _session(index: int):
    return SimpleNamespace(
        id=uuid.uuid4(),
        user_id=USER_ID,
        status=WorkoutLogStatus.COMPLETED,
        scheduled_date=date(2026, 8, 10),
        started_at=datetime(2026, 8, 10, 9, 0, tzinfo=timezone.utc),
        completed_at=datetime(2026, 8, 10, 10, 0, tzinfo=timezone.utc),
        duration_actual_minutes=45 + index,
        log_exercises=[SimpleNamespace(exercise_name_snapshot=f"Lift {index}")],
    )


def _progress_entry(index: int):
    return SimpleNamespace(
        id=uuid.uuid4(),
        user_id=USER_ID,
        goal_id=uuid.uuid4(),
        exercise_id=uuid.uuid4(),
        metric_type=ProgressMetricType.BODY_WEIGHT,
        value=Decimal("80.00") - Decimal(index),
        unit="kg",
        recorded_date=date(2026, 8, 1),
    )


def _nutrition_output() -> NutritionOutput:
    return NutritionOutput(
        targets=NutritionTargets(
            calories=Decimal("2000.00"),
            protein_g=Decimal("160.00"),
            carbs_g=Decimal("200.00"),
            fat_g=Decimal("55.00"),
        ),
        actual=NutritionTotals(
            calories=Decimal("500.00"),
            protein_g=Decimal("40.00"),
            carbs_g=Decimal("50.00"),
            fat_g=Decimal("15.00"),
        ),
        adherence={
            "calories": "under",
            "protein_g": "under",
            "carbs_g": "under",
            "fat_g": "under",
        },
        summary_text="unused in context",
        for_date=AS_OF,
    )


def _recovery_output() -> RecoveryOutput:
    return RecoveryOutput(
        readiness_score=Decimal("72.50"),
        readiness_level=ReadinessLevel.MODERATE,
        recommendation_text="unused in context",
        protocols=["Prioritize a thorough warm-up."],
        for_date=AS_OF,
    )


@pytest.fixture()
def services(mocker):
    return SimpleNamespace(
        user_service=mocker.Mock(),
        goal_service=mocker.Mock(),
        workout_resolution_service=mocker.Mock(),
        workout_log_service=mocker.Mock(),
        nutrition_service=mocker.Mock(),
        recovery_service=mocker.Mock(),
        progress_service=mocker.Mock(),
    )


@pytest.fixture()
def assembler(services) -> CoachContextAssembler:
    return CoachContextAssembler(
        services.user_service,
        services.goal_service,
        services.workout_resolution_service,
        services.workout_log_service,
        services.nutrition_service,
        services.recovery_service,
        services.progress_service,
    )


def _stub_complete_profile(services) -> None:
    services.user_service.get_user.return_value = _user()
    services.goal_service.list_goals.return_value = _page([_goal(1)], limit=MAX_ACTIVE_GOALS)

    exercise = SimpleNamespace(name="Bench Press")
    link = SimpleNamespace(
        exercise=exercise,
        target_sets=4,
        target_reps_min=6,
        target_reps_max=8,
        rest_seconds=120,
    )
    workout = SimpleNamespace(name="Push Day", exercise_links=[link])
    program = SimpleNamespace(name="PPL")
    assignment = SimpleNamespace(current_week_number=2, current_day_number=1)
    services.workout_resolution_service.resolve_current.return_value = ResolutionResult(
        state=WorkoutResolutionState.TRAINING_DAY,
        program=program,
        assignment=assignment,
        workout=workout,
        today_log_status=TodayLogStatus.NONE,
    )
    services.workout_log_service.list_history.return_value = _page(
        [_session(1)], limit=MAX_RECENT_SESSIONS
    )
    services.nutrition_service.get_daily_nutrition.return_value = _nutrition_output()
    services.nutrition_service.list_meal_logs.return_value = _page(
        [
            SimpleNamespace(
                name_snapshot="Oats",
                meal_type=MealType.BREAKFAST,
                calories=Decimal("350.00"),
                protein_g=Decimal("20.00"),
                carbs_g=Decimal("50.00"),
                fat_g=Decimal("8.00"),
            )
        ],
        limit=20,
    )
    services.recovery_service.get_daily_readiness.return_value = _recovery_output()
    services.recovery_service.list_check_ins.return_value = _page(
        [
            SimpleNamespace(
                sleep_hours=Decimal("7.50"),
                sleep_quality=4,
                soreness=2,
                fatigue=2,
            )
        ],
        limit=1,
    )
    services.progress_service.list_progress.return_value = _page(
        [_progress_entry(0)], limit=MAX_PROGRESS_ENTRIES
    )


def _serialized(context) -> str:
    return json.dumps(context.model_dump(mode="json"), default=str)


def test_complete_profile_fills_every_section(assembler, services):
    _stub_complete_profile(services)

    context = assembler.assemble(USER_ID, as_of=AS_OF)

    assert context.as_of == AS_OF
    assert context.profile.display_name == "Alex"
    assert context.profile.age_years == 36
    assert context.profile.primary_goal == "lose_weight"
    assert context.goals[0].description == "Goal 1"
    assert context.training.available is True
    assert context.training.state == "training_day"
    assert context.training.program_name == "PPL"
    assert context.training.today_workout_name == "Push Day"
    assert context.training.today_exercises[0].name == "Bench Press"
    assert context.training.recent_sessions[0].workout_name == "Lift 1"
    assert context.nutrition.available is True
    assert context.nutrition.targets["calories"] == "2000.00"
    assert context.nutrition.meals[0].name == "Oats"
    assert context.recovery.available is True
    assert context.recovery.readiness_score == "72.50"
    assert context.recovery.sleep_quality == 4
    assert context.progress[0].metric_type == "body_weight"
    services.progress_service.get_progress_summary.assert_not_called()


def test_incomplete_nutrition_marks_section_unavailable_without_failing(
    assembler, services
):
    _stub_complete_profile(services)
    services.nutrition_service.get_daily_nutrition.side_effect = (
        IncompleteNutritionProfileError("profile is missing gender")
    )

    context = assembler.assemble(USER_ID, as_of=AS_OF)

    assert context.nutrition.available is False
    assert context.nutrition.reason == "incomplete_profile"
    assert context.training.available is True
    assert context.recovery.available is True


def test_missing_recovery_check_in_marks_section_unavailable(assembler, services):
    _stub_complete_profile(services)
    services.recovery_service.get_daily_readiness.side_effect = CheckInNotFoundError(
        "No check-in found."
    )

    context = assembler.assemble(USER_ID, as_of=AS_OF)

    assert context.recovery.available is False
    assert context.recovery.reason == "missing_checkin"
    assert context.nutrition.available is True


def test_no_active_program_is_a_training_state_not_a_failed_section(assembler, services):
    _stub_complete_profile(services)
    services.workout_resolution_service.resolve_current.return_value = ResolutionResult(
        state=WorkoutResolutionState.NO_ACTIVE_PROGRAM
    )
    services.workout_log_service.list_history.return_value = _page(
        [], limit=MAX_RECENT_SESSIONS
    )

    context = assembler.assemble(USER_ID, as_of=AS_OF)

    assert context.training.available is True
    assert context.training.state == "no_active_program"
    assert context.training.program_name is None
    assert context.training.today_exercises == []


def test_caps_goals_sessions_and_progress_entries(assembler, services):
    _stub_complete_profile(services)
    services.goal_service.list_goals.return_value = _page(
        [_goal(i) for i in range(10)], limit=MAX_ACTIVE_GOALS
    )
    services.workout_log_service.list_history.return_value = _page(
        [_session(i) for i in range(10)], limit=MAX_RECENT_SESSIONS
    )
    services.progress_service.list_progress.return_value = _page(
        [_progress_entry(i) for i in range(12)], limit=MAX_PROGRESS_ENTRIES
    )

    context = assembler.assemble(USER_ID, as_of=AS_OF)

    assert len(context.goals) == MAX_ACTIVE_GOALS
    assert len(context.training.recent_sessions) == MAX_RECENT_SESSIONS
    assert len(context.progress) == MAX_PROGRESS_ENTRIES
    services.goal_service.list_goals.assert_called_once_with(
        USER_ID, status=GoalStatus.ACTIVE, limit=MAX_ACTIVE_GOALS, offset=0
    )
    services.workout_log_service.list_history.assert_called_once_with(
        USER_ID, limit=MAX_RECENT_SESSIONS, offset=0
    )
    services.progress_service.list_progress.assert_called_once_with(
        USER_ID, limit=MAX_PROGRESS_ENTRIES, offset=0
    )


def test_serialized_context_omits_secrets_and_identifiers(assembler, services):
    _stub_complete_profile(services)

    payload = _serialized(assembler.assemble(USER_ID, as_of=AS_OF))

    assert SECRET_EMAIL not in payload
    assert SECRET_HASH not in payload
    assert "secret_username" not in payload
    assert "Hidden" not in payload
    assert str(USER_ID) not in payload
    assert "hashed_password" not in payload
    assert "is_superuser" not in payload
    assert "email" not in payload
    assert _UUID_RE.search(payload) is None


def test_missing_user_still_returns_a_context(assembler, services):
    _stub_complete_profile(services)
    services.user_service.get_user.side_effect = UserNotFoundError("User not found.")

    context = assembler.assemble(USER_ID, as_of=AS_OF)

    assert context.profile.display_name is None
    assert context.training.available is True


def test_progress_list_is_used_instead_of_the_analyzer(assembler, services):
    _stub_complete_profile(services)

    assembler.assemble(USER_ID, as_of=AS_OF)

    services.progress_service.list_progress.assert_called_once()
    services.progress_service.get_progress_summary.assert_not_called()
