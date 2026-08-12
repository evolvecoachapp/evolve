"""Repository for persistence of :class:`~app.models.admin_audit_log.AdminAuditLog`.

Contains no authorization or domain rules — this class only inserts audit
rows against an injected :class:`~sqlalchemy.orm.Session`.
"""

import uuid

from sqlalchemy.orm import Session

from app.models.admin_audit_log import AdminAuditLog, AdminAuditResult


class AdminAuditLogRepository:
    """Data-access layer for the ``admin_audit_logs`` table."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(
        self,
        *,
        actor_id: uuid.UUID | None,
        action: str,
        result: AdminAuditResult,
        target_type: str | None = None,
        target_id: uuid.UUID | None = None,
    ) -> AdminAuditLog:
        """Persist a fully constructed audit row and return it."""
        entry = AdminAuditLog(
            actor_id=actor_id,
            action=action,
            result=result,
            target_type=target_type,
            target_id=target_id,
        )
        self.db.add(entry)
        self.db.flush()
        self.db.refresh(entry)
        return entry
