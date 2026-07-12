"""SQLAlchemy models for the Meal template and Meal Log (diary entry) aggregates.

``Meal`` is a reusable meal template, deliberately given the same
catalog-vs-authored shape as :class:`~app.models.exercise.Exercise` and
:class:`~app.models.program.Program` — a nullable ``created_by_id`` plus an
``is_public`` flag — rather than a strictly personal,
:class:`~app.models.workout_log.WorkoutLog`-style ``NOT NULL`` owner column.
No public/system meals are created this sprint (no admin authoring flow, no
seed data); the shape exists so a future shared/EVOLVE-provided meal library
never requires a backfill migration (see Decision 012 in
``docs/DECISIONS.md``).

``MealLog`` is the *execution* side — a single logged diary entry, always
strictly personal (a diary entry is never shared). Its macro/name fields are
snapshotted at log time (copied from the template if ``meal_id`` is given, or
supplied directly for an ad-hoc entry), so later template edits never rewrite
history — the same rationale as
:class:`~app.models.workout_log.WorkoutLogExercise`'s
``exercise_name_snapshot``.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import (
    ARRAY,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class MealType(str, Enum):
    """When/why a meal is eaten, used both on templates and logged entries."""

    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"
    PRE_WORKOUT = "pre_workout"
    POST_WORKOUT = "post_workout"
    OTHER = "other"


def _macro_check_constraints(table_prefix: str) -> tuple[CheckConstraint, ...]:
    """Build the shared non-negative-macro check constraints for ``Meal``/``MealLog``.

    Both tables carry the same four macro columns with the same rule
    (``>= 0``); factored out so the constraint names stay consistent without
    duplicating the four ``CheckConstraint`` calls verbatim in each class.
    """
    return (
        CheckConstraint("calories >= 0", name=f"ck_{table_prefix}_calories_non_negative"),
        CheckConstraint("protein_g >= 0", name=f"ck_{table_prefix}_protein_g_non_negative"),
        CheckConstraint("carbs_g >= 0", name=f"ck_{table_prefix}_carbs_g_non_negative"),
        CheckConstraint("fat_g >= 0", name=f"ck_{table_prefix}_fat_g_non_negative"),
    )


class Meal(Base):
    """A reusable meal template with a fixed macro breakdown.

    ``created_by_id`` is nullable and ``is_public`` defaults to ``False``,
    mirroring ``Exercise``/``Program``'s catalog-vs-authored pattern rather
    than a strictly personal owner column — see Decision 012 in
    ``docs/DECISIONS.md``. This sprint's service/API layer only ever creates
    ``is_public=False`` meals with ``created_by_id`` set to the creating
    user; ``created_by_id IS NULL`` and ``is_public=True`` are schema
    affordances for a future shared/EVOLVE-provided meal library, not yet
    reachable through any endpoint.

    No ``slug`` (unlike ``Exercise``/``Workout``): meals are not yet looked
    up by a stable public identifier, only by ``id``.
    """

    __tablename__ = "meals"
    __table_args__ = (
        *_macro_check_constraints("meals"),
        Index("ix_meals_created_by_id", "created_by_id"),
        Index("ix_meals_is_public", "is_public"),
        Index("ix_meals_is_active", "is_active"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL", name="fk_meals_created_by_id_users"),
        nullable=True,
    )
    is_public: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    meal_type: Mapped[MealType] = mapped_column(
        SAEnum(
            MealType,
            name="meal_type_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        index=True,
        nullable=False,
    )

    calories: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    protein_g: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    carbs_g: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    fat_g: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)

    dietary_tags: Mapped[list[str] | None] = mapped_column(ARRAY(String(30)), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

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
        return f"<Meal id={self.id} name={self.name!r} is_public={self.is_public}>"


class MealLog(Base):
    """A single logged (diary) meal entry — always strictly personal.

    ``meal_id`` is an optional, best-effort link back to the ``Meal``
    template this entry came from; it goes ``NULL`` if that template is
    later deleted. ``name_snapshot``/``meal_type``/the macro columns are
    copied once at log time (from the template, or supplied directly for an
    ad-hoc entry with no ``meal_id``) and never re-synced, so history stays
    accurate even if the template is later edited or removed.
    """

    __tablename__ = "meal_logs"
    __table_args__ = (
        *_macro_check_constraints("meal_logs"),
        Index("ix_meal_logs_user_id", "user_id"),
        Index("ix_meal_logs_meal_id", "meal_id"),
        Index("ix_meal_logs_user_consumed", "user_id", "consumed_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE", name="fk_meal_logs_user_id"),
        nullable=False,
    )
    meal_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("meals.id", ondelete="SET NULL", name="fk_meal_logs_meal_id"),
        nullable=True,
    )

    name_snapshot: Mapped[str] = mapped_column(String(150), nullable=False)
    meal_type: Mapped[MealType] = mapped_column(
        SAEnum(
            MealType,
            name="meal_type_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
    )

    calories: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    protein_g: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    carbs_g: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    fat_g: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)

    consumed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

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
        return (
            f"<MealLog id={self.id} user_id={self.user_id} "
            f"name_snapshot={self.name_snapshot!r}>"
        )
