"""Business logic for the Goal domain — CRUD and status transitions.

``GoalService`` composes only :class:`~app.repositories.goal_repository.GoalRepository`
— no service-to-service composition, matching
:class:`~app.services.recovery_service.RecoveryService`'s precedent.
Contains no HTTP concepts and no raw SQL — the API layer translates this
service's return values and documented exceptions into request/response
schemas and HTTP status codes.
"""

import uuid

from app.models.goal import Goal, GoalStatus
from app.repositories.goal_repository import GoalRepository
from app.schemas.goal import GoalCreate, GoalUpdate
from app.utils.pagination import Page, clamp_pagination

__all__ = ["GoalServiceError", "GoalNotFoundError", "GoalService"]


class GoalServiceError(Exception):
    """Base class for all errors raised by :class:`GoalService`."""


class GoalNotFoundError(GoalServiceError):
    """Raised when a referenced goal does not resolve to one owned by this user."""


class GoalService:
    """Goal CRUD and status-transition workflows.

    Depends on an injected repository rather than a raw
    :class:`~sqlalchemy.orm.Session`, so it can be unit-tested with mocks
    (matches :class:`~app.services.recovery_service.RecoveryService`).
    """

    def __init__(self, goal_repository: GoalRepository) -> None:
        self.goal_repository = goal_repository

    def create_goal(self, user_id: uuid.UUID, data: GoalCreate) -> Goal:
        """Create a new goal owned by ``user_id``."""
        goal = Goal(
            user_id=user_id,
            goal_type=data.goal_type,
            description=data.description,
            target_metric_type=data.target_metric_type,
            target_value=data.target_value,
            target_unit=data.target_unit,
            target_exercise_id=data.target_exercise_id,
            start_date=data.start_date,
            target_date=data.target_date,
            status=GoalStatus.ACTIVE,
            priority=data.priority,
        )
        created = self.goal_repository.create(goal)
        self.goal_repository.db.commit()
        return created

    def update_goal(self, user_id: uuid.UUID, goal_id: uuid.UUID, data: GoalUpdate) -> Goal:
        """Partially update a goal owned by ``user_id``, including status/priority transitions.

        Raises:
            GoalNotFoundError: If ``goal_id`` does not resolve, or is not
                owned by ``user_id``.
        """
        goal = self._get_owned_goal_or_raise(user_id, goal_id)

        if data.description is not None:
            goal.description = data.description
        if data.target_metric_type is not None:
            goal.target_metric_type = data.target_metric_type
        if data.target_value is not None:
            goal.target_value = data.target_value
        if data.target_unit is not None:
            goal.target_unit = data.target_unit
        if data.target_exercise_id is not None:
            goal.target_exercise_id = data.target_exercise_id
        if data.target_date is not None:
            goal.target_date = data.target_date
        if data.status is not None:
            goal.status = data.status
        if data.priority is not None:
            goal.priority = data.priority

        updated = self.goal_repository.update(goal)
        self.goal_repository.db.commit()
        return updated

    def get_goal(self, user_id: uuid.UUID, goal_id: uuid.UUID) -> Goal:
        """Return a single goal owned by ``user_id``.

        Raises:
            GoalNotFoundError: If ``goal_id`` does not resolve, or is not
                owned by ``user_id``.
        """
        return self._get_owned_goal_or_raise(user_id, goal_id)

    def list_goals(
        self,
        user_id: uuid.UUID,
        *,
        status: GoalStatus | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Page[Goal]:
        """Return a filtered, paginated page of a user's goals, most recently created first."""
        safe_limit, safe_offset = clamp_pagination(limit, offset)
        items = self.goal_repository.list_for_user(
            user_id, status=status, limit=safe_limit, offset=safe_offset
        )
        total = self.goal_repository.count(user_id, status=status)
        return Page(items=items, total=total, limit=safe_limit, offset=safe_offset)

    def get_any_goal(self, goal_id: uuid.UUID) -> Goal:
        """Return a goal by id without an ownership check (admin control plane).

        Raises:
            GoalNotFoundError: If ``goal_id`` does not resolve to a non-deleted goal.
        """
        goal = self.goal_repository.get_by_id(goal_id)
        if goal is None or goal.deleted_at is not None:
            raise GoalNotFoundError("Goal not found.")
        return goal

    def list_all_goals(
        self,
        *,
        user_id: uuid.UUID | None = None,
        status: GoalStatus | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Page[Goal]:
        """Return a filtered, paginated page of goals across users."""
        safe_limit, safe_offset = clamp_pagination(limit, offset)
        items = self.goal_repository.list_all(
            user_id=user_id, status=status, limit=safe_limit, offset=safe_offset
        )
        total = self.goal_repository.count_filtered(user_id=user_id, status=status)
        return Page(items=items, total=total, limit=safe_limit, offset=safe_offset)

    def delete_goal(self, user_id: uuid.UUID, goal_id: uuid.UUID) -> None:
        """Soft-delete a goal owned by ``user_id``.

        Raises:
            GoalNotFoundError: If ``goal_id`` does not resolve, or is not
                owned by ``user_id``.
        """
        goal = self._get_owned_goal_or_raise(user_id, goal_id)
        self.goal_repository.delete(goal)
        self.goal_repository.db.commit()

    # -- Internal helpers -----------------------------------------------------

    def _get_owned_goal_or_raise(self, user_id: uuid.UUID, goal_id: uuid.UUID) -> Goal:
        goal = self.goal_repository.get_by_id(goal_id)
        if goal is None or goal.deleted_at is not None or goal.user_id != user_id:
            raise GoalNotFoundError("Goal not found.")
        return goal
