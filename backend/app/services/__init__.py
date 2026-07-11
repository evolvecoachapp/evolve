"""Service layer package — business logic and workflow orchestration."""

from app.services.auth_service import (
    AuthResult,
    AuthService,
    AuthServiceError,
    InactiveAccountError,
    InvalidCredentialsError,
    UserAlreadyExistsError,
)
from app.services.catalog_service import (
    CatalogService,
    CatalogServiceError,
    EquipmentAlreadyExistsError,
    EquipmentNotFoundError,
    MuscleGroupAlreadyExistsError,
    MuscleGroupNotFoundError,
)
from app.services.exercise_service import (
    ExerciseAlreadyExistsError,
    ExerciseNotFoundError,
    ExerciseService,
    ExerciseServiceError,
    InvalidCatalogReferenceError,
    SelfSubstitutionError,
    SubstitutionAlreadyExistsError,
    SubstitutionNotFoundError,
)

__all__ = [
    "AuthResult",
    "AuthService",
    "AuthServiceError",
    "CatalogService",
    "CatalogServiceError",
    "EquipmentAlreadyExistsError",
    "EquipmentNotFoundError",
    "ExerciseAlreadyExistsError",
    "ExerciseNotFoundError",
    "ExerciseService",
    "ExerciseServiceError",
    "InactiveAccountError",
    "InvalidCatalogReferenceError",
    "InvalidCredentialsError",
    "MuscleGroupAlreadyExistsError",
    "MuscleGroupNotFoundError",
    "SelfSubstitutionError",
    "SubstitutionAlreadyExistsError",
    "SubstitutionNotFoundError",
    "UserAlreadyExistsError",
]
