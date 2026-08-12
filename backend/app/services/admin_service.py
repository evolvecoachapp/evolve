"""Operational Admin control-plane service.

Not a second domain layer: user reads/mutations delegate to
:class:`~app.services.user_service.UserService`. Dashboard activity counts
use existing repositories (domain services are user-scoped and have no
platform-wide aggregates). Audit writes go to
:class:`~app.repositories.admin_audit_log_repository.AdminAuditLogRepository`.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.admin_audit_log import AdminAuditResult
from app.models.user import User
from app.repositories.admin_audit_log_repository import AdminAuditLogRepository
from app.repositories.chat_repository import ChatRepository
from app.repositories.goal_repository import GoalRepository
from app.repositories.meal_repository import MealRepository
from app.repositories.progress_repository import ProgressRepository
from app.repositories.recovery_repository import RecoveryCheckInRepository
from app.repositories.workout_log_repository import WorkoutLogRepository
from app.services.user_service import UserService

ADMIN_SESSION_START = "admin.session.start"
ADMIN_SESSION_END = "admin.session.end"
ADMIN_USER_SET_STATUS = "admin.user.set_status"


@dataclass(frozen=True)
class AdminDashboardSummary:
    """Platform-wide counts for the Admin dashboard."""

    users: dict[str, int]
    activity: dict[str, int]


@dataclass(frozen=True)
class AdminSystemHealth:
    """Sanitized system health — never includes raw exception text."""

    status: str
    api: str
    database: str
    version: str


class AdminService:
    """Admin operational workflows: dashboard, health, session audit, user status."""

    def __init__(
        self,
        db: Session,
        user_service: UserService,
        audit_repository: AdminAuditLogRepository,
        workout_log_repository: WorkoutLogRepository,
        meal_repository: MealRepository,
        recovery_repository: RecoveryCheckInRepository,
        goal_repository: GoalRepository,
        progress_repository: ProgressRepository,
        chat_repository: ChatRepository,
    ) -> None:
        self.db = db
        self.user_service = user_service
        self.audit_repository = audit_repository
        self.workout_log_repository = workout_log_repository
        self.meal_repository = meal_repository
        self.recovery_repository = recovery_repository
        self.goal_repository = goal_repository
        self.progress_repository = progress_repository
        self.chat_repository = chat_repository

    def get_dashboard_summary(self) -> AdminDashboardSummary:
        """Compose live user counts from UserService with activity counts from existing repos."""
        return AdminDashboardSummary(
            users=self.user_service.count_users(),
            activity={
                "workout_logs": self.workout_log_repository.count_all(),
                "meal_logs": self.meal_repository.count_all_logs(),
                "recovery_check_ins": self.recovery_repository.count_all(),
                "goals": self.goal_repository.count_all(),
                "progress_entries": self.progress_repository.count_all(),
                "conversations": self.chat_repository.count_conversations(),
            },
        )

    def get_system_health(self) -> AdminSystemHealth:
        """Ping PostgreSQL and return a sanitized health snapshot."""
        database = "connected"
        try:
            self.db.execute(select(1))
        except Exception:
            database = "unavailable"

        status = "ok" if database == "connected" else "degraded"
        return AdminSystemHealth(
            status=status,
            api="online",
            database=database,
            version=settings.api_version,
        )

    def start_session(self, actor: User) -> User:
        """Record a successful admin session start for the authenticated superuser."""
        self._record_audit(
            actor_id=actor.id,
            action=ADMIN_SESSION_START,
            result=AdminAuditResult.SUCCESS,
        )
        return actor

    def end_session(self, actor: User) -> None:
        """Record a successful admin session end (logout)."""
        self._record_audit(
            actor_id=actor.id,
            action=ADMIN_SESSION_END,
            result=AdminAuditResult.SUCCESS,
        )

    def set_user_account_status(
        self,
        actor_id: uuid.UUID,
        user_id: uuid.UUID,
        *,
        is_active: bool,
    ) -> User:
        """Delegate account-status change to UserService and audit the result."""
        try:
            updated = self.user_service.set_account_status(user_id, is_active=is_active)
        except Exception:
            self._record_audit(
                actor_id=actor_id,
                action=ADMIN_USER_SET_STATUS,
                result=AdminAuditResult.FAILURE,
                target_type="user",
                target_id=user_id,
            )
            raise

        self._record_audit(
            actor_id=actor_id,
            action=ADMIN_USER_SET_STATUS,
            result=AdminAuditResult.SUCCESS,
            target_type="user",
            target_id=user_id,
        )
        return updated

    def _record_audit(
        self,
        *,
        actor_id: uuid.UUID,
        action: str,
        result: AdminAuditResult,
        target_type: str | None = None,
        target_id: uuid.UUID | None = None,
    ) -> None:
        self.audit_repository.create(
            actor_id=actor_id,
            action=action,
            result=result,
            target_type=target_type,
            target_id=target_id,
        )
        self.audit_repository.db.commit()
