"""Shared FastAPI dependencies for resolving request-scoped services.

Kept separate from ``app.security.dependencies`` (which is exclusively for
authentication concerns) — this module wires up domain services that have
nothing to do with auth, starting with the Exercise catalog domain.
"""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.repositories.equipment_repository import EquipmentRepository
from app.repositories.exercise_repository import ExerciseRepository
from app.repositories.muscle_group_repository import MuscleGroupRepository
from app.repositories.program_repository import ProgramRepository
from app.repositories.workout_log_repository import WorkoutLogRepository
from app.repositories.workout_repository import WorkoutRepository
from app.services.catalog_service import CatalogService
from app.services.exercise_service import ExerciseService
from app.services.workout_log_service import WorkoutLogService
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


def get_workout_log_service(db: Session = Depends(get_db)) -> WorkoutLogService:
    """Resolve a :class:`WorkoutLogService` bound to a request-scoped session."""
    return WorkoutLogService(
        WorkoutLogRepository(db),
        WorkoutRepository(db),
        ExerciseRepository(db),
        ProgramRepository(db),
    )
