"""Integration test for :meth:`WorkoutLogRepository.get_training_load_summary`.

Runs against the real PostgreSQL instance (see ``tests/conftest.py`` for the
transaction-rollback isolation strategy), seeding ``WorkoutLog``/
``WorkoutLogExercise``/``WorkoutSetLog`` rows directly — there is no
authoring endpoint for these, mirroring how ``test_workout_logs_api.py``
seeds its ``Exercise`` fixture directly. Exercises the aggregation the
Recovery Engine depends on (see Decision 014 in ``docs/DECISIONS.md``) in
isolation from ``RecoveryService``.
"""

import uuid
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

import pytest
from sqlalchemy.orm import Session

from app.models.exercise import DifficultyLevel, Exercise, ExerciseCategory
from app.models.user import User
from app.models.workout_log import (
    WorkoutLog,
    WorkoutLogExercise,
    WorkoutLogStatus,
    WorkoutSetLog,
)
from app.repositories.workout_log_repository import WorkoutLogRepository

TODAY = date(2026, 1, 15)


@pytest.fixture()
def squat(db_session: Session) -> Exercise:
    exercise = Exercise(
        name=f"Squat {uuid.uuid4().hex[:8]}",
        slug=f"squat-{uuid.uuid4().hex[:8]}",
        difficulty_level=DifficultyLevel.INTERMEDIATE,
        category=ExerciseCategory.COMPOUND,
    )
    db_session.add(exercise)
    db_session.commit()
    db_session.refresh(exercise)
    return exercise


def _add_completed_session(
    db_session: Session,
    user: User,
    exercise: Exercise,
    *,
    completed_on: date,
    duration_minutes: int,
    rpe_values: list[Decimal | None],
) -> WorkoutLog:
    workout_log = WorkoutLog(
        user_id=user.id,
        status=WorkoutLogStatus.COMPLETED,
        started_at=datetime.combine(completed_on, datetime.min.time(), tzinfo=timezone.utc),
        completed_at=datetime.combine(completed_on, datetime.min.time(), tzinfo=timezone.utc)
        + timedelta(minutes=duration_minutes),
        duration_actual_minutes=duration_minutes,
    )
    db_session.add(workout_log)
    db_session.flush()

    log_exercise = WorkoutLogExercise(
        workout_log_id=workout_log.id,
        exercise_id=exercise.id,
        order_index=0,
        exercise_name_snapshot=exercise.name,
    )
    db_session.add(log_exercise)
    db_session.flush()

    for index, rpe in enumerate(rpe_values, start=1):
        db_session.add(
            WorkoutSetLog(
                workout_log_exercise_id=log_exercise.id,
                set_number=index,
                weight_kg=Decimal("100"),
                reps=5,
                rpe=rpe,
                is_warmup=False,
            )
        )
    db_session.commit()
    return workout_log


def test_summary_is_zeroed_when_no_logs_exist_in_window(
    db_session: Session, test_user: User
) -> None:
    repository = WorkoutLogRepository(db_session)

    summary = repository.get_training_load_summary(
        test_user.id, date_from=TODAY - timedelta(days=6), date_to=TODAY
    )

    assert summary["session_count"] == 0
    assert summary["total_duration_minutes"] == 0
    assert summary["avg_rpe"] is None


def test_summary_aggregates_completed_sessions_within_the_window(
    db_session: Session, test_user: User, squat: Exercise
) -> None:
    _add_completed_session(
        db_session,
        test_user,
        squat,
        completed_on=TODAY,
        duration_minutes=60,
        rpe_values=[Decimal("7"), Decimal("8")],
    )
    _add_completed_session(
        db_session,
        test_user,
        squat,
        completed_on=TODAY - timedelta(days=3),
        duration_minutes=45,
        rpe_values=[Decimal("6")],
    )
    # Outside the 7-day window entirely - must not be counted.
    _add_completed_session(
        db_session,
        test_user,
        squat,
        completed_on=TODAY - timedelta(days=10),
        duration_minutes=90,
        rpe_values=[Decimal("9")],
    )

    repository = WorkoutLogRepository(db_session)
    summary = repository.get_training_load_summary(
        test_user.id, date_from=TODAY - timedelta(days=6), date_to=TODAY
    )

    assert summary["session_count"] == 2
    assert summary["total_duration_minutes"] == 105
    # avg of 7, 8, 6 = 7.0
    assert summary["avg_rpe"] == Decimal("7.0000000000000000")


def test_summary_excludes_warmup_sets_and_uncompleted_sessions(
    db_session: Session, test_user: User, squat: Exercise
) -> None:
    # A COMPLETED session with a mix of warmup and working sets.
    session = _add_completed_session(
        db_session,
        test_user,
        squat,
        completed_on=TODAY,
        duration_minutes=50,
        rpe_values=[Decimal("5")],
    )
    log_exercise = session.log_exercises[0]
    db_session.add(
        WorkoutSetLog(
            workout_log_exercise_id=log_exercise.id,
            set_number=2,
            weight_kg=Decimal("40"),
            reps=10,
            rpe=Decimal("2"),
            is_warmup=True,
        )
    )
    # An IN_PROGRESS session in the same window must not be counted at all.
    in_progress = WorkoutLog(
        user_id=test_user.id,
        status=WorkoutLogStatus.IN_PROGRESS,
        started_at=datetime.now(timezone.utc),
        duration_actual_minutes=999,
    )
    db_session.add(in_progress)
    db_session.commit()

    repository = WorkoutLogRepository(db_session)
    summary = repository.get_training_load_summary(
        test_user.id, date_from=TODAY - timedelta(days=6), date_to=TODAY
    )

    assert summary["session_count"] == 1
    assert summary["total_duration_minutes"] == 50
    assert summary["avg_rpe"] == Decimal("5.0000000000000000")
