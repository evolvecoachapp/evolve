"""Pydantic v2 schemas for the Admin control-plane API.

Admin responses may include ``is_superuser`` (via :class:`UserRead`) because
every consumer of these schemas is already authorized as a superuser.
``hashed_password`` is never included.
"""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.program import ProgramAssignmentRead, ProgramDayRead, ProgramPublic
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


class AdminWorkoutLogSummary(BaseModel):
    """Admin list row for a workout log, including the owning user."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    program_assignment_id: uuid.UUID | None
    workout_id: uuid.UUID | None
    status: str
    scheduled_date: date | None
    started_at: datetime | None
    completed_at: datetime | None
    duration_actual_minutes: int | None
    notes: str | None
    exercise_count: int
    created_at: datetime

    @classmethod
    def from_model(cls, workout_log) -> "AdminWorkoutLogSummary":
        """Build this schema from a :class:`~app.models.workout_log.WorkoutLog`."""
        return cls(
            id=workout_log.id,
            user_id=workout_log.user_id,
            program_assignment_id=workout_log.program_assignment_id,
            workout_id=workout_log.workout_id,
            status=workout_log.status.value,
            scheduled_date=workout_log.scheduled_date,
            started_at=workout_log.started_at,
            completed_at=workout_log.completed_at,
            duration_actual_minutes=workout_log.duration_actual_minutes,
            notes=workout_log.notes,
            exercise_count=len(workout_log.log_exercises),
            created_at=workout_log.created_at,
        )


class AdminWorkoutLogPage(BaseModel):
    """A paginated page of admin workout-log summaries."""

    items: list[AdminWorkoutLogSummary]
    total: int
    limit: int
    offset: int


class AdminConversationRead(BaseModel):
    """Admin representation of a Coach conversation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    last_message_at: datetime | None


class AdminConversationPage(BaseModel):
    """A paginated page of Coach conversations."""

    items: list[AdminConversationRead]
    total: int
    limit: int
    offset: int


class AdminProgramDetail(BaseModel):
    """Program template plus scheduled days and assignments."""

    program: ProgramPublic
    days: list[ProgramDayRead]
    assignments: list[ProgramAssignmentRead]
