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
ADMIN_EXERCISE_CREATE = "admin.exercise.create"
ADMIN_EXERCISE_UPDATE = "admin.exercise.update"
ADMIN_EXERCISE_DEACTIVATE = "admin.exercise.deactivate"
ADMIN_PROGRAM_CREATE = "admin.program.create"
ADMIN_PROGRAM_UPDATE = "admin.program.update"
ADMIN_PROGRAM_PUBLISH = "admin.program.publish"
ADMIN_PROGRAM_ARCHIVE = "admin.program.archive"
ADMIN_PROGRAM_DAY_ADD = "admin.program.day.add"
ADMIN_PROGRAM_DAY_REMOVE = "admin.program.day.remove"
ADMIN_WORKOUT_CREATE = "admin.workout.create"
ADMIN_WORKOUT_UPDATE = "admin.workout.update"
ADMIN_WORKOUT_DEACTIVATE = "admin.workout.deactivate"
ADMIN_CATALOG_MUSCLE_GROUP_CREATE = "admin.catalog.muscle_group.create"
ADMIN_CATALOG_EQUIPMENT_CREATE = "admin.catalog.equipment.create"


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

    def run_audited(self, *, actor_id: uuid.UUID, action: str, target_type: str, operation):
        """Run a domain mutation and record success or failure in the audit log.

        ``operation`` is a zero-argument callable that performs the existing
        domain-service work. On success, ``target_id`` is taken from
        ``result.id`` when present. Failures are audited then re-raised.
        """
        try:
            result = operation()
        except Exception:
            self._record_audit(
                actor_id=actor_id,
                action=action,
                result=AdminAuditResult.FAILURE,
                target_type=target_type,
            )
            raise

        target_id = getattr(result, "id", None)
        self._record_audit(
            actor_id=actor_id,
            action=action,
            result=AdminAuditResult.SUCCESS,
            target_type=target_type,
            target_id=target_id if isinstance(target_id, uuid.UUID) else None,
        )
        return result

    def record_audited_delete(
        self,
        *,
        actor_id: uuid.UUID,
        action: str,
        target_type: str,
        target_id: uuid.UUID,
        operation,
    ) -> None:
        """Run a domain delete/remove and audit the outcome."""
        try:
            operation()
        except Exception:
            self._record_audit(
                actor_id=actor_id,
                action=action,
                result=AdminAuditResult.FAILURE,
                target_type=target_type,
                target_id=target_id,
            )
            raise
        self._record_audit(
            actor_id=actor_id,
            action=action,
            result=AdminAuditResult.SUCCESS,
            target_type=target_type,
            target_id=target_id,
        )

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
