"""Repository for persistence and retrieval of the ``Goal`` aggregate.

Contains no business logic — ownership checks, status-transition rules, and
any validation all live in :class:`~app.services.goal_service.GoalService`;
this class only translates calls into SQLAlchemy queries against an injected
:class:`~sqlalchemy.orm.Session` and returns ORM model instances, matching
:class:`~app.repositories.recovery_repository.RecoveryCheckInRepository`.
"""

import uuid
from datetime import datetime

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.models.goal import Goal, GoalStatus


class GoalRepository:
    """Data-access layer for the ``goals`` table."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, goal: Goal) -> Goal:
        """Persist a fully constructed :class:`Goal` instance and return it."""
        self.db.add(goal)
        self.db.flush()
        self.db.refresh(goal)
        return goal

    def get_by_id(self, goal_id: uuid.UUID) -> Goal | None:
        """Return the goal with the given id, or ``None`` if not found.

        Does not filter by ``deleted_at`` or ownership — applying such
        rules is a service-layer responsibility.
        """
        return self.db.execute(select(Goal).where(Goal.id == goal_id)).scalar_one_or_none()

    def update(self, goal: Goal) -> Goal:
        """Flush pending changes on an already-tracked :class:`Goal` and return it."""
        self.db.flush()
        self.db.refresh(goal)
        return goal

    def delete(self, goal: Goal) -> None:
        """Soft-delete a single goal by setting ``deleted_at``."""
        goal.deleted_at = datetime.now(goal.created_at.tzinfo)
        self.db.flush()

    def _filtered_query(
        self,
        user_id: uuid.UUID,
        *,
        status: GoalStatus | None,
    ) -> Select:
        """Build the shared filter predicate for :meth:`list_for_user` and :meth:`count`."""
        query = select(Goal).where(Goal.user_id == user_id, Goal.deleted_at.is_(None))
        if status is not None:
            query = query.where(Goal.status == status)
        return query

    def list_for_user(
        self,
        user_id: uuid.UUID,
        *,
        status: GoalStatus | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Goal]:
        """Return a filtered, paginated page of a user's goals, most recently created first."""
        query = self._filtered_query(user_id, status=status)
        query = query.order_by(Goal.created_at.desc()).limit(limit).offset(offset)
        return list(self.db.execute(query).scalars())

    def count(self, user_id: uuid.UUID, *, status: GoalStatus | None = None) -> int:
        """Return the total count of goals matching the same filters as :meth:`list_for_user`."""
        query = self._filtered_query(user_id, status=status)
        count_query = select(func.count()).select_from(query.subquery())
        return self.db.execute(count_query).scalar_one()

    def count_all(self) -> int:
        """Return the platform-wide count of non-deleted goals."""
        return self.db.execute(
            select(func.count()).select_from(Goal).where(Goal.deleted_at.is_(None))
        ).scalar_one()

    def list_all(
        self,
        *,
        user_id: uuid.UUID | None = None,
        status: GoalStatus | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Goal]:
        """Return a filtered, paginated page of goals across users, most recently created first."""
        query = select(Goal).where(Goal.deleted_at.is_(None))
        if user_id is not None:
            query = query.where(Goal.user_id == user_id)
        if status is not None:
            query = query.where(Goal.status == status)
        query = query.order_by(Goal.created_at.desc()).limit(limit).offset(offset)
        return list(self.db.execute(query).scalars())

    def count_filtered(
        self,
        *,
        user_id: uuid.UUID | None = None,
        status: GoalStatus | None = None,
    ) -> int:
        """Return the total count of goals matching :meth:`list_all`."""
        query = select(Goal).where(Goal.deleted_at.is_(None))
        if user_id is not None:
            query = query.where(Goal.user_id == user_id)
        if status is not None:
            query = query.where(Goal.status == status)
        count_query = select(func.count()).select_from(query.subquery())
        return self.db.execute(count_query).scalar_one()
