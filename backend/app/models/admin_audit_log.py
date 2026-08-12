"""SQLAlchemy model for administrator action audit records.

Smallest operational audit trail for the Admin control plane (Sprint 39.1).
This is not an event-sourcing log: one append-only row per administrative
action, recording who did what to which target, when, and whether it
succeeded. No payloads, tokens, or secrets are stored.
"""

import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, Index, String, Uuid, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class AdminAuditResult(str, Enum):
    """Outcome of an audited administrative action."""

    SUCCESS = "success"
    FAILURE = "failure"


class AdminAuditLog(Base):
    """A single administrator action recorded for operational traceability.

    ``actor_id`` is the authenticated superuser who performed the action.
    It is nullable with ``ON DELETE SET NULL`` so the audit row survives
    if the administrator account is later removed.
    """

    __tablename__ = "admin_audit_logs"
    __table_args__ = (
        Index("ix_admin_audit_logs_actor_id", "actor_id"),
        Index("ix_admin_audit_logs_created_at", "created_at"),
        Index("ix_admin_audit_logs_action", "action"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    actor_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL", name="fk_admin_audit_logs_actor_id_users"),
        nullable=True,
    )

    action: Mapped[str] = mapped_column(String(100), nullable=False)
    target_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    target_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True)

    result: Mapped[AdminAuditResult] = mapped_column(
        SAEnum(
            AdminAuditResult,
            name="admin_audit_result_enum",
            native_enum=True,
            validate_strings=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        """Return an unambiguous representation useful for logs and debugging."""
        return (
            f"<AdminAuditLog id={self.id} action={self.action!r} "
            f"actor_id={self.actor_id} result={self.result.value}>"
        )
