"""Pydantic schemas package — API request/response contracts."""

from app.schemas.auth import LoginRequest, RefreshRequest, TokenResponse
from app.schemas.catalog import (
    EquipmentCreate,
    EquipmentRead,
    MuscleGroupCreate,
    MuscleGroupRead,
)
from app.schemas.exercise import (
    EquipmentWithRole,
    ExerciseCreate,
    ExerciseEquipmentInput,
    ExerciseMuscleGroupInput,
    ExercisePage,
    ExercisePublic,
    ExerciseSubstitutionCreate,
    ExerciseSubstitutionRead,
    ExerciseSummary,
    ExerciseUpdate,
    MuscleGroupWithRole,
)
from app.schemas.user import UserCreate, UserPublic, UserRead, UserUpdate

__all__ = [
    "EquipmentCreate",
    "EquipmentRead",
    "EquipmentWithRole",
    "ExerciseCreate",
    "ExerciseEquipmentInput",
    "ExerciseMuscleGroupInput",
    "ExercisePage",
    "ExercisePublic",
    "ExerciseSubstitutionCreate",
    "ExerciseSubstitutionRead",
    "ExerciseSummary",
    "ExerciseUpdate",
    "LoginRequest",
    "MuscleGroupCreate",
    "MuscleGroupRead",
    "MuscleGroupWithRole",
    "RefreshRequest",
    "TokenResponse",
    "UserCreate",
    "UserPublic",
    "UserRead",
    "UserUpdate",
]
