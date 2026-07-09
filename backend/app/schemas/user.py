"""Pydantic v2 schemas for the User domain — request/response contracts.

These schemas define the API surface independently of the SQLAlchemy
``User`` model (see ``app.models.user``). ``hashed_password`` is never
included in any schema; ``UserCreate`` accepts a plaintext ``password``
that is validated for strength here and hashed in a future service layer.
"""

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Annotated

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    StringConstraints,
    field_validator,
)

from app.models.user import ActivityLevel, Gender, Goal

UsernameField = Annotated[
    str,
    StringConstraints(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$"),
]
NameField = Annotated[str, StringConstraints(min_length=1, max_length=100)]
PasswordField = Annotated[str, StringConstraints(min_length=8, max_length=128)]
HeightField = Annotated[Decimal, Field(gt=0, le=300)]
WeightField = Annotated[Decimal, Field(gt=0, le=500)]


def _validate_birth_date_not_in_future(value: date | None) -> date | None:
    """Ensure a birth date, if provided, is not set in the future."""
    if value is not None and value > date.today():
        raise ValueError("birth_date cannot be in the future")
    return value


def _validate_password_strength(value: str) -> str:
    """Enforce a strong password: upper, lower, digit, and special character."""
    if not any(char.isupper() for char in value):
        raise ValueError("password must contain at least one uppercase letter")
    if not any(char.islower() for char in value):
        raise ValueError("password must contain at least one lowercase letter")
    if not any(char.isdigit() for char in value):
        raise ValueError("password must contain at least one digit")
    if not any(not char.isalnum() for char in value):
        raise ValueError("password must contain at least one special character")
    return value


class UserCreate(BaseModel):
    """Input schema for registering a new user.

    ``password`` is plaintext at this layer; hashing into
    ``hashed_password`` happens in a future service layer, never here.
    """

    email: EmailStr
    username: UsernameField
    password: PasswordField

    first_name: NameField | None = None
    last_name: NameField | None = None
    birth_date: date | None = None
    gender: Gender | None = None
    height_cm: HeightField | None = None
    current_weight_kg: WeightField | None = None
    target_weight_kg: WeightField | None = None
    activity_level: ActivityLevel | None = None
    goal: Goal | None = None

    @field_validator("birth_date")
    @classmethod
    def _check_birth_date(cls, value: date | None) -> date | None:
        return _validate_birth_date_not_in_future(value)

    @field_validator("password")
    @classmethod
    def _check_password_strength(cls, value: str) -> str:
        return _validate_password_strength(value)


class UserUpdate(BaseModel):
    """Input schema for partially updating a user's own profile.

    All fields are optional so clients submit only the attributes they
    wish to change. Excludes ``password`` (a dedicated change-password
    flow belongs in a future sprint) and system-managed/administrative
    fields (``is_active``, ``is_superuser``, ``is_verified``, timestamps).
    """

    email: EmailStr | None = None
    username: UsernameField | None = None
    first_name: NameField | None = None
    last_name: NameField | None = None
    birth_date: date | None = None
    gender: Gender | None = None
    height_cm: HeightField | None = None
    current_weight_kg: WeightField | None = None
    target_weight_kg: WeightField | None = None
    activity_level: ActivityLevel | None = None
    goal: Goal | None = None

    @field_validator("birth_date")
    @classmethod
    def _check_birth_date(cls, value: date | None) -> date | None:
        return _validate_birth_date_not_in_future(value)


class UserPublic(BaseModel):
    """Public-facing representation of a user.

    Safe to return to any API consumer. Never includes
    ``hashed_password``, ``is_superuser``, or ``deleted_at``.
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    username: str
    first_name: str | None
    last_name: str | None
    birth_date: date | None
    gender: Gender | None
    height_cm: Decimal | None
    current_weight_kg: Decimal | None
    target_weight_kg: Decimal | None
    activity_level: ActivityLevel | None
    goal: Goal | None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class UserRead(UserPublic):
    """Full internal representation of a user, for trusted internal use.

    Extends :class:`UserPublic` with administrative/internal fields.
    Still excludes ``hashed_password``. Not intended to be returned
    directly to untrusted API consumers.
    """

    is_superuser: bool
    deleted_at: datetime | None
