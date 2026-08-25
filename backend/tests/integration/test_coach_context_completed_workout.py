"""Prove a completed WorkoutLog is visible to CoachContext.

Device testing showed Finish persisting (HTTP 200) while the next Coach
turn claimed it could not see the session. This file exercises the real
service stack against PostgreSQL: start -> log a set -> finish (which
advances the beginner-style train/rest cursor) -> assemble CoachContext.
"""

import uuid
from decimal import Decimal

import pytest
from sqlalchemy.orm import Session

from app.ai.coach_context import CoachContextAssembler
from app.ai.llm_provider import get_llm_provider
from app.ai.progress_analyzer import ProgressAnalyzer
from app.models.exercise import DifficultyLevel, Exercise, ExerciseCategory
from app.models.program import (
    AssignmentStatus,
    Program,
    ProgramAssignment,
    ProgramDay,
    ProgramGoal,
    ProgramStatus,
)
from app.models.user import User
from app.models.workout import Workout, WorkoutExercise
from app.models.workout_log import WorkoutLogStatus
from app.repositories.exercise_repository import ExerciseRepository
from app.repositories.goal_repository import GoalRepository
from app.repositories.meal_repository import MealRepository
from app.repositories.progress_repository import ProgressRepository
from app.repositories.program_repository import ProgramRepository
from app.repositories.recovery_repository import RecoveryCheckInRepository
from app.repositories.user_repository import UserRepository
from app.repositories.workout_log_repository import WorkoutLogRepository
from app.repositories.workout_repository import WorkoutRepository
from app.schemas.workout_log import WorkoutLogFinish, WorkoutLogStart, WorkoutSetLogCreate
from app.services.goal_service import GoalService
from app.services.nutrition_service import NutritionService
from app.services.progress_service import ProgressService
from app.services.recovery_service import RecoveryService
from app.services.user_service import UserService
from app.services.workout_log_service import WorkoutLogService
from app.services.workout_resolution_service import WorkoutResolutionService


@pytest.fixture()
def catalog_exercise(db_session: Session) -> Exercise:
    exercise = Exercise(
        name=f"Goblet Squat {uuid.uuid4().hex[:8]}",
        slug=f"goblet-squat-{uuid.uuid4().hex[:8]}",
        difficulty_level=DifficultyLevel.BEGINNER,
        category=ExerciseCategory.COMPOUND,
    )
    db_session.add(exercise)
    db_session.commit()
    db_session.refresh(exercise)
    return exercise


@pytest.fixture()
def program_with_rest_after_training(
    db_session: Session, test_user: User, catalog_exercise: Exercise
) -> dict:
    """Mirrors production beginner-foundation: day 1 train, day 2 rest."""
    workout = Workout(
        name="Full Body A",
        slug=f"full-body-a-{uuid.uuid4().hex[:8]}",
        estimated_duration_minutes=45,
    )
    db_session.add(workout)
    db_session.flush()
    db_session.add(
        WorkoutExercise(
            workout_id=workout.id,
            exercise_id=catalog_exercise.id,
            order_index=0,
            target_sets=3,
            target_reps_min=8,
            target_reps_max=12,
            rest_seconds=90,
        )
    )

    program = Program(
        name=f"Coach Context Program {uuid.uuid4().hex[:8]}",
        slug=f"coach-context-{uuid.uuid4().hex[:8]}",
        duration_weeks=1,
        goal=ProgramGoal.GENERAL_FITNESS,
        difficulty_level=DifficultyLevel.BEGINNER,
        status=ProgramStatus.PUBLISHED,
    )
    db_session.add(program)
    db_session.flush()

    day_1 = ProgramDay(
        program_id=program.id,
        week_number=1,
        day_number=1,
        label="Full Body A",
        workout_id=workout.id,
    )
    day_2 = ProgramDay(
        program_id=program.id,
        week_number=1,
        day_number=2,
        label="Rest",
        workout_id=None,
    )
    db_session.add_all([day_1, day_2])
    db_session.flush()

    assignment = ProgramAssignment(
        program_id=program.id,
        user_id=test_user.id,
        status=AssignmentStatus.ACTIVE,
        current_week_number=1,
        current_day_number=1,
        current_program_day_id=day_1.id,
    )
    db_session.add(assignment)
    db_session.commit()
    db_session.refresh(assignment)
    db_session.refresh(workout)

    return {
        "program": program,
        "workout": workout,
        "assignment": assignment,
        "exercise": catalog_exercise,
    }


def _make_assembler(db: Session) -> CoachContextAssembler:
    """Wire CoachContextAssembler the same way production DI does."""
    resolution = WorkoutResolutionService(
        ProgramRepository(db),
        WorkoutRepository(db),
        WorkoutLogRepository(db),
    )
    return CoachContextAssembler(
        UserService(UserRepository(db)),
        GoalService(GoalRepository(db)),
        resolution,
        WorkoutLogService(
            WorkoutLogRepository(db),
            WorkoutRepository(db),
            ExerciseRepository(db),
            ProgramRepository(db),
            resolution,
        ),
        NutritionService(MealRepository(db), UserRepository(db)),
        RecoveryService(RecoveryCheckInRepository(db), WorkoutLogRepository(db)),
        ProgressService(
            ProgressRepository(db),
            GoalRepository(db),
            ExerciseRepository(db),
            ProgressAnalyzer(get_llm_provider()),
        ),
    )


def test_coach_context_sees_just_completed_workout_with_performed_sets(
    db_session: Session, test_user: User, program_with_rest_after_training: dict
) -> None:
    fixture = program_with_rest_after_training
    assembler = _make_assembler(db_session)
    log_service = assembler._workout_log_service

    started = log_service.start_workout(
        test_user.id,
        WorkoutLogStart(
            workout_id=fixture["workout"].id,
            program_assignment_id=fixture["assignment"].id,
        ),
    )
    assert started.status == WorkoutLogStatus.IN_PROGRESS
    assert started.log_exercises, "templated start must seed log exercises"
    log_exercise = started.log_exercises[0]

    logged_set = log_service.log_set(
        test_user.id,
        started.id,
        log_exercise.id,
        WorkoutSetLogCreate(weight_kg=Decimal("24.00"), reps=10, rpe=Decimal("7.0")),
    )
    assert logged_set.set_number == 1

    finished = log_service.finish_workout(
        test_user.id, started.id, WorkoutLogFinish()
    )
    assert finished.status == WorkoutLogStatus.COMPLETED
    assert finished.completed_at is not None

    context = assembler.assemble(test_user.id)
    training = context.training
    payload = training.model_dump(mode="json")

    assert training.available is True, payload
    assert training.state == "rest_day", payload
    assert training.today_log_status == "completed", payload
    assert training.recent_sessions, payload

    session = training.recent_sessions[0]
    assert session.status == "completed", payload
    assert session.workout_name == "Full Body A", payload
    assert session.exercises, payload
    assert session.exercises[0].name == fixture["exercise"].name, payload
    assert session.exercises[0].sets, payload
    performed = session.exercises[0].sets[0]
    assert performed.reps == 10, payload
    assert performed.weight_kg == "24.00", payload
    assert performed.rpe == "7.0", payload
