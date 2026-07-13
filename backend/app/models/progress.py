"""SQLAlchemy model for the Progress domain entity.

``Progress`` is a single measurable snapshot of user advancement — always
strictly personal (never shared/public), mirroring
:class:`~app.models.recovery.RecoveryCheckIn`'s ``NOT NULL`` owner shape
rather than :class:`~app.models.meal.Meal`'s catalog-vs-authored pattern:
progress data has no concept of a shared/system-authored entry.

``ProgressMetricType`` is defined here (not on ``app.models.goal``) and
imported by :mod:`app.models.goal` for ``Goal.target_metric_type`` — the two
models share one closed set of trackable metrics per
``EVOLVE_ARCHITECTURE.md`` §5, and a goal's target only ever makes sense in
terms of a metric this table can also record progress against.
"""

import uuid
from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Index, Numeric, String, Text, Uuid, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class ProgressMetricType(str, Enum):
    """The closed set of trackable advancement metrics, per ``EVOLVE_ARCHITECTURE.md`` §5."""

    BODY_WEIGHT = "body_weight"
    BODY_FAT_PERCENTAGE = "body_fat_percentage"
    LIFT_PR = "lift_pr"
    RUN_TIME = "run_time"
    CIRCUMFERENCE = "circumference"


class ProgressSource(str, Enum):
    """Where a progress value came from.

    Only ``MANUAL`` is ever written by this sprint's service/API layer —
    ``WEARABLE`` (no device integration exists yet) and ``CALCULATED`` (no
    automatic derivation, e.g. from ``WorkoutLog`` PRs, exists yet) are
    schema affordances carried now so a future sprint can populate them
    without a disruptive migration, mirroring Decision 012's reasoning for
    ``Meal.is_public``.
    """

    MANUAL = "manual"
    WEARABLE = "wearable"
    CALCULATED = "calculated"


class Progress(Base):
    """A single measurable snapshot of one user's advancement toward fitness goals.

    ``exercise_id`` gives a ``LIFT_PR`` entry the exercise it's a PR for
    (e.g. "Bench Press"); it is ``NULL`` for every other metric type.
    ``goal_id`` is an optional best-effort link to the :class:`~app.models.goal.Goal`
    this entry counts toward — set to ``NULL`` if that goal is later deleted,
    since the progress data point remains valid history regardless.
    """

    __tablename__ = "progress_entries"
    __table_args__ = (
        CheckConstraint("value >= 0", name="ck_progress_entries_value_non_negative"),
        Index("ix_progress_entries_user_id", "user_id"),
        Index("ix_progress_entries_goal_id", "goal_id"),
        Index(
            "ix_progress_entries_user_metric_date",
            "user_id",
            "metric_type",
            "recorded_date",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE", name="fk_progress_entries_user_id_users"),
        nullable=False,
    )
    goal_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("goals.id", ondelete="SET NULL", name="fk_progress_entries_goal_id_goals"),
        nullable=True,
    )
    exercise_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(
            "exercises.id",
            ondelete="SET NULL",
            name="fk_progress_entries_exercise_id_exercises",
        ),
        nullable=True,
    )

    metric_type: Mapped[ProgressMetricType] = mapped_column(
        SAEnum(
            ProgressMetricType,
            name="progress_metric_type_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        index=True,
        nullable=False,
    )
    value: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    recorded_date: Mapped[date] = mapped_column(Date, nullable=False)
    source: Mapped[ProgressSource] = mapped_column(
        SAEnum(
            ProgressSource,
            name="progress_source_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=ProgressSource.MANUAL,
        nullable=False,
    )
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
            f"<Progress id={self.id} user_id={self.user_id} "
            f"metric_type={self.metric_type.value} recorded_date={self.recorded_date}>"
        )
