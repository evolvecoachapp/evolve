"""Repository for persistence and retrieval of the ``RecoveryCheckIn`` aggregate.

Owns :class:`~app.models.recovery.RecoveryCheckIn` only — training-load
aggregation over :class:`~app.models.workout_log.WorkoutLog` history lives on
:class:`~app.repositories.workout_log_repository.WorkoutLogRepository`
instead (see Decision 014 in ``docs/DECISIONS.md``), since that data
belongs to a different aggregate and this repository has no business
composing across aggregates. Contains no business logic — the one-per-day
uniqueness rule, ownership checks, and any validation all live in
:class:`~app.services.recovery_service.RecoveryService`; this class only
translates calls into SQLAlchemy queries against an injected
:class:`~sqlalchemy.orm.Session` and returns ORM model instances.
"""

import uuid
from datetime import date, datetime

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.models.recovery import RecoveryCheckIn


class RecoveryCheckInRepository:
    """Data-access layer for the ``recovery_check_ins`` table.

    The session is injected by the caller rather than created internally,
    keeping this class testable and free of lifecycle concerns (matches
    :class:`~app.repositories.meal_repository.MealRepository`).
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, check_in: RecoveryCheckIn) -> RecoveryCheckIn:
        """Persist a fully constructed :class:`RecoveryCheckIn` instance and return it."""
        self.db.add(check_in)
        self.db.flush()
        self.db.refresh(check_in)
        return check_in

    def get_by_id(self, check_in_id: uuid.UUID) -> RecoveryCheckIn | None:
        """Return the check-in with the given id, or ``None`` if not found.

        Does not filter by ``deleted_at`` or ownership — applying such
        rules is a service-layer responsibility.
        """
        return self.db.execute(
            select(RecoveryCheckIn).where(RecoveryCheckIn.id == check_in_id)
        ).scalar_one_or_none()

    def get_for_user_and_date(
        self, user_id: uuid.UUID, checkin_date: date
    ) -> RecoveryCheckIn | None:
        """Return the user's check-in for a single calendar date, or ``None``.

        Backs both the one-per-day uniqueness check in
        :meth:`~app.services.recovery_service.RecoveryService.create_check_in`
        and :meth:`~app.services.recovery_service.RecoveryService.get_daily_readiness`.
        """
        return self.db.execute(
            select(RecoveryCheckIn).where(
                RecoveryCheckIn.user_id == user_id,
                RecoveryCheckIn.checkin_date == checkin_date,
                RecoveryCheckIn.deleted_at.is_(None),
            )
        ).scalar_one_or_none()

    def update(self, check_in: RecoveryCheckIn) -> RecoveryCheckIn:
        """Flush pending changes on an already-tracked :class:`RecoveryCheckIn` and return it.

        The caller is expected to mutate attributes on an instance obtained
        from this session before calling this method (matches
        :meth:`~app.repositories.meal_repository.MealRepository.update_meal`).
        """
        self.db.flush()
        self.db.refresh(check_in)
        return check_in

    def delete(self, check_in: RecoveryCheckIn) -> None:
        """Soft-delete a single check-in by setting ``deleted_at``."""
        check_in.deleted_at = datetime.now(check_in.created_at.tzinfo)
        self.db.flush()

    def _filtered_query(
        self,
        user_id: uuid.UUID,
        *,
        date_from: date | None,
        date_to: date | None,
    ) -> Select:
        """Build the shared filter predicate for :meth:`list_for_user` and :meth:`count`."""
        query = select(RecoveryCheckIn).where(
            RecoveryCheckIn.user_id == user_id,
            RecoveryCheckIn.deleted_at.is_(None),
        )
        if date_from is not None:
            query = query.where(RecoveryCheckIn.checkin_date >= date_from)
        if date_to is not None:
            query = query.where(RecoveryCheckIn.checkin_date <= date_to)
        return query

    def list_for_user(
        self,
        user_id: uuid.UUID,
        *,
        date_from: date | None = None,
        date_to: date | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[RecoveryCheckIn]:
        """Return a filtered, paginated page of a user's check-ins, most recent first."""
        query = self._filtered_query(user_id, date_from=date_from, date_to=date_to)
        query = query.order_by(RecoveryCheckIn.checkin_date.desc()).limit(limit).offset(offset)
        return list(self.db.execute(query).scalars())

    def count(
        self,
        user_id: uuid.UUID,
        *,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> int:
        """Return the total count of check-ins matching the same filters as :meth:`list_for_user`."""
        query = self._filtered_query(user_id, date_from=date_from, date_to=date_to)
        count_query = select(func.count()).select_from(query.subquery())
        return self.db.execute(count_query).scalar_one()

    def count_all(self) -> int:
        """Return the platform-wide count of non-deleted recovery check-ins."""
        return self.db.execute(
            select(func.count())
            .select_from(RecoveryCheckIn)
            .where(RecoveryCheckIn.deleted_at.is_(None))
        ).scalar_one()
