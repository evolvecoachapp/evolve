"""Admin control-plane routes — dashboard, users, health, session audit.

Routes stay thin: authorization is fully resolved by
``get_current_superuser`` before the handler body runs. User reads and
account-status changes delegate to :class:`~app.services.user_service.UserService`
(via :class:`~app.services.admin_service.AdminService` for audited mutations).
No database queries happen in this module.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import get_admin_service, get_user_service
from app.models.user import User
from app.schemas.admin import (
    AdminAccountStatusUpdate,
    AdminActivityCounts,
    AdminDashboardSummary,
    AdminSessionResponse,
    AdminSystemHealth,
    AdminUserCounts,
    AdminUserPage,
)
from app.schemas.user import UserRead
from app.security.dependencies import get_current_superuser
from app.services.admin_service import AdminService
from app.services.user_service import UserNotFoundError, UserService

router = APIRouter(prefix="/admin", tags=["admin"])


def _not_found() -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")


@router.post("/session", response_model=AdminSessionResponse)
def start_admin_session(
    current_user: User = Depends(get_current_superuser),
    admin_service: AdminService = Depends(get_admin_service),
) -> AdminSessionResponse:
    """Confirm superuser access and record an admin session-start audit event."""
    admin_service.start_session(current_user)
    return AdminSessionResponse.model_validate(current_user)


@router.delete("/session", status_code=status.HTTP_204_NO_CONTENT)
def end_admin_session(
    current_user: User = Depends(get_current_superuser),
    admin_service: AdminService = Depends(get_admin_service),
) -> None:
    """Record an admin session-end audit event. Token discard is client-side."""
    admin_service.end_session(current_user)


@router.get("/me", response_model=AdminSessionResponse)
def get_admin_me(
    current_user: User = Depends(get_current_superuser),
) -> AdminSessionResponse:
    """Return the authenticated administrator's identity."""
    return AdminSessionResponse.model_validate(current_user)


@router.get("/dashboard", response_model=AdminDashboardSummary)
def get_admin_dashboard(
    _current_user: User = Depends(get_current_superuser),
    admin_service: AdminService = Depends(get_admin_service),
) -> AdminDashboardSummary:
    """Return platform-wide user and activity counts."""
    summary = admin_service.get_dashboard_summary()
    return AdminDashboardSummary(
        users=AdminUserCounts(**summary.users),
        activity=AdminActivityCounts(**summary.activity),
    )


@router.get("/health", response_model=AdminSystemHealth)
def get_admin_health(
    _current_user: User = Depends(get_current_superuser),
    admin_service: AdminService = Depends(get_admin_service),
) -> AdminSystemHealth:
    """Return sanitized API and database health. Never includes raw errors."""
    health = admin_service.get_system_health()
    return AdminSystemHealth(
        status=health.status,
        api=health.api,
        database=health.database,
        version=health.version,
    )


@router.get("/users", response_model=AdminUserPage)
def list_admin_users(
    is_active: bool | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    _current_user: User = Depends(get_current_superuser),
    user_service: UserService = Depends(get_user_service),
) -> AdminUserPage:
    """Return a paginated page of live users."""
    page = user_service.list_users(is_active=is_active, limit=limit, offset=offset)
    return AdminUserPage(
        items=[UserRead.model_validate(user) for user in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/users/{user_id}", response_model=UserRead)
def get_admin_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_superuser),
    user_service: UserService = Depends(get_user_service),
) -> UserRead:
    """Return a single live user, including administrative fields."""
    try:
        user = user_service.get_user(user_id)
    except UserNotFoundError as exc:
        raise _not_found() from exc
    return UserRead.model_validate(user)


@router.patch("/users/{user_id}/status", response_model=UserRead)
def update_admin_user_status(
    user_id: uuid.UUID,
    data: AdminAccountStatusUpdate,
    current_user: User = Depends(get_current_superuser),
    admin_service: AdminService = Depends(get_admin_service),
) -> UserRead:
    """Activate or deactivate a user via the existing ``is_active`` field.

    Raises:
        HTTPException: 400 if the administrator attempts to deactivate
            their own account; 404 if the user does not exist.
    """
    if current_user.id == user_id and not data.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account.",
        )
    try:
        updated = admin_service.set_user_account_status(
            current_user.id, user_id, is_active=data.is_active
        )
    except UserNotFoundError as exc:
        raise _not_found() from exc
    return UserRead.model_validate(updated)
