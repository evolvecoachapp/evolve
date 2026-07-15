"""SQLAlchemy models for the workout *execution* aggregate.

Split out from ``app.models.workout`` (which owns the reusable *template*
aggregate — ``Workout``/``WorkoutExercise``) per the Sprint 3.3 design: a
logged session's lifecycle, its per-exercise instances, and its per-set
data are a distinct aggregate root with its own repository/service, so the
models live in their own module too.

- :class:`WorkoutLog` — a single planned/in-progress/completed/skipped
  session. ``started_at``/``completed_at`` bound the active window;
  ``status`` drives what mutations are allowed (see
  :class:`~app.services.workout_log_service.WorkoutLogService`).
- :class:`WorkoutLogExercise` — one exercise instance within a session.
  Carries an optional best-effort link back to the ``WorkoutExercise``
  template line item it came from, *plus* a snapshot of what was actually
  prescribed at the time (name, target sets/reps/rest) — because
  ``WorkoutRepository.replace_exercises`` deletes and re-inserts
  ``WorkoutExercise`` rows on every template edit, a bare FK would go
  dangling the moment a template changes. The snapshot keeps history
  stable and human-readable regardless of later catalog/template edits.
- :class:`WorkoutSetLog` — one performed (or planned-but-skipped) set
  within a :class:`WorkoutLogExercise`: weight, reps, RPE, and/or duration.
"""

import uuid
from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
    Uuid,
    func,
    text,
)
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.exercise import Exercise


class WorkoutLogStatus(str, Enum):
    """Lifecycle state of a single logged workout session.

    ``PLANNED`` is reserved for a future scheduling feature (materializing
    sessions ahead of time from a ``ProgramDay``); Sprint 3.3 never
    produces it — every session starts directly in ``IN_PROGRESS`` via
    :meth:`~app.services.workout_log_service.WorkoutLogService.start_workout`.
    """

    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class WorkoutLog(Base):
    """A single planned, in-progress, completed, or skipped workout session.

    ``program_assignment_id`` and ``workout_id`` are both nullable: a
    session may be ad-hoc (neither set), based on a template but done
    outside any program (``workout_id`` set, ``program_assignment_id``
    ``NULL``), or fully tied to an active program assignment (both set).

    At most one row per user may have ``status == IN_PROGRESS`` at a time
    (``uq_workout_logs_one_in_progress_per_user``), enforced by both this
    partial unique index and
    :meth:`WorkoutLogService.start_workout`'s pre-check — mirrors
    ``uq_program_assignments_one_active_per_user`` on ``ProgramAssignment``.
    """

    __tablename__ = "workout_logs"
    __table_args__ = (
        CheckConstraint(
            "duration_actual_minutes IS NULL OR duration_actual_minutes > 0",
            name="ck_workout_logs_duration_actual_minutes_positive",
        ),
        Index("ix_workout_logs_user_id", "user_id"),
        Index("ix_workout_logs_program_assignment_id", "program_assignment_id"),
        Index("ix_workout_logs_workout_id", "workout_id"),
        Index("ix_workout_logs_status", "status"),
        Index("ix_workout_logs_scheduled_date", "scheduled_date"),
        Index(
            "uq_workout_logs_one_in_progress_per_user",
            "user_id",
            unique=True,
            postgresql_where=text("status = 'in_progress'"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE", name="fk_workout_logs_user_id"),
        nullable=False,
    )
    program_assignment_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(
            "program_assignments.id",
            ondelete="SET NULL",
            name="fk_workout_logs_program_assignment_id",
        ),
        nullable=True,
    )
    workout_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("workouts.id", ondelete="SET NULL", name="fk_workout_logs_workout_id"),
        nullable=True,
    )

    status: Mapped[WorkoutLogStatus] = mapped_column(
        SAEnum(
            WorkoutLogStatus,
            name="workout_log_status_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=WorkoutLogStatus.PLANNED,
        nullable=False,
    )
    scheduled_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    duration_actual_minutes: Mapped[int | None] = mapped_column(nullable=True)
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

    log_exercises: Mapped[list["WorkoutLogExercise"]] = relationship(
        back_populates="workout_log",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="WorkoutLogExercise.order_index",
    )

    def __repr__(self) -> str:
        """Return an unambiguous representation useful for logs and debugging."""
        return f"<WorkoutLog id={self.id} user_id={self.user_id} status={self.status.value}>"


class WorkoutLogExercise(Base):
    """One exercise instance logged within a :class:`WorkoutLog` session.

    ``workout_exercise_id`` is a best-effort, nullable link back to the
    template line item this came from — it goes ``NULL`` if that template
    is later edited (``WorkoutRepository.replace_exercises`` deletes and
    re-inserts ``WorkoutExercise`` rows). ``exercise_name_snapshot`` and the
    ``target_*``/``rest_seconds`` columns are copied once, at add-time, and
    never re-synced, so history stays accurate and readable even after the
    catalog entry is renamed or the template is edited.

    ``skipped`` marks that the user explicitly chose not to perform this
    exercise instance during the session — distinct from simply having no
    logged sets (which just means "not gotten to yet" while the session is
    still ``IN_PROGRESS``). Mirrors the intent of
    :attr:`WorkoutLog.status`'s ``SKIPPED`` state, but scoped to a single
    exercise rather than the whole session.
    """

    __tablename__ = "workout_log_exercises"
    __table_args__ = (
        CheckConstraint(
            "target_sets IS NULL OR target_sets > 0",
            name="ck_workout_log_exercises_target_sets_positive",
        ),
        CheckConstraint(
            "target_reps_min IS NULL OR target_reps_min > 0",
            name="ck_workout_log_exercises_target_reps_min_positive",
        ),
        CheckConstraint(
            "target_reps_max IS NULL OR target_reps_max > 0",
            name="ck_workout_log_exercises_target_reps_max_positive",
        ),
        CheckConstraint(
            "target_reps_min IS NULL OR target_reps_max IS NULL "
            "OR target_reps_max >= target_reps_min",
            name="ck_workout_log_exercises_target_reps_range_valid",
        ),
        CheckConstraint(
            "rest_seconds IS NULL OR rest_seconds >= 0",
            name="ck_workout_log_exercises_rest_seconds_non_negative",
        ),
        Index("ix_workout_log_exercises_workout_log_id", "workout_log_id"),
        Index("ix_workout_log_exercises_exercise_id", "exercise_id"),
        Index(
            "uq_workout_log_exercises_log_order",
            "workout_log_id",
            "order_index",
            unique=True,
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    workout_log_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(
            "workout_logs.id",
            ondelete="CASCADE",
            name="fk_workout_log_exercises_workout_log_id",
        ),
        nullable=False,
    )
    exercise_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(
            "exercises.id",
            ondelete="RESTRICT",
            name="fk_workout_log_exercises_exercise_id",
        ),
        nullable=False,
    )
    workout_exercise_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(
            "workout_exercises.id",
            ondelete="SET NULL",
            name="fk_workout_log_exercises_workout_exercise_id",
        ),
        nullable=True,
    )
    order_index: Mapped[int] = mapped_column(nullable=False)

    exercise_name_snapshot: Mapped[str] = mapped_column(String(150), nullable=False)
    target_sets: Mapped[int | None] = mapped_column(nullable=True)
    target_reps_min: Mapped[int | None] = mapped_column(nullable=True)
    target_reps_max: Mapped[int | None] = mapped_column(nullable=True)
    rest_seconds: Mapped[int | None] = mapped_column(nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    skipped: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

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

    workout_log: Mapped["WorkoutLog"] = relationship(back_populates="log_exercises")
    exercise: Mapped["Exercise"] = relationship(lazy="joined")
    set_logs: Mapped[list["WorkoutSetLog"]] = relationship(
        back_populates="workout_log_exercise",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="WorkoutSetLog.set_number",
    )

    def __repr__(self) -> str:
        """Return an unambiguous representation useful for logs and debugging."""
        return (
            f"<WorkoutLogExercise id={self.id} workout_log_id={self.workout_log_id} "
            f"exercise_id={self.exercise_id} order_index={self.order_index}>"
        )


class WorkoutSetLog(Base):
    """A single performed set within a :class:`WorkoutLogExercise`.

    ``set_number`` is always server-assigned (next available number within
    the parent exercise) — never client-supplied — to avoid collisions.
    At least one of ``weight_kg``/``reps``/``duration_seconds`` must be
    present; that cross-field rule is enforced in the Pydantic schema
    layer (``app.schemas.workout_log``), not the database, matching how
    ``WorkoutExerciseInput`` validates rep ranges today.
    """

    __tablename__ = "workout_set_logs"
    __table_args__ = (
        CheckConstraint("set_number > 0", name="ck_workout_set_logs_set_number_positive"),
        CheckConstraint(
            "weight_kg IS NULL OR weight_kg > 0",
            name="ck_workout_set_logs_weight_kg_positive",
        ),
        CheckConstraint("reps IS NULL OR reps > 0", name="ck_workout_set_logs_reps_positive"),
        CheckConstraint(
            "duration_seconds IS NULL OR duration_seconds > 0",
            name="ck_workout_set_logs_duration_seconds_positive",
        ),
        CheckConstraint(
            "rpe IS NULL OR (rpe >= 0 AND rpe <= 10)",
            name="ck_workout_set_logs_rpe_range_valid",
        ),
        Index("ix_workout_set_logs_workout_log_exercise_id", "workout_log_exercise_id"),
        Index(
            "uq_workout_set_logs_exercise_set_number",
            "workout_log_exercise_id",
            "set_number",
            unique=True,
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    workout_log_exercise_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(
            "workout_log_exercises.id",
            ondelete="CASCADE",
            name="fk_workout_set_logs_workout_log_exercise_id",
        ),
        nullable=False,
    )
    set_number: Mapped[int] = mapped_column(nullable=False)
    weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(6, 2), nullable=True)
    reps: Mapped[int | None] = mapped_column(nullable=True)
    rpe: Mapped[Decimal | None] = mapped_column(Numeric(3, 1), nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(nullable=True)
    is_warmup: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
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

    workout_log_exercise: Mapped["WorkoutLogExercise"] = relationship(back_populates="set_logs")

    def __repr__(self) -> str:
        """Return an unambiguous representation useful for logs and debugging."""
        return (
            f"<WorkoutSetLog id={self.id} "
            f"workout_log_exercise_id={self.workout_log_exercise_id} "
            f"set_number={self.set_number}>"
        )
