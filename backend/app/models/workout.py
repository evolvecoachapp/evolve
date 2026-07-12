"""SQLAlchemy models for the Workout *template* domain entity and its
ordered exercise line items.

``Workout``/``WorkoutExercise`` are a standalone, reusable workout
*template* (an ordered list of target exercises/sets/reps), analogous to
:class:`~app.models.exercise.Exercise`. A template can be scheduled into a
:class:`~app.models.program.Program` via
:class:`~app.models.program.ProgramDay`, or referenced directly by an
ad-hoc logged session outside any program.

The *execution* side — a single logged session and its per-exercise/
per-set data — is a separate aggregate living in
:mod:`app.models.workout_log` (``WorkoutLog``/``WorkoutLogExercise``/
``WorkoutSetLog``), with its own repository and service, per the
Sprint 3.3 design.
"""

import uuid
from datetime import datetime

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
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.exercise import Exercise


class Workout(Base):
    """A reusable workout template — an ordered list of target exercises.

    ``slug`` is a stable, service-generated identifier, following the same
    pattern as ``Exercise.slug``/``Program.slug``. ``name`` is intentionally
    not unique, since generic template names (e.g. "Upper Body A") are
    commonly reused across authors. ``is_active`` mirrors
    ``Exercise.is_active`` — a simple usability flag rather than a full
    authoring-lifecycle status, since a workout template has no
    draft/published workflow of its own (unlike ``Program``).
    """

    __tablename__ = "workouts"
    __table_args__ = (
        CheckConstraint(
            "estimated_duration_minutes IS NULL OR estimated_duration_minutes > 0",
            name="ck_workouts_estimated_duration_minutes_positive",
        ),
        Index("ix_workouts_is_active", "is_active"),
        Index("ix_workouts_created_at", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    estimated_duration_minutes: Mapped[int | None] = mapped_column(nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL", name="fk_workouts_created_by_id_users"),
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

    exercise_links: Mapped[list["WorkoutExercise"]] = relationship(
        back_populates="workout",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="WorkoutExercise.order_index",
    )

    def __repr__(self) -> str:
        """Return an unambiguous representation useful for logs and debugging."""
        return f"<Workout id={self.id} slug={self.slug!r}>"


class WorkoutExercise(Base):
    """An ordered target-exercise line item within a :class:`Workout` template.

    Uses a surrogate primary key (rather than a composite
    ``(workout_id, exercise_id)`` key like
    ``ExerciseMuscleGroup``/``ExerciseEquipment``) because the same exercise
    may legitimately appear more than once in a single workout — e.g. a
    lighter warm-up set followed by the main working sets as two separate
    line items with different targets.

    Only *target* prescriptions are captured here (sets/rep range/rest);
    actual logged performance (weight, reps, RPE) belongs to Sprint 3.3's
    per-set logging model, not this template line item.
    """

    __tablename__ = "workout_exercises"
    __table_args__ = (
        CheckConstraint("target_sets > 0", name="ck_workout_exercises_target_sets_positive"),
        CheckConstraint(
            "target_reps_min IS NULL OR target_reps_min > 0",
            name="ck_workout_exercises_target_reps_min_positive",
        ),
        CheckConstraint(
            "target_reps_max IS NULL OR target_reps_max > 0",
            name="ck_workout_exercises_target_reps_max_positive",
        ),
        CheckConstraint(
            "target_reps_min IS NULL OR target_reps_max IS NULL "
            "OR target_reps_max >= target_reps_min",
            name="ck_workout_exercises_target_reps_range_valid",
        ),
        CheckConstraint(
            "rest_seconds IS NULL OR rest_seconds >= 0",
            name="ck_workout_exercises_rest_seconds_non_negative",
        ),
        Index("ix_workout_exercises_exercise_id", "exercise_id"),
        Index(
            "uq_workout_exercises_workout_order",
            "workout_id",
            "order_index",
            unique=True,
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    workout_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("workouts.id", ondelete="CASCADE", name="fk_workout_exercises_workout_id"),
        nullable=False,
    )
    exercise_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(
            "exercises.id",
            ondelete="RESTRICT",
            name="fk_workout_exercises_exercise_id",
        ),
        nullable=False,
    )
    order_index: Mapped[int] = mapped_column(nullable=False)
    target_sets: Mapped[int] = mapped_column(nullable=False)
    target_reps_min: Mapped[int | None] = mapped_column(nullable=True)
    target_reps_max: Mapped[int | None] = mapped_column(nullable=True)
    rest_seconds: Mapped[int | None] = mapped_column(nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    workout: Mapped["Workout"] = relationship(back_populates="exercise_links")
    exercise: Mapped["Exercise"] = relationship(lazy="joined")

    def __repr__(self) -> str:
        """Return an unambiguous representation useful for logs and debugging."""
        return (
            f"<WorkoutExercise workout_id={self.workout_id} "
            f"exercise_id={self.exercise_id} order_index={self.order_index}>"
        )
