"""SQLAlchemy model for the User domain entity."""

import uuid
from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import CheckConstraint, Date, DateTime, Index, Numeric, String, Uuid, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Gender(str, Enum):
    """Self-reported gender options for a user profile."""

    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class ActivityLevel(str, Enum):
    """Self-reported physical activity level, used to tailor coaching plans."""

    SEDENTARY = "sedentary"
    LIGHTLY_ACTIVE = "lightly_active"
    MODERATELY_ACTIVE = "moderately_active"
    VERY_ACTIVE = "very_active"
    EXTREMELY_ACTIVE = "extremely_active"


class Goal(str, Enum):
    """Primary fitness goal driving workout and nutrition recommendations."""

    LOSE_WEIGHT = "lose_weight"
    MAINTAIN_WEIGHT = "maintain_weight"
    GAIN_MUSCLE = "gain_muscle"
    IMPROVE_ENDURANCE = "improve_endurance"
    GENERAL_FITNESS = "general_fitness"


class User(Base):
    """Platform account and fitness profile for a single EVOLVE user.

    Identity fields (``email``, ``username``, ``hashed_password``) are
    required at registration. Profile and fitness fields are optional and
    are typically completed during onboarding.
    """

    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "height_cm IS NULL OR height_cm > 0",
            name="ck_users_height_cm_positive",
        ),
        CheckConstraint(
            "current_weight_kg IS NULL OR current_weight_kg > 0",
            name="ck_users_current_weight_kg_positive",
        ),
        CheckConstraint(
            "target_weight_kg IS NULL OR target_weight_kg > 0",
            name="ck_users_target_weight_kg_positive",
        ),
        Index("ix_users_is_active", "is_active"),
        Index("ix_users_created_at", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    username: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    gender: Mapped[Gender | None] = mapped_column(
        SAEnum(
            Gender,
            name="gender_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=True,
    )

    height_cm: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    current_weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    target_weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)

    activity_level: Mapped[ActivityLevel | None] = mapped_column(
        SAEnum(
            ActivityLevel,
            name="activity_level_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=True,
    )
    goal: Mapped[Goal | None] = mapped_column(
        SAEnum(
            Goal,
            name="goal_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(default=False, nullable=False)
    is_verified: Mapped[bool] = mapped_column(default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    def __repr__(self) -> str:
        """Return an unambiguous representation useful for logs and debugging."""
        return f"<User id={self.id} email={self.email!r} username={self.username!r}>"
