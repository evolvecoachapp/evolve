"""Seed the default beginner program assigned on first workout access.

Run after the exercise catalog seed:

    python database/seeds/seed_exercises.py
    python database/seeds/seed_default_program.py

Idempotent: skips creation when a program with slug ``beginner-foundation``
already exists. Uses repository inserts with stable slugs so
``Settings.default_program_slug`` resolves reliably.
"""

import sys
import uuid
from pathlib import Path

_SEEDS_DIR = Path(__file__).resolve().parent
if str(_SEEDS_DIR) not in sys.path:
    sys.path.insert(0, str(_SEEDS_DIR))

from _bootstrap import bootstrap_backend  # noqa: E402

bootstrap_backend()

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
    for order_index, (exercise_name, target_sets, reps_min, reps_max, rest_seconds) in enumerate(
        exercise_prescriptions
    ):
        db = workout_repository.db
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


def seed_default_program() -> None:
    """Insert the default beginner program, workouts, and schedule if absent."""
    db = SessionLocal()
    try:
        program_repository = ProgramRepository(db)
        workout_repository = WorkoutRepository(db)
        exercise_repository = ExerciseRepository(db)

        if program_repository.get_by_slug(DEFAULT_PROGRAM_SLUG) is not None:
            print(f"Default program '{DEFAULT_PROGRAM_SLUG}' already exists — skipping.")
            return

        workout_a = _create_workout(
            workout_repository,
            exercise_repository,
            name="Beginner Full Body A",
            slug=WORKOUT_A_SLUG,
            exercise_prescriptions=WORKOUT_A_EXERCISES,
        )
        workout_b = _create_workout(
            workout_repository,
            exercise_repository,
            name="Beginner Full Body B",
            slug=WORKOUT_B_SLUG,
            exercise_prescriptions=WORKOUT_B_EXERCISES,
        )

        program = Program(
            name="EVOLVE Beginner Foundation",
            slug=DEFAULT_PROGRAM_SLUG,
            description=(
                "A 4-week introduction to full-body training with manageable "
                "volume and beginner-friendly exercise selections."
            ),
            duration_weeks=4,
            goal=ProgramGoal.GENERAL_FITNESS,
            difficulty_level=DifficultyLevel.BEGINNER,
            status=ProgramStatus.PUBLISHED,
        )
        program_repository.create(program)

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
        program_repository.add_day(day_1)
        program_repository.add_day(day_2)
        program_repository.add_day(day_3)

        db.commit()
        print(f"Seeded default program '{DEFAULT_PROGRAM_SLUG}' with 2 training days.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_default_program()
