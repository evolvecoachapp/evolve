"""SQLAlchemy models for the Program domain entity and its associations.

``Program`` is a structured, multi-week training plan template — a reusable
authored artifact, analogous in spirit to :class:`~app.models.exercise.Exercise`.
``ProgramDay`` schedules an optional :class:`~app.models.workout.Workout`
template onto a specific ``(week_number, day_number)`` slot within a
program; ``day_number`` is always scoped *within* its week, never a global
sequence across the whole program, so multi-week programs of any cadence
(3-day, 4-day, 5-day, 6-day, 10-day microcycles, ...) are represented
without ambiguity.

``ProgramAssignment`` tracks a single user's progress through a program
instance. It is deliberately a separate entity from ``Program`` — a shared
template's authoring lifecycle (``ProgramStatus``) and a user's personal
progress through it (``AssignmentStatus``) are independent concerns; a
program remains ``published`` and reusable even after every user who
started it has ``completed`` or ``abandoned`` their own assignment.
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
    text,
)
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base
from app.models.exercise import DifficultyLevel


class ProgramGoal(str, Enum):
    """Training-methodology goal a program is designed around.

    Deliberately distinct from :class:`~app.models.user.Goal` (a user's
    body-composition/outcome goal, e.g. "lose_weight"). A program's goal
    describes *how it trains*, not what a user ultimately wants from their
    body — the two taxonomies are not interchangeable.
    """

    STRENGTH = "strength"
    HYPERTROPHY = "hypertrophy"
    ENDURANCE = "endurance"
    GENERAL_FITNESS = "general_fitness"


class ProgramStatus(str, Enum):
    """Authoring lifecycle of a program template.

    Governs whether a program is visible/assignable, not any individual
    user's progress through it (see :class:`AssignmentStatus` for that).
    """

    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class AssignmentStatus(str, Enum):
    """A single user's progress state through one program assignment."""

    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class Program(Base):
    """A structured, multi-week training plan template.

    ``slug`` is a stable, service-generated identifier, following the same
    pattern as ``Exercise.slug``. ``name`` is intentionally *not* unique —
    unlike the shared ``Exercise`` catalog, multiple coaches/AI-authored
    programs may reuse common names (e.g. "Push Pull Legs").
    """

    __tablename__ = "programs"
    __table_args__ = (
        CheckConstraint("duration_weeks > 0", name="ck_programs_duration_weeks_positive"),
        Index("ix_programs_status", "status"),
        Index("ix_programs_created_at", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_weeks: Mapped[int] = mapped_column(nullable=False)

    goal: Mapped[ProgramGoal] = mapped_column(
        SAEnum(
            ProgramGoal,
            name="program_goal_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        index=True,
        nullable=False,
    )
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
    status: Mapped[ProgramStatus] = mapped_column(
        SAEnum(
            ProgramStatus,
            name="program_status_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=ProgramStatus.DRAFT,
        nullable=False,
    )

    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL", name="fk_programs_created_by_id_users"),
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

    def __repr__(self) -> str:
        """Return an unambiguous representation useful for logs and debugging."""
        return f"<Program id={self.id} slug={self.slug!r} status={self.status.value}>"


class ProgramDay(Base):
    """Schedules an optional :class:`~app.models.workout.Workout` template
    onto a ``(week_number, day_number)`` slot within a :class:`Program`.

    ``day_number`` is always scoped *within* ``week_number`` — it is never a
    global sequence across the whole program (e.g. "day 17 of 84"). A row is
    uniquely identified by ``(program_id, week_number, day_number)``, so
    "week 1 day 3" and "week 2 day 3" are distinct rows. Both are validated
    only for positivity at the database level (``> 0``); ``day_number`` is
    intentionally left open-ended (not capped to 1-7) so 3-day, 4-day,
    5-day, 6-day, or 10-day microcycles are all representable. Cross-row
    validation (``week_number`` must not exceed ``Program.duration_weeks``)
    is a service-layer concern, not a database constraint.

    Program-wide traversal (e.g. "what's the next scheduled day") must
    always sort by the composite key ``(week_number, day_number)`` — never
    by either column alone.

    ``workout_id`` is nullable: a ``NULL`` value represents a rest day.
    """

    __tablename__ = "program_days"
    __table_args__ = (
        CheckConstraint("week_number > 0", name="ck_program_days_week_number_positive"),
        CheckConstraint("day_number > 0", name="ck_program_days_day_number_positive"),
        Index("ix_program_days_program_id_week_number", "program_id", "week_number"),
        Index(
            "uq_program_days_program_week_day",
            "program_id",
            "week_number",
            "day_number",
            unique=True,
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    program_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("programs.id", ondelete="CASCADE", name="fk_program_days_program_id"),
        nullable=False,
    )
    week_number: Mapped[int] = mapped_column(nullable=False)
    day_number: Mapped[int] = mapped_column(nullable=False)
    label: Mapped[str | None] = mapped_column(String(150), nullable=True)

    workout_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("workouts.id", ondelete="SET NULL", name="fk_program_days_workout_id"),
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

    def __repr__(self) -> str:
        """Return an unambiguous representation useful for logs and debugging."""
        return (
            f"<ProgramDay program_id={self.program_id} "
            f"week={self.week_number} day={self.day_number}>"
        )


class ProgramAssignment(Base):
    """A single user's progress through one instance of a :class:`Program`.

    Separate from ``Program.status`` by design (see module docstring): this
    is per-user state, while ``Program.status`` is the shared template's
    authoring lifecycle. Only one ``ACTIVE`` assignment per user is allowed;
    ``WorkoutService.assign_program`` enforces this by marking any existing
    active assignment ``ABANDONED`` before creating a new one. The partial
    unique index below is a database-level backstop for that invariant, not
    the primary enforcement mechanism.

    ``current_week_number``/``current_day_number`` are the Workout
    Resolution Engine's progress cursor (Sprint 4.1 — closing Phase 3's
    rule-based Workout Engine deliverable): the ``(week, day)`` slot that
    will be resolved as "next up" for this user. ``current_program_day_id``
    is a best-effort, nullable convenience pointer to the same slot's
    :class:`ProgramDay` row — kept alongside the numeric pair (rather than
    replacing it) since ``ProgramDay`` rows can be hard-deleted
    (``WorkoutService.remove_program_day``), which would otherwise leave the
    cursor referencing nothing; the numeric pair remains the source of
    truth that :class:`~app.services.workout_resolution_service.WorkoutResolutionService`
    resolves against, while the FK is reserved for future direct-join
    convenience. The cursor only ever advances via
    ``WorkoutResolutionService``; it is initialized on assignment creation
    to the program's first defined day. ``cursor_exhausted`` is set once
    there is no further ``ProgramDay`` to advance to — it marks "nothing
    left to resolve" without requiring a sentinel ``(week, day)`` value, and
    is independent of ``status`` (an assignment stays ``ACTIVE`` until the
    user/coach explicitly calls ``complete_assignment``).
    """

    __tablename__ = "program_assignments"
    __table_args__ = (
        CheckConstraint(
            "current_week_number > 0",
            name="ck_program_assignments_current_week_number_positive",
        ),
        CheckConstraint(
            "current_day_number > 0",
            name="ck_program_assignments_current_day_number_positive",
        ),
        Index("ix_program_assignments_program_id", "program_id"),
        Index("ix_program_assignments_user_id", "user_id"),
        Index("ix_program_assignments_current_program_day_id", "current_program_day_id"),
        Index(
            "uq_program_assignments_one_active_per_user",
            "user_id",
            unique=True,
            postgresql_where=text("status = 'active'"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    program_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(
            "programs.id",
            ondelete="RESTRICT",
            name="fk_program_assignments_program_id",
        ),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE", name="fk_program_assignments_user_id"),
        nullable=False,
    )
    status: Mapped[AssignmentStatus] = mapped_column(
        SAEnum(
            AssignmentStatus,
            name="assignment_status_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=AssignmentStatus.ACTIVE,
        index=True,
        nullable=False,
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    ended_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    current_week_number: Mapped[int] = mapped_column(default=1, nullable=False)
    current_day_number: Mapped[int] = mapped_column(default=1, nullable=False)
    current_program_day_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(
            "program_days.id",
            ondelete="SET NULL",
            name="fk_program_assignments_current_program_day_id",
        ),
        nullable=True,
    )
    cursor_exhausted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

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

    def __repr__(self) -> str:
        """Return an unambiguous representation useful for logs and debugging."""
        return (
            f"<ProgramAssignment id={self.id} user_id={self.user_id} "
            f"program_id={self.program_id} status={self.status.value}>"
        )
