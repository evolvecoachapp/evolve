"""Integration tests for the beginner-foundation 4-week program expansion seed.

Exercises ``ensure_default_program`` / ``reconcile_program_days`` against the
real PostgreSQL instance (see ``tests/conftest.py`` for transaction-rollback
isolation). Isolated cases use unique program/workout slugs so they do not
depend on whether production ``beginner-foundation`` is already present.
"""

from __future__ import annotations

import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

import pytest
from sqlalchemy.orm import Session

from app.models.exercise import DifficultyLevel, Exercise, ExerciseCategory
from app.models.program import AssignmentStatus, Program, ProgramAssignment, ProgramDay, ProgramGoal, ProgramStatus
from app.models.user import User
from app.models.workout import Workout
from app.models.workout_log import WorkoutLog, WorkoutLogStatus
from app.repositories.program_repository import ProgramRepository
from app.repositories.workout_log_repository import WorkoutLogRepository
from app.repositories.workout_repository import WorkoutRepository
from app.schemas.workout_resolution import WorkoutResolutionState
from app.services.workout_resolution_service import WorkoutResolutionService
from app.utils.text import slugify

_SEEDS_DIR = Path(__file__).resolve().parents[3] / "database" / "seeds"
if str(_SEEDS_DIR) not in sys.path:
    sys.path.insert(0, str(_SEEDS_DIR))

from seed_default_program import (  # noqa: E402
    BEGINNER_FOUNDATION_SCHEDULE,
    DEFAULT_PROGRAM_SLUG,
    WORKOUT_A_EXERCISES,
    WORKOUT_B_EXERCISES,
    ensure_default_program,
    reconcile_program_days,
)

CATALOG_EXERCISE_NAMES = sorted(
    {name for name, *_ in (*WORKOUT_A_EXERCISES, *WORKOUT_B_EXERCISES)}
)


def _schedule_map() -> dict[tuple[int, int], tuple[str, str | None]]:
    return {
        (week, day): (label, workout_key)
        for week, day, label, workout_key in BEGINNER_FOUNDATION_SCHEDULE
    }


def _make_workout(db_session: Session, name: str) -> Workout:
    workout = Workout(
        name=name,
        slug=f"{slugify(name)}-{uuid.uuid4().hex[:8]}",
        estimated_duration_minutes=45,
        is_active=True,
    )
    db_session.add(workout)
    db_session.flush()
    return workout


def _make_program(db_session: Session, *, duration_weeks: int = 4) -> Program:
    program = Program(
        name=f"Beginner Foundation Test {uuid.uuid4().hex[:8]}",
        slug=f"beginner-foundation-test-{uuid.uuid4().hex[:8]}",
        duration_weeks=duration_weeks,
        goal=ProgramGoal.GENERAL_FITNESS,
        difficulty_level=DifficultyLevel.BEGINNER,
        status=ProgramStatus.PUBLISHED,
    )
    db_session.add(program)
    db_session.flush()
    return program


def _add_production_like_week1(
    db_session: Session,
    program: Program,
    workout_a: Workout,
    workout_b: Workout,
) -> tuple[ProgramDay, ProgramDay, ProgramDay]:
    day_1 = ProgramDay(
        program_id=program.id,
        week_number=1,
        day_number=1,
        label="Full Body A",
        workout_id=workout_a.id,
    )
    day_2 = ProgramDay(
        program_id=program.id,
        week_number=1,
        day_number=2,
        label="Rest",
        workout_id=None,
    )
    day_3 = ProgramDay(
        program_id=program.id,
        week_number=1,
        day_number=3,
        label="Full Body B",
        workout_id=workout_b.id,
    )
    db_session.add_all([day_1, day_2, day_3])
    db_session.flush()
    return day_1, day_2, day_3


def _ensure_catalog_exercises(db_session: Session) -> None:
    existing_slugs = {
        row[0]
        for row in db_session.query(Exercise.slug)
        .filter(Exercise.slug.in_([slugify(name) for name in CATALOG_EXERCISE_NAMES]))
        .all()
    }
    for name in CATALOG_EXERCISE_NAMES:
        slug = slugify(name)
        if slug in existing_slugs:
            continue
        db_session.add(
            Exercise(
                name=name,
                slug=slug,
                difficulty_level=DifficultyLevel.BEGINNER,
                category=ExerciseCategory.COMPOUND,
            )
        )
    db_session.flush()


def _assert_schedule(
    days: list[ProgramDay],
    workout_a_id: uuid.UUID,
    workout_b_id: uuid.UUID,
) -> None:
    by_slot = {(day.week_number, day.day_number): day for day in days}
    assert len(by_slot) == len(days), "duplicate ProgramDay (week, day) slots"
    expected = _schedule_map()
    assert set(by_slot) >= set(expected)
    for slot, (label, workout_key) in expected.items():
        day = by_slot[slot]
        assert day.label == label
        if workout_key == "A":
            assert day.workout_id == workout_a_id
        elif workout_key == "B":
            assert day.workout_id == workout_b_id
        else:
            assert day.workout_id is None


def test_schedule_covers_four_weeks_matching_production_week1() -> None:
    slots = [(week, day) for week, day, _, _ in BEGINNER_FOUNDATION_SCHEDULE]
    assert len(BEGINNER_FOUNDATION_SCHEDULE) == 28
    assert len(set(slots)) == 28
    assert {(week, day) for week, day, _, _ in BEGINNER_FOUNDATION_SCHEDULE} == {
        (week, day) for week in range(1, 5) for day in range(1, 8)
    }
    week1 = {
        day: key
        for week, day, _, key in BEGINNER_FOUNDATION_SCHEDULE
        if week == 1
    }
    assert week1[1] == "A"
    assert week1[2] is None
    assert week1[3] == "B"


def test_fresh_program_gets_all_expected_days(db_session: Session) -> None:
    workout_a = _make_workout(db_session, "Beginner Full Body A")
    workout_b = _make_workout(db_session, "Beginner Full Body B")
    program = _make_program(db_session)
    repository = ProgramRepository(db_session)

    added = reconcile_program_days(
        repository,
        program_id=program.id,
        workout_a_id=workout_a.id,
        workout_b_id=workout_b.id,
    )

    days = repository.list_days(program.id)
    assert added == 28
    assert len(days) == 28
    _assert_schedule(days, workout_a.id, workout_b.id)


def test_production_like_program_gets_missing_days_added(db_session: Session) -> None:
    workout_a = _make_workout(db_session, "Beginner Full Body A")
    workout_b = _make_workout(db_session, "Beginner Full Body B")
    program = _make_program(db_session)
    day_1, day_2, day_3 = _add_production_like_week1(
        db_session, program, workout_a, workout_b
    )
    repository = ProgramRepository(db_session)

    added = reconcile_program_days(
        repository,
        program_id=program.id,
        workout_a_id=workout_a.id,
        workout_b_id=workout_b.id,
    )

    days = repository.list_days(program.id)
    assert added == 25
    assert len(days) == 28
    assert repository.get_day(day_1.id) is not None
    assert repository.get_day(day_1.id).workout_id == workout_a.id
    assert repository.get_day(day_2.id).workout_id is None
    assert repository.get_day(day_3.id).workout_id == workout_b.id
    _assert_schedule(days, workout_a.id, workout_b.id)


def test_rerun_creates_no_duplicate_program_days(db_session: Session) -> None:
    workout_a = _make_workout(db_session, "Beginner Full Body A")
    workout_b = _make_workout(db_session, "Beginner Full Body B")
    program = _make_program(db_session)
    _add_production_like_week1(db_session, program, workout_a, workout_b)
    repository = ProgramRepository(db_session)

    first = reconcile_program_days(
        repository,
        program_id=program.id,
        workout_a_id=workout_a.id,
        workout_b_id=workout_b.id,
    )
    day_ids = {day.id for day in repository.list_days(program.id)}
    second = reconcile_program_days(
        repository,
        program_id=program.id,
        workout_a_id=workout_a.id,
        workout_b_id=workout_b.id,
    )

    days = repository.list_days(program.id)
    assert first == 25
    assert second == 0
    assert len(days) == 28
    assert {day.id for day in days} == day_ids
    assert len({(day.week_number, day.day_number) for day in days}) == 28


def test_existing_program_assignment_remains_valid(
    db_session: Session, test_user: User
) -> None:
    workout_a = _make_workout(db_session, "Beginner Full Body A")
    workout_b = _make_workout(db_session, "Beginner Full Body B")
    program = _make_program(db_session)
    day_1, _, _ = _add_production_like_week1(db_session, program, workout_a, workout_b)
    assignment = ProgramAssignment(
        program_id=program.id,
        user_id=test_user.id,
        status=AssignmentStatus.ACTIVE,
        current_week_number=1,
        current_day_number=1,
        current_program_day_id=day_1.id,
        cursor_exhausted=False,
    )
    db_session.add(assignment)
    db_session.flush()
    assignment_id = assignment.id
    cursor = (
        assignment.current_week_number,
        assignment.current_day_number,
        assignment.current_program_day_id,
        assignment.status,
        assignment.cursor_exhausted,
    )

    reconcile_program_days(
        ProgramRepository(db_session),
        program_id=program.id,
        workout_a_id=workout_a.id,
        workout_b_id=workout_b.id,
    )
    db_session.refresh(assignment)

    assert assignment.id == assignment_id
    assert (
        assignment.current_week_number,
        assignment.current_day_number,
        assignment.current_program_day_id,
        assignment.status,
        assignment.cursor_exhausted,
    ) == cursor
    assert ProgramRepository(db_session).get_day(day_1.id) is not None


def test_cursor_advances_through_all_four_weeks(
    db_session: Session, test_user: User
) -> None:
    workout_a = _make_workout(db_session, "Beginner Full Body A")
    workout_b = _make_workout(db_session, "Beginner Full Body B")
    program = _make_program(db_session)
    repository = ProgramRepository(db_session)
    reconcile_program_days(
        repository,
        program_id=program.id,
        workout_a_id=workout_a.id,
        workout_b_id=workout_b.id,
    )
    first_day = repository.get_first_day(program.id)
    assert first_day is not None
    assignment = ProgramAssignment(
        program_id=program.id,
        user_id=test_user.id,
        status=AssignmentStatus.ACTIVE,
        current_week_number=first_day.week_number,
        current_day_number=first_day.day_number,
        current_program_day_id=first_day.id,
        cursor_exhausted=False,
    )
    db_session.add(assignment)
    db_session.flush()

    service = WorkoutResolutionService(
        repository,
        WorkoutRepository(db_session),
        WorkoutLogRepository(db_session),
    )
    visited: list[tuple[int, int, WorkoutResolutionState]] = []
    for _ in range(len(BEGINNER_FOUNDATION_SCHEDULE)):
        result = service.resolve_current(test_user.id)
        assert result.state in (
            WorkoutResolutionState.TRAINING_DAY,
            WorkoutResolutionState.REST_DAY,
        )
        assert result.program_day is not None
        visited.append(
            (result.program_day.week_number, result.program_day.day_number, result.state)
        )
        if result.state == WorkoutResolutionState.REST_DAY:
            service.advance_past_rest_day(test_user.id)
        else:
            service.advance_after_action(test_user.id, assignment.id)

    assert visited[0] == (1, 1, WorkoutResolutionState.TRAINING_DAY)
    assert visited[-1] == (4, 7, WorkoutResolutionState.REST_DAY)
    assert {(week, day) for week, day, _ in visited} == {
        (week, day) for week, day, _, _ in BEGINNER_FOUNDATION_SCHEDULE
    }
    assert service.resolve_current(test_user.id).state == WorkoutResolutionState.PROGRAM_COMPLETE
    db_session.refresh(assignment)
    assert assignment.cursor_exhausted is True
    assert assignment.status == AssignmentStatus.ACTIVE


def test_existing_workout_logs_are_unchanged(
    db_session: Session, test_user: User
) -> None:
    workout_a = _make_workout(db_session, "Beginner Full Body A")
    workout_b = _make_workout(db_session, "Beginner Full Body B")
    program = _make_program(db_session)
    day_1, _, _ = _add_production_like_week1(db_session, program, workout_a, workout_b)
    assignment = ProgramAssignment(
        program_id=program.id,
        user_id=test_user.id,
        status=AssignmentStatus.ACTIVE,
        current_week_number=1,
        current_day_number=1,
        current_program_day_id=day_1.id,
    )
    db_session.add(assignment)
    db_session.flush()
    started_at = datetime(2026, 8, 1, 10, 0, tzinfo=timezone.utc)
    completed_at = datetime(2026, 8, 1, 10, 45, tzinfo=timezone.utc)
    log = WorkoutLog(
        user_id=test_user.id,
        program_assignment_id=assignment.id,
        workout_id=workout_a.id,
        status=WorkoutLogStatus.COMPLETED,
        notes="keep this production log",
        started_at=started_at,
        completed_at=completed_at,
        duration_actual_minutes=45,
    )
    db_session.add(log)
    db_session.flush()
    snapshot = (
        log.id,
        log.user_id,
        log.program_assignment_id,
        log.workout_id,
        log.status,
        log.notes,
        log.started_at,
        log.completed_at,
        log.duration_actual_minutes,
        log.deleted_at,
    )

    reconcile_program_days(
        ProgramRepository(db_session),
        program_id=program.id,
        workout_a_id=workout_a.id,
        workout_b_id=workout_b.id,
    )
    db_session.refresh(log)

    assert (
        log.id,
        log.user_id,
        log.program_assignment_id,
        log.workout_id,
        log.status,
        log.notes,
        log.started_at,
        log.completed_at,
        log.duration_actual_minutes,
        log.deleted_at,
    ) == snapshot
    assert (
        db_session.query(WorkoutLog)
        .filter(WorkoutLog.user_id == test_user.id)
        .count()
        == 1
    )


def test_ensure_default_program_is_idempotent_and_reuses_workouts(
    db_session: Session,
) -> None:
    _ensure_catalog_exercises(db_session)
    first = ensure_default_program(db_session)
    first_day_ids = {
        day.id for day in ProgramRepository(db_session).list_days(first.program_id)
    }
    second = ensure_default_program(db_session)
    days = ProgramRepository(db_session).list_days(first.program_id)

    assert first.program_id == second.program_id
    assert first.workout_a_id == second.workout_a_id
    assert first.workout_b_id == second.workout_b_id
    assert second.program_created is False
    assert second.workout_a_created is False
    assert second.workout_b_created is False
    assert second.days_added == 0
    assert second.days_total >= 28
    assert {day.id for day in days} == first_day_ids
    _assert_schedule(days, first.workout_a_id, first.workout_b_id)
    assert ProgramRepository(db_session).get_by_slug(DEFAULT_PROGRAM_SLUG) is not None


def test_ensure_default_program_expands_existing_beginner_foundation(
    db_session: Session,
) -> None:
    """Production-shaped ``beginner-foundation`` (3 days) receives the missing 25."""
    _ensure_catalog_exercises(db_session)
    existing = ProgramRepository(db_session).get_by_slug(DEFAULT_PROGRAM_SLUG)
    if existing is not None:
        pytest.skip(
            "Shared database already has beginner-foundation; "
            "isolated expansion is covered by test_production_like_program_gets_missing_days_added."
        )

    from seed_default_program import WORKOUT_A_SLUG, WORKOUT_B_SLUG

    workout_a = Workout(
        name="Beginner Full Body A",
        slug=WORKOUT_A_SLUG,
        estimated_duration_minutes=45,
        is_active=True,
    )
    workout_b = Workout(
        name="Beginner Full Body B",
        slug=WORKOUT_B_SLUG,
        estimated_duration_minutes=45,
        is_active=True,
    )
    db_session.add_all([workout_a, workout_b])
    db_session.flush()
    program = Program(
        name="EVOLVE Beginner Foundation",
        slug=DEFAULT_PROGRAM_SLUG,
        duration_weeks=4,
        goal=ProgramGoal.GENERAL_FITNESS,
        difficulty_level=DifficultyLevel.BEGINNER,
        status=ProgramStatus.PUBLISHED,
    )
    db_session.add(program)
    db_session.flush()
    _add_production_like_week1(db_session, program, workout_a, workout_b)

    report = ensure_default_program(db_session)

    assert report.program_created is False
    assert report.workout_a_created is False
    assert report.workout_b_created is False
    assert report.days_added == 25
    assert report.days_total == 28
    days = ProgramRepository(db_session).list_days(program.id)
    _assert_schedule(days, workout_a.id, workout_b.id)
