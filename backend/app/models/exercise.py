"""SQLAlchemy models for the Exercise domain entity and its associations.

``Exercise`` is the catalog root. Muscle groups and equipment are *not*
modeled as enums or arrays here — they reference the reusable, shared
``MuscleGroup``/``Equipment`` catalog entities (see
``app.models.muscle_group`` / ``app.models.equipment``) through dedicated
association tables that carry Exercise-specific metadata (whether a muscle
group is the primary mover, whether a piece of equipment is required).

``ExerciseSubstitution`` is a self-referential association representing
valid swaps for an exercise (e.g. "no equipment" or "injury" alternatives),
consumed by the future rule-based Workout Engine (Sprint 3.3+).
"""

import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.equipment import Equipment
from app.models.muscle_group import MuscleGroup


class DifficultyLevel(str, Enum):
    """Skill/experience level required to perform an exercise safely."""

    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ExerciseCategory(str, Enum):
    """Primary movement classification, per ``EVOLVE_ARCHITECTURE.md`` §5."""

    COMPOUND = "compound"
    ISOLATION = "isolation"
    CARDIO = "cardio"
    MOBILITY = "mobility"


class SubstitutionReason(str, Enum):
    """Why one exercise is offered as a substitute for another."""

    EQUIPMENT_ALTERNATIVE = "equipment_alternative"
    INJURY_OR_LIMITATION = "injury_or_limitation"
    DIFFICULTY_PROGRESSION = "difficulty_progression"
    DIFFICULTY_REGRESSION = "difficulty_regression"
    OTHER = "other"


class Exercise(Base):
    """A single entry in the exercise catalog — the building blocks of workouts.

    ``slug`` is a stable, service-generated identifier used for lookups and
    future cross-references from ``Program``/``Workout`` (Sprint 3.2+).
    ``created_by_id`` is unused by the Sprint 3.1 seed-only flow but allows
    future coach/AI-authored exercises without a schema change.
    """

    __tablename__ = "exercises"
    __table_args__ = (
        Index("ix_exercises_is_active", "is_active"),
        Index("ix_exercises_created_at", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)

    difficulty_level: Mapped[DifficultyLevel] = mapped_column(
        SAEnum(
            DifficultyLevel,
            name="difficulty_level_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        index=True,
        nullable=False,
    )
    category: Mapped[ExerciseCategory] = mapped_column(
        SAEnum(
            ExerciseCategory,
            name="exercise_category_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        index=True,
        nullable=False,
    )

    video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL", name="fk_exercises_created_by_id_users"),
        index=True,
        nullable=True,
    )

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

    muscle_group_links: Mapped[list["ExerciseMuscleGroup"]] = relationship(
        back_populates="exercise",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    equipment_links: Mapped[list["ExerciseEquipment"]] = relationship(
        back_populates="exercise",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    substitutions: Mapped[list["ExerciseSubstitution"]] = relationship(
        back_populates="exercise",
        foreign_keys="ExerciseSubstitution.exercise_id",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        """Return an unambiguous representation useful for logs and debugging."""
        return f"<Exercise id={self.id} slug={self.slug!r}>"


class ExerciseMuscleGroup(Base):
    """Association: which muscle groups an :class:`Exercise` targets.

    ``is_primary`` distinguishes the prime mover from secondary/synergist
    muscles. Exactly one primary muscle group per exercise is enforced at
    the service/schema layer, not the database, since PostgreSQL has no
    native "exactly one true per group" constraint without a partial unique
    index keyed on a computed column.
    """

    __tablename__ = "exercise_muscle_groups"
    __table_args__ = (
        Index("ix_exercise_muscle_groups_muscle_group_id", "muscle_group_id"),
    )

    exercise_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("exercises.id", ondelete="CASCADE", name="fk_exercise_muscle_groups_exercise_id"),
        primary_key=True,
    )
    muscle_group_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(
            "muscle_groups.id",
            ondelete="RESTRICT",
            name="fk_exercise_muscle_groups_muscle_group_id",
        ),
        primary_key=True,
    )
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    exercise: Mapped["Exercise"] = relationship(back_populates="muscle_group_links")
    muscle_group: Mapped["MuscleGroup"] = relationship(lazy="joined")

    def __repr__(self) -> str:
        """Return an unambiguous representation useful for logs and debugging."""
        return (
            f"<ExerciseMuscleGroup exercise_id={self.exercise_id} "
            f"muscle_group_id={self.muscle_group_id} is_primary={self.is_primary}>"
        )


class ExerciseEquipment(Base):
    """Association: which equipment an :class:`Exercise` requires.

    ``is_required`` distinguishes mandatory equipment from optional
    alternatives (e.g. "bench optional, floor works").
    """

    __tablename__ = "exercise_equipment"
    __table_args__ = (
        Index("ix_exercise_equipment_equipment_id", "equipment_id"),
    )

    exercise_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("exercises.id", ondelete="CASCADE", name="fk_exercise_equipment_exercise_id"),
        primary_key=True,
    )
    equipment_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("equipment.id", ondelete="RESTRICT", name="fk_exercise_equipment_equipment_id"),
        primary_key=True,
    )
    is_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    exercise: Mapped["Exercise"] = relationship(back_populates="equipment_links")
    equipment: Mapped["Equipment"] = relationship(lazy="joined")

    def __repr__(self) -> str:
        """Return an unambiguous representation useful for logs and debugging."""
        return (
            f"<ExerciseEquipment exercise_id={self.exercise_id} "
            f"equipment_id={self.equipment_id} is_required={self.is_required}>"
        )


class ExerciseSubstitution(Base):
    """Self-referential association: valid substitute exercises.

    A directed edge ``exercise_id -> substitute_exercise_id``. Symmetry is
    not assumed at the database level — the service layer decides whether
    to insert the reverse edge when a swap is mutually valid.
    """

    __tablename__ = "exercise_substitutions"
    __table_args__ = (
        CheckConstraint(
            "exercise_id != substitute_exercise_id",
            name="ck_exercise_substitutions_no_self_reference",
        ),
        Index(
            "ix_exercise_substitutions_substitute_exercise_id",
            "substitute_exercise_id",
        ),
    )

    exercise_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("exercises.id", ondelete="CASCADE", name="fk_exercise_substitutions_exercise_id"),
        primary_key=True,
    )
    substitute_exercise_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(
            "exercises.id",
            ondelete="CASCADE",
            name="fk_exercise_substitutions_substitute_exercise_id",
        ),
        primary_key=True,
    )
    reason: Mapped[SubstitutionReason | None] = mapped_column(
        SAEnum(
            SubstitutionReason,
            name="substitution_reason_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=True,
    )

    exercise: Mapped["Exercise"] = relationship(
        back_populates="substitutions",
        foreign_keys=[exercise_id],
    )
    substitute_exercise: Mapped["Exercise"] = relationship(
        foreign_keys=[substitute_exercise_id],
        lazy="joined",
    )

    def __repr__(self) -> str:
        """Return an unambiguous representation useful for logs and debugging."""
        return (
            f"<ExerciseSubstitution exercise_id={self.exercise_id} "
            f"substitute_exercise_id={self.substitute_exercise_id}>"
        )
