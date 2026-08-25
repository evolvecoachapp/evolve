"""Seed and reconcile the default beginner program assigned on first workout access.

Run after the exercise catalog seed:

    python database/seeds/seed_exercises.py
    python database/seeds/seed_default_program.py

Idempotent ensure: safe on a fresh database and on a production database
where ``beginner-foundation`` already exists with only week-1 days 1–3.
Missing ``ProgramDay`` rows are inserted; existing days, workouts,
assignments, and workout logs are never duplicated, updated, or deleted.
Uses repository inserts with stable slugs so
``Settings.default_program_slug`` resolves reliably.
"""

from __future__ import annotations

import sys
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

_SEEDS_DIR = Path(__file__).resolve().parent
if str(_SEEDS_DIR) not in sys.path:
    sys.path.insert(0, str(_SEEDS_DIR))


def _prepare_imports() -> None:
    """Load backend ``app`` when running as a CLI script from the repo root."""
    try:
        import app  # noqa: F401
    except ImportError:
        from _bootstrap import bootstrap_backend

        bootstrap_backend()


_prepare_imports()

from sqlalchemy.orm import Session  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.db.database import SessionLocal  # noqa: E402
from app.models.exercise import DifficultyLevel  # noqa: E402
from app.models.program import Program, ProgramDay, ProgramGoal, ProgramStatus  # noqa: E402
from app.models.workout import Workout, WorkoutExercise  # noqa: E402
from app.repositories.exercise_repository import ExerciseRepository  # noqa: E402
from app.repositories.program_repository import ProgramRepository  # noqa: E402
from app.repositories.workout_repository import WorkoutRepository  # noqa: E402
from app.utils.text import slugify  # noqa: E402

DEFAULT_PROGRAM_SLUG = settings.default_program_slug
WORKOUT_A_SLUG = "beginner-full-body-a"
WORKOUT_B_SLUG = "beginner-full-body-b"
DURATION_WEEKS = 4

WorkoutKey = Literal["A", "B"]

# (week_number, day_number, label, workout_key) — workout_key is None for rest.
ScheduleSlot = tuple[int, int, str, WorkoutKey | None]


def _week_slots(week_number: int, first: WorkoutKey) -> tuple[ScheduleSlot, ...]:
    """A/B + rest microcycle: train / rest / train / rest / train / rest / rest."""
    second: WorkoutKey = "B" if first == "A" else "A"
    pattern: tuple[WorkoutKey | None, ...] = (first, None, second, None, first, None, None)
    labels: dict[WorkoutKey, str] = {"A": "Full Body A", "B": "Full Body B"}
    return tuple(
        (
            week_number,
            day_number,
            "Rest" if key is None else labels[key],
            key,
        )
        for day_number, key in enumerate(pattern, start=1)
    )


# Week 1: A / Rest / B / Rest / A / Rest / Rest
# Week 2: B / Rest / A / Rest / B / Rest / Rest
# Week 3: A / Rest / B / Rest / A / Rest / Rest
# Week 4: B / Rest / A / Rest / B / Rest / Rest
BEGINNER_FOUNDATION_SCHEDULE: tuple[ScheduleSlot, ...] = (
    *_week_slots(1, "A"),
    *_week_slots(2, "B"),
    *_week_slots(3, "A"),
    *_week_slots(4, "B"),
)

# (exercise_name, target_sets, target_reps_min, target_reps_max, rest_seconds)
WORKOUT_A_EXERCISES: list[tuple[str, int, int, int, int]] = [
    ("Goblet Squat", 3, 8, 12, 90),
    ("Push-Up", 3, 8, 15, 60),
    ("Lat Pulldown", 3, 8, 12, 90),
    ("Plank", 3, 30, 45, 45),
]

WORKOUT_B_EXERCISES: list[tuple[str, int, int, int, int]] = [
    ("Dumbbell Shoulder Press", 3, 8, 12, 90),
    ("Leg Press", 3, 10, 12, 90),
    ("Dumbbell Bicep Curl", 3, 10, 12, 60),
    ("Plank", 3, 30, 45, 45),
]


@dataclass(frozen=True)
class DefaultProgramSeedReport:
    """Outcome of an idempotent ensure/reconcile pass."""

    program_id: uuid.UUID
    program_created: bool
    workout_a_id: uuid.UUID
    workout_a_created: bool
    workout_b_id: uuid.UUID
    workout_b_created: bool
    days_added: int
    days_total: int


def _exercise_id_by_name(exercise_repository: ExerciseRepository, name: str) -> uuid.UUID:
    exercise = exercise_repository.get_by_slug(slugify(name))
    if exercise is None:
        raise RuntimeError(
            f"Exercise '{name}' is missing from the catalog. "
            "Run database/seeds/seed_exercises.py first."
        )
    return exercise.id


def _create_workout(
    workout_repository: WorkoutRepository,
    exercise_repository: ExerciseRepository,
    *,
    name: str,
    slug: str,
    exercise_prescriptions: list[tuple[str, int, int, int, int]],
) -> Workout:
    workout = Workout(
        name=name,
        slug=slug,
        estimated_duration_minutes=45,
        is_active=True,
    )
    workout_repository.create(workout)
    db = workout_repository.db
    for order_index, (exercise_name, target_sets, reps_min, reps_max, rest_seconds) in enumerate(
        exercise_prescriptions
    ):
        db.add(
            WorkoutExercise(
                workout_id=workout.id,
                exercise_id=_exercise_id_by_name(exercise_repository, exercise_name),
                order_index=order_index,
                target_sets=target_sets,
                target_reps_min=reps_min,
                target_reps_max=reps_max,
                rest_seconds=rest_seconds,
            )
        )
        db.flush()
    return workout


def _get_or_create_workout(
    workout_repository: WorkoutRepository,
    exercise_repository: ExerciseRepository,
    *,
    name: str,
    slug: str,
    exercise_prescriptions: list[tuple[str, int, int, int, int]],
) -> tuple[Workout, bool]:
    existing = workout_repository.get_by_slug(slug)
    if existing is not None:
        return existing, False
    return (
        _create_workout(
            workout_repository,
            exercise_repository,
            name=name,
            slug=slug,
            exercise_prescriptions=exercise_prescriptions,
        ),
        True,
    )


def reconcile_program_days(
    program_repository: ProgramRepository,
    *,
    program_id: uuid.UUID,
    workout_a_id: uuid.UUID,
    workout_b_id: uuid.UUID,
    schedule: tuple[ScheduleSlot, ...] = BEGINNER_FOUNDATION_SCHEDULE,
) -> int:
    """Insert missing ``(week_number, day_number)`` slots; never update or delete.

    Existing production week-1 days 1–3 already match this schedule, so they
    are left untouched (including their ids, which assignments may reference).
    Returns the number of rows inserted.
    """
    workout_ids: dict[WorkoutKey, uuid.UUID] = {"A": workout_a_id, "B": workout_b_id}
    added = 0
    for week_number, day_number, label, workout_key in schedule:
        if program_repository.exists_day(program_id, week_number, day_number):
            continue
        program_repository.add_day(
            ProgramDay(
                program_id=program_id,
                week_number=week_number,
                day_number=day_number,
                label=label,
                workout_id=None if workout_key is None else workout_ids[workout_key],
            )
        )
        added += 1
    return added


def ensure_default_program(db: Session) -> DefaultProgramSeedReport:
    """Create or expand ``beginner-foundation`` to the full 4-week schedule.

    Reuses existing workouts and the existing program row when present.
    Does not mutate ``ProgramAssignment`` cursors or ``WorkoutLog`` rows.
    Caller owns the transaction boundary (this method only flushes).
    """
    program_repository = ProgramRepository(db)
    workout_repository = WorkoutRepository(db)
    exercise_repository = ExerciseRepository(db)

    workout_a, workout_a_created = _get_or_create_workout(
        workout_repository,
        exercise_repository,
        name="Beginner Full Body A",
        slug=WORKOUT_A_SLUG,
        exercise_prescriptions=WORKOUT_A_EXERCISES,
    )
    workout_b, workout_b_created = _get_or_create_workout(
        workout_repository,
        exercise_repository,
        name="Beginner Full Body B",
        slug=WORKOUT_B_SLUG,
        exercise_prescriptions=WORKOUT_B_EXERCISES,
    )

    program = program_repository.get_by_slug(DEFAULT_PROGRAM_SLUG)
    program_created = False
    if program is None:
        program = Program(
            name="EVOLVE Beginner Foundation",
            slug=DEFAULT_PROGRAM_SLUG,
            description=(
                "A 4-week introduction to full-body training with manageable "
                "volume and beginner-friendly exercise selections."
            ),
            duration_weeks=DURATION_WEEKS,
            goal=ProgramGoal.GENERAL_FITNESS,
            difficulty_level=DifficultyLevel.BEGINNER,
            status=ProgramStatus.PUBLISHED,
        )
        program_repository.create(program)
        program_created = True
    elif program.duration_weeks < DURATION_WEEKS:
        # Cursor traversal caps at duration_weeks; never shrink an existing value.
        program.duration_weeks = DURATION_WEEKS
        program_repository.update(program)

    days_added = reconcile_program_days(
        program_repository,
        program_id=program.id,
        workout_a_id=workout_a.id,
        workout_b_id=workout_b.id,
    )
    days_total = len(program_repository.list_days(program.id))
    return DefaultProgramSeedReport(
        program_id=program.id,
        program_created=program_created,
        workout_a_id=workout_a.id,
        workout_a_created=workout_a_created,
        workout_b_id=workout_b.id,
        workout_b_created=workout_b_created,
        days_added=days_added,
        days_total=days_total,
    )


def _print_report(report: DefaultProgramSeedReport) -> None:
    program_state = "created" if report.program_created else "reused"
    workout_a_state = "created" if report.workout_a_created else "reused"
    workout_b_state = "created" if report.workout_b_created else "reused"
    print(
        f"Default program '{DEFAULT_PROGRAM_SLUG}' {program_state} "
        f"(workout A {workout_a_state}, workout B {workout_b_state}). "
        f"Added {report.days_added} program day(s); {report.days_total} total."
    )


def seed_default_program() -> None:
    """CLI wrapper: open a session, ensure the program, commit or roll back."""
    db = SessionLocal()
    try:
        report = ensure_default_program(db)
        db.commit()
        _print_report(report)
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_default_program()
