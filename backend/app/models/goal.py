"""SQLAlchemy model for the Goal domain entity.

``Goal`` is a user-defined target the Coach works toward — always strictly
personal (never shared/public), the same ownership shape as
:class:`~app.models.progress.Progress`/:class:`~app.models.recovery.RecoveryCheckIn`.
Its optional ``target_metric_type``/``target_value``/``target_unit`` reuse
:class:`~app.models.progress.ProgressMetricType` so a goal's target and a
user's logged :class:`~app.models.progress.Progress` entries speak the same
metric vocabulary — required for the Progress Analyzer to compare the two.
"""

import uuid
from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Index, Numeric, String, Text, Uuid, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base
from app.models.progress import ProgressMetricType


class GoalType(str, Enum):
    """The category of target a goal represents, per ``EVOLVE_ARCHITECTURE.md`` §5."""

    STRENGTH_TARGET = "strength_target"
    WEIGHT_TARGET = "weight_target"
    HABIT = "habit"
    EVENT_PREPARATION = "event_preparation"


class GoalStatus(str, Enum):
    """Lifecycle state of a goal."""

    ACTIVE = "active"
    ACHIEVED = "achieved"
    ABANDONED = "abandoned"


class GoalPriority(str, Enum):
    """Qualitative priority level, matching ``ReadinessLevel``'s style rather than a raw integer."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Goal(Base):
    """A single user-defined fitness target.

    ``target_metric_type``/``target_value``/``target_unit`` are all
    nullable together — a ``HABIT`` goal (e.g. "train 4x/week") may have no
    single numeric target at all, while a ``STRENGTH_TARGET``/``WEIGHT_TARGET``
    goal typically does. ``target_exercise_id`` gives a ``STRENGTH_TARGET``
    goal the specific lift it targets (e.g. "Bench 100kg" -> Bench Press);
    it is ``NULL`` for every other goal type.
    """

    __tablename__ = "goals"
    __table_args__ = (
        CheckConstraint(
            "target_value IS NULL OR target_value >= 0",
            name="ck_goals_target_value_non_negative",
        ),
        Index("ix_goals_user_id", "user_id"),
        Index("ix_goals_user_status", "user_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE", name="fk_goals_user_id_users"),
        nullable=False,
    )

    goal_type: Mapped[GoalType] = mapped_column(
        SAEnum(
            GoalType,
            name="goal_type_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)

    target_metric_type: Mapped[ProgressMetricType | None] = mapped_column(
        SAEnum(
            ProgressMetricType,
            name="progress_metric_type_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=True,
    )
    target_value: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    target_unit: Mapped[str | None] = mapped_column(String(20), nullable=True)
    target_exercise_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(
            "exercises.id",
            ondelete="SET NULL",
            name="fk_goals_target_exercise_id_exercises",
        ),
        nullable=True,
    )

    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    target_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    status: Mapped[GoalStatus] = mapped_column(
        SAEnum(
            GoalStatus,
            name="goal_status_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=GoalStatus.ACTIVE,
        nullable=False,
    )
    priority: Mapped[GoalPriority] = mapped_column(
        SAEnum(
            GoalPriority,
            name="goal_priority_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=GoalPriority.MEDIUM,
        nullable=False,
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
        return f"<Goal id={self.id} user_id={self.user_id} goal_type={self.goal_type.value} status={self.status.value}>"
