"""Shared FastAPI dependencies for resolving request-scoped services.

Kept separate from ``app.security.dependencies`` (which is exclusively for
authentication concerns) — this module wires up domain services that have
nothing to do with auth, starting with the Exercise catalog domain.
"""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.ai.coach_engines import NutritionCoachEngine, RecoveryCoachEngine, WorkoutCoachEngine
from app.ai.contracts import Intent
from app.ai.llm_provider import get_llm_provider
from app.ai.memory_engine import MemoryEngine
from app.ai.orchestrator import AIOrchestrator
from app.db.database import get_db
from app.repositories.chat_repository import ChatRepository
from app.repositories.equipment_repository import EquipmentRepository
from app.repositories.exercise_repository import ExerciseRepository
from app.repositories.meal_repository import MealRepository
from app.repositories.muscle_group_repository import MuscleGroupRepository
from app.repositories.program_repository import ProgramRepository
from app.repositories.recovery_repository import RecoveryCheckInRepository
from app.repositories.user_repository import UserRepository
from app.repositories.workout_log_repository import WorkoutLogRepository
from app.repositories.workout_repository import WorkoutRepository
from app.services.catalog_service import CatalogService
from app.services.coach_service import CoachService
from app.services.exercise_service import ExerciseService
from app.services.nutrition_service import NutritionService
from app.services.recovery_service import RecoveryService
from app.services.workout_log_service import WorkoutLogService
from app.services.workout_resolution_service import WorkoutResolutionService
from app.services.workout_service import WorkoutService


def get_catalog_service(db: Session = Depends(get_db)) -> CatalogService:
    """Resolve a :class:`CatalogService` bound to a request-scoped session.

    Shared by every route that needs muscle group/equipment catalog logic,
    so the repository/service wiring exists in exactly one place.
    """
    return CatalogService(MuscleGroupRepository(db), EquipmentRepository(db))


def get_exercise_service(
    db: Session = Depends(get_db),
    catalog_service: CatalogService = Depends(get_catalog_service),
) -> ExerciseService:
    """Resolve an :class:`ExerciseService` bound to a request-scoped session."""
    return ExerciseService(ExerciseRepository(db), catalog_service)


def get_workout_service(db: Session = Depends(get_db)) -> WorkoutService:
    """Resolve a :class:`WorkoutService` bound to a request-scoped session."""
    return WorkoutService(ProgramRepository(db), WorkoutRepository(db))


def get_workout_resolution_service(db: Session = Depends(get_db)) -> WorkoutResolutionService:
    """Resolve a :class:`WorkoutResolutionService` bound to a request-scoped session."""
    return WorkoutResolutionService(
        ProgramRepository(db),
        WorkoutRepository(db),
        WorkoutLogRepository(db),
    )


def get_workout_log_service(
    db: Session = Depends(get_db),
    workout_resolution_service: WorkoutResolutionService = Depends(get_workout_resolution_service),
) -> WorkoutLogService:
    """Resolve a :class:`WorkoutLogService` bound to a request-scoped session."""
    return WorkoutLogService(
        WorkoutLogRepository(db),
        WorkoutRepository(db),
        ExerciseRepository(db),
        ProgramRepository(db),
        workout_resolution_service,
    )


def get_nutrition_service(db: Session = Depends(get_db)) -> NutritionService:
    """Resolve a :class:`NutritionService` bound to a request-scoped session."""
    return NutritionService(MealRepository(db), UserRepository(db))


def get_recovery_service(db: Session = Depends(get_db)) -> RecoveryService:
    """Resolve a :class:`RecoveryService` bound to a request-scoped session."""
    return RecoveryService(RecoveryCheckInRepository(db), WorkoutLogRepository(db))


def get_coach_service(
    db: Session = Depends(get_db),
    workout_resolution_service: WorkoutResolutionService = Depends(get_workout_resolution_service),
    nutrition_service: NutritionService = Depends(get_nutrition_service),
    recovery_service: RecoveryService = Depends(get_recovery_service),
) -> CoachService:
    """Resolve a :class:`CoachService` bound to a request-scoped session.

    Wires the :class:`~app.ai.orchestrator.AIOrchestrator` with the three
    Sprint 4.5 engine adapters (``app/ai/coach_engines.py`` — see Decision
    017 in ``docs/DECISIONS.md``) registered for
    :attr:`~app.ai.contracts.Intent.WORKOUT`/
    :attr:`~app.ai.contracts.Intent.NUTRITION`/
    :attr:`~app.ai.contracts.Intent.RECOVERY`.
    :attr:`~app.ai.contracts.Intent.GENERAL`/
    :attr:`~app.ai.contracts.Intent.PROGRESS` have no engine yet and fall
    back to the LLM provider (still ``MockLLMProvider`` — real vendor
    integration is Sprint 4.6).
    """
    chat_repository = ChatRepository(db)
    memory_engine = MemoryEngine(chat_repository)
    engines = {
        Intent.WORKOUT: WorkoutCoachEngine(workout_resolution_service),
        Intent.NUTRITION: NutritionCoachEngine(nutrition_service),
        Intent.RECOVERY: RecoveryCoachEngine(recovery_service),
    }
    orchestrator = AIOrchestrator(memory_engine, get_llm_provider(), engines=engines)
    return CoachService(orchestrator, chat_repository)
