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
from app.ai.progress_analyzer import ProgressAnalyzer
from app.db.database import get_db
from app.repositories.chat_repository import ChatRepository
from app.repositories.equipment_repository import EquipmentRepository
from app.repositories.exercise_repository import ExerciseRepository
from app.repositories.goal_repository import GoalRepository
from app.repositories.meal_repository import MealRepository
from app.repositories.muscle_group_repository import MuscleGroupRepository
from app.repositories.program_repository import ProgramRepository
from app.repositories.progress_repository import ProgressRepository
from app.repositories.recovery_repository import RecoveryCheckInRepository
from app.repositories.user_repository import UserRepository
from app.repositories.workout_log_repository import WorkoutLogRepository
from app.repositories.workout_repository import WorkoutRepository
from app.services.catalog_service import CatalogService
from app.services.coach_service import CoachService
from app.services.exercise_service import ExerciseService
from app.services.goal_service import GoalService
from app.services.nutrition_service import NutritionService
from app.services.progress_service import ProgressService
from app.services.recovery_service import RecoveryService
from app.services.user_service import UserService
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


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    """Resolve a :class:`UserService` bound to a request-scoped session."""
    return UserService(UserRepository(db))


def get_goal_repository(db: Session = Depends(get_db)) -> GoalRepository:
    """Resolve a :class:`GoalRepository` bound to a request-scoped session."""
    return GoalRepository(db)


def get_goal_service(
    goal_repository: GoalRepository = Depends(get_goal_repository),
) -> GoalService:
    """Resolve a :class:`GoalService` bound to a request-scoped session."""
    return GoalService(goal_repository)


def get_progress_service(
    db: Session = Depends(get_db),
    goal_repository: GoalRepository = Depends(get_goal_repository),
) -> ProgressService:
    """Resolve a :class:`ProgressService` bound to a request-scoped session.

    Wires a fresh :class:`~app.ai.progress_analyzer.ProgressAnalyzer` around
    the configured :func:`~app.ai.llm_provider.get_llm_provider` — not
    registered on :class:`~app.ai.orchestrator.AIOrchestrator`'s ``engines``
    this sprint (see Decision 023 in ``docs/DECISIONS.md``; matches how
    Nutrition/Recovery shipped decoupled in Sprints 4.3/4.4 before their
    Coach binding landed in 4.5).
    """
    return ProgressService(
        ProgressRepository(db),
        goal_repository,
        ExerciseRepository(db),
        ProgressAnalyzer(get_llm_provider()),
    )


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
    back to the configured :func:`~app.ai.llm_provider.get_llm_provider`
    (``MockLLMProvider`` by default, or a real
    :class:`~app.ai.llm_provider.OpenAICompatibleLLMProvider` when
    ``AI_PROVIDER=openai_compatible`` — see Decision 020 in
    ``docs/DECISIONS.md``), with graceful degradation on
    :class:`~app.ai.llm_provider.LLMProviderError` (Decision 021).
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
