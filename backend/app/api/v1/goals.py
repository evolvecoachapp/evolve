"""Goal routes — personal fitness target CRUD.

Routes stay thin: parse/validate input, delegate to
:class:`~app.services.goal_service.GoalService`, and translate its
documented exceptions into HTTP responses. No business logic or database
queries happen in this module.

Every route requires an authenticated user (``Depends(get_current_user)``);
``user_id`` is always taken from the resolved token, never from the request
body or path, mirroring ``recovery.py``.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import get_goal_service
from app.models.goal import GoalStatus
from app.models.user import User
from app.schemas.goal import GoalCreate, GoalPage, GoalRead, GoalUpdate
from app.security.dependencies import get_current_user
from app.services.goal_service import GoalNotFoundError, GoalService

router = APIRouter(prefix="/goals", tags=["goals"])


def _not_found(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


@router.post("", response_model=GoalRead, status_code=status.HTTP_201_CREATED)
def create_goal(
    data: GoalCreate,
    current_user: User = Depends(get_current_user),
    goal_service: GoalService = Depends(get_goal_service),
) -> GoalRead:
    """Create a new goal owned by the current user."""
    goal = goal_service.create_goal(current_user.id, data)
    return GoalRead.from_model(goal)


@router.get("", response_model=GoalPage)
def list_goals(
    status_filter: GoalStatus | None = Query(default=None, alias="status"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    goal_service: GoalService = Depends(get_goal_service),
) -> GoalPage:
    """Return a filtered, paginated page of the current user's goals, most recently created first."""
    page = goal_service.list_goals(
        current_user.id, status=status_filter, limit=limit, offset=offset
    )
    return GoalPage(
        items=[GoalRead.from_model(goal) for goal in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/{goal_id}", response_model=GoalRead)
def get_goal(
    goal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    goal_service: GoalService = Depends(get_goal_service),
) -> GoalRead:
    """Return a single goal owned by the current user.

    Raises:
        HTTPException: 404 if the goal doesn't exist or isn't owned by
            this user.
    """
    try:
        goal = goal_service.get_goal(current_user.id, goal_id)
    except GoalNotFoundError as exc:
        raise _not_found("Goal not found.") from exc
    return GoalRead.from_model(goal)


@router.patch("/{goal_id}", response_model=GoalRead)
def update_goal(
    goal_id: uuid.UUID,
    data: GoalUpdate,
    current_user: User = Depends(get_current_user),
    goal_service: GoalService = Depends(get_goal_service),
) -> GoalRead:
    """Partially update a goal owned by the current user, including status/priority changes.

    Raises:
        HTTPException: 404 if the goal doesn't exist or isn't owned by
            this user.
    """
    try:
        goal = goal_service.update_goal(current_user.id, goal_id, data)
    except GoalNotFoundError as exc:
        raise _not_found("Goal not found.") from exc
    return GoalRead.from_model(goal)


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    goal_service: GoalService = Depends(get_goal_service),
) -> None:
    """Delete a goal owned by the current user.

    Raises:
        HTTPException: 404 if the goal doesn't exist or isn't owned by
            this user.
    """
    try:
        goal_service.delete_goal(current_user.id, goal_id)
    except GoalNotFoundError as exc:
        raise _not_found("Goal not found.") from exc
