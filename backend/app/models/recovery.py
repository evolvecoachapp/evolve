"""SQLAlchemy model for the Recovery Check-In domain entity.

``RecoveryCheckIn`` is a single daily readiness journal entry — always
strictly personal (never shared/public, unlike :class:`~app.models.meal.Meal`),
mirroring :class:`~app.models.workout_log.WorkoutLog`'s ``NOT NULL`` owner
shape rather than the catalog-vs-authored pattern. Exactly one check-in is
allowed per ``(user_id, checkin_date)`` pair (see Decision 015 in
``docs/DECISIONS.md``) — matching the "daily journal" cadence already
established by ``NutritionService.get_daily_nutrition``'s per-date
aggregation over ``MealLog`` rows.

Deliberately does **not** carry a training-load field: per Decision 014,
training load is derived by :class:`~app.services.recovery_service.RecoveryService`
from existing :class:`~app.models.workout_log.WorkoutLog`/``WorkoutSetLog``
history at read time, not captured here as a manually self-reported value.
"""

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    Text,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class RecoveryCheckIn(Base):
    """A single daily readiness check-in for one user.

    ``sleep_quality``, ``soreness``, and ``fatigue`` are all 1-5 Likert
    ratings; ``sleep_quality`` is "higher is better" (1 = poor, 5 =
    excellent) while ``soreness``/``fatigue`` are "higher is worse"
    (1 = none/fresh, 5 = severe/exhausted) — see
    :mod:`app.ai.recovery_engine` for how each is normalized before scoring.
    ``resting_heart_rate``/``hrv_ms`` are optional, manually entered values;
    no wearable/device integration exists yet.
    """

    __tablename__ = "recovery_check_ins"
    __table_args__ = (
        CheckConstraint(
            "sleep_hours >= 0 AND sleep_hours <= 24",
            name="ck_recovery_check_ins_sleep_hours_range_valid",
        ),
        CheckConstraint(
            "sleep_quality >= 1 AND sleep_quality <= 5",
            name="ck_recovery_check_ins_sleep_quality_range_valid",
        ),
        CheckConstraint(
            "soreness >= 1 AND soreness <= 5",
            name="ck_recovery_check_ins_soreness_range_valid",
        ),
        CheckConstraint(
            "fatigue >= 1 AND fatigue <= 5",
            name="ck_recovery_check_ins_fatigue_range_valid",
        ),
        CheckConstraint(
            "resting_heart_rate IS NULL OR resting_heart_rate > 0",
            name="ck_recovery_check_ins_resting_heart_rate_positive",
        ),
        CheckConstraint(
            "hrv_ms IS NULL OR hrv_ms > 0",
            name="ck_recovery_check_ins_hrv_ms_positive",
        ),
        Index("ix_recovery_check_ins_user_id", "user_id"),
        Index(
            "uq_recovery_check_ins_user_checkin_date",
            "user_id",
            "checkin_date",
            unique=True,
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE", name="fk_recovery_check_ins_user_id"),
        nullable=False,
    )
    checkin_date: Mapped[date] = mapped_column(Date, nullable=False)

    sleep_hours: Mapped[Decimal] = mapped_column(Numeric(4, 2), nullable=False)
    sleep_quality: Mapped[int] = mapped_column(nullable=False)
    soreness: Mapped[int] = mapped_column(nullable=False)
    fatigue: Mapped[int] = mapped_column(nullable=False)

    resting_heart_rate: Mapped[int | None] = mapped_column(nullable=True)
    hrv_ms: Mapped[int | None] = mapped_column(nullable=True)
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
            f"<RecoveryCheckIn id={self.id} user_id={self.user_id} "
            f"checkin_date={self.checkin_date}>"
        )
