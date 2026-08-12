"""create admin audit logs table

Revision ID: c3a91f0e7b12
Revises: 37fd64b528a8
Create Date: 2026-08-13 00:00:00.000000

Sprint 39.1 — Admin Foundation. Introduces ``admin_audit_logs`` as the
smallest operational audit trail for administrator actions (identity,
action, target, timestamp, result). Not an event-sourcing log.
``admin_audit_result_enum`` is created/dropped explicitly with
``checkfirst=True`` so autogenerate's implicit enum handling cannot
leave an orphan type on downgrade.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "c3a91f0e7b12"
down_revision: Union[str, Sequence[str], None] = "37fd64b528a8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

admin_audit_result_enum = postgresql.ENUM(
    "success",
    "failure",
    name="admin_audit_result_enum",
    create_type=False,
)


def upgrade() -> None:
    """Upgrade schema."""
    admin_audit_result_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "admin_audit_logs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("actor_id", sa.Uuid(), nullable=True),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("target_type", sa.String(length=50), nullable=True),
        sa.Column("target_id", sa.Uuid(), nullable=True),
        sa.Column("result", admin_audit_result_enum, nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["actor_id"],
            ["users.id"],
            name="fk_admin_audit_logs_actor_id_users",
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_admin_audit_logs_actor_id", "admin_audit_logs", ["actor_id"], unique=False)
    op.create_index(
        "ix_admin_audit_logs_created_at", "admin_audit_logs", ["created_at"], unique=False
    )
    op.create_index("ix_admin_audit_logs_action", "admin_audit_logs", ["action"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_admin_audit_logs_action", table_name="admin_audit_logs")
    op.drop_index("ix_admin_audit_logs_created_at", table_name="admin_audit_logs")
    op.drop_index("ix_admin_audit_logs_actor_id", table_name="admin_audit_logs")
    op.drop_table("admin_audit_logs")
    admin_audit_result_enum.drop(op.get_bind(), checkfirst=True)
