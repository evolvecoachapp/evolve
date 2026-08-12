"""Pydantic v2 schemas for the Admin control-plane API.

Admin responses may include ``is_superuser`` (via :class:`UserRead`) because
every consumer of these schemas is already authorized as a superuser.
``hashed_password`` is never included.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.user import UserRead


class AdminSessionResponse(BaseModel):
    """Current administrator identity after a session start."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    username: str
    first_name: str | None
    last_name: str | None
    is_superuser: bool


class AdminUserCounts(BaseModel):
    """Live-user totals for the Admin dashboard."""

    total: int
    active: int
    inactive: int
    superusers: int


class AdminActivityCounts(BaseModel):
    """Platform-wide activity totals from existing domain tables."""

    workout_logs: int
    meal_logs: int
    recovery_check_ins: int
    goals: int
    progress_entries: int
    conversations: int


class AdminDashboardSummary(BaseModel):
    """Admin dashboard summary payload."""

    users: AdminUserCounts
    activity: AdminActivityCounts


class AdminSystemHealth(BaseModel):
    """Sanitized system health. Never includes raw exception text or secrets."""

    status: str
    api: str
    database: str
    version: str


class AdminUserPage(BaseModel):
    """A paginated page of administrative user records."""

    items: list[UserRead]
    total: int
    limit: int
    offset: int


class AdminAccountStatusUpdate(BaseModel):
    """Input schema for activating or deactivating a user account."""

    is_active: bool


class AdminAuditLogRead(BaseModel):
    """Public representation of an audit row (no secrets)."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    actor_id: uuid.UUID | None
    action: str
    target_type: str | None
    target_id: uuid.UUID | None
    result: str
    created_at: datetime
