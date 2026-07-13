"""Repository for persistence and retrieval of the ``Progress`` aggregate.

Contains no business logic — ownership checks, minimum-data-point rules for
trend analysis, and any validation all live in
:class:`~app.services.progress_service.ProgressService`; this class only
translates calls into SQLAlchemy queries against an injected
:class:`~sqlalchemy.orm.Session` and returns ORM model instances, matching
:class:`~app.repositories.recovery_repository.RecoveryCheckInRepository`.
"""

import uuid
from datetime import date, datetime

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.models.progress import Progress, ProgressMetricType


class ProgressRepository:
    """Data-access layer for the ``progress_entries`` table."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, entry: Progress) -> Progress:
        """Persist a fully constructed :class:`Progress` instance and return it."""
        self.db.add(entry)
        self.db.flush()
        self.db.refresh(entry)
        return entry

    def get_by_id(self, entry_id: uuid.UUID) -> Progress | None:
        """Return the progress entry with the given id, or ``None`` if not found.

        Does not filter by ``deleted_at`` or ownership — applying such
        rules is a service-layer responsibility.
        """
        return self.db.execute(select(Progress).where(Progress.id == entry_id)).scalar_one_or_none()

    def delete(self, entry: Progress) -> None:
        """Soft-delete a single progress entry by setting ``deleted_at``."""
        entry.deleted_at = datetime.now(entry.created_at.tzinfo)
        self.db.flush()

    def _filtered_query(
        self,
        user_id: uuid.UUID,
        *,
        metric_type: ProgressMetricType | None,
        goal_id: uuid.UUID | None,
        date_from: date | None,
        date_to: date | None,
    ) -> Select:
        """Build the shared filter predicate for list/count/windowed queries."""
        query = select(Progress).where(Progress.user_id == user_id, Progress.deleted_at.is_(None))
        if metric_type is not None:
            query = query.where(Progress.metric_type == metric_type)
        if goal_id is not None:
            query = query.where(Progress.goal_id == goal_id)
        if date_from is not None:
            query = query.where(Progress.recorded_date >= date_from)
        if date_to is not None:
            query = query.where(Progress.recorded_date <= date_to)
        return query

    def list_for_user(
        self,
        user_id: uuid.UUID,
        *,
        metric_type: ProgressMetricType | None = None,
        goal_id: uuid.UUID | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Progress]:
        """Return a filtered, paginated page of a user's progress entries, most recent first."""
        query = self._filtered_query(
            user_id, metric_type=metric_type, goal_id=goal_id, date_from=date_from, date_to=date_to
        )
        query = query.order_by(Progress.recorded_date.desc()).limit(limit).offset(offset)
        return list(self.db.execute(query).scalars())

    def count(
        self,
        user_id: uuid.UUID,
        *,
        metric_type: ProgressMetricType | None = None,
        goal_id: uuid.UUID | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> int:
        """Return the total count of entries matching the same filters as :meth:`list_for_user`."""
        query = self._filtered_query(
            user_id, metric_type=metric_type, goal_id=goal_id, date_from=date_from, date_to=date_to
        )
        count_query = select(func.count()).select_from(query.subquery())
        return self.db.execute(count_query).scalar_one()

    def list_for_trend(
        self,
        user_id: uuid.UUID,
        metric_type: ProgressMetricType,
        *,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> list[Progress]:
        """Return every matching entry (unpaginated, chronological) for trend analysis.

        Unlike :meth:`list_for_user` (most-recent-first, paginated for
        display), the Progress Analyzer needs the *complete*, chronological
        (oldest first) series over a window to compute a trend — so this
        method deliberately has no ``limit``/``offset``.
        """
        query = self._filtered_query(
            user_id, metric_type=metric_type, goal_id=None, date_from=date_from, date_to=date_to
        )
        query = query.order_by(Progress.recorded_date.asc())
        return list(self.db.execute(query).scalars())
