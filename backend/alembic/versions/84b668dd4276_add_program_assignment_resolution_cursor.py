"""add program assignment resolution cursor

Revision ID: 84b668dd4276
Revises: a2567ea29561
Create Date: 2026-07-12 18:56:56.746888

Sprint 4.1 — Workout Resolution Engine (closes out Phase 3 Sprint 3.3's
"rule-based Workout Engine (pre-AI, template-driven)" deliverable).

Adds the Workout Resolution Engine's progress cursor to
``program_assignments``: ``current_week_number``/``current_day_number``
identify the ``ProgramDay`` slot to resolve as "next up" for a user;
``current_program_day_id`` is a best-effort, nullable convenience FK to
the same slot (``SET NULL`` if that ``ProgramDay`` is later hard-deleted —
see ``WorkoutService.remove_program_day``); ``cursor_exhausted`` marks
"nothing left to resolve" once the program's last scheduled day has been
passed.

Autogenerate only detected the new columns/index/FK — it never detects
``CheckConstraint``s, so the two positivity checks below (mirroring
``ProgramDay.week_number``/``day_number``'s own constraints) were added by
hand. ``server_default`` values are set explicitly (not implied by the
model, which uses a Python-side ``default=`` for new ORM inserts only) so
this migration is safe to run against a table that already has rows.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '84b668dd4276'
down_revision: Union[str, Sequence[str], None] = 'a2567ea29561'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'program_assignments',
        sa.Column('current_week_number', sa.Integer(), server_default='1', nullable=False),
    )
    op.add_column(
        'program_assignments',
        sa.Column('current_day_number', sa.Integer(), server_default='1', nullable=False),
    )
    op.add_column(
        'program_assignments', sa.Column('current_program_day_id', sa.Uuid(), nullable=True)
    )
    op.add_column(
        'program_assignments',
        sa.Column(
            'cursor_exhausted', sa.Boolean(), server_default=sa.text('false'), nullable=False
        ),
    )
    op.create_check_constraint(
        'ck_program_assignments_current_week_number_positive',
        'program_assignments',
        'current_week_number > 0',
    )
    op.create_check_constraint(
        'ck_program_assignments_current_day_number_positive',
        'program_assignments',
        'current_day_number > 0',
    )
    op.create_index(
        'ix_program_assignments_current_program_day_id',
        'program_assignments',
        ['current_program_day_id'],
        unique=False,
    )
    op.create_foreign_key(
        'fk_program_assignments_current_program_day_id',
        'program_assignments',
        'program_days',
        ['current_program_day_id'],
        ['id'],
        ondelete='SET NULL',
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        'fk_program_assignments_current_program_day_id',
        'program_assignments',
        type_='foreignkey',
    )
    op.drop_index('ix_program_assignments_current_program_day_id', table_name='program_assignments')
    op.drop_constraint(
        'ck_program_assignments_current_day_number_positive',
        'program_assignments',
        type_='check',
    )
    op.drop_constraint(
        'ck_program_assignments_current_week_number_positive',
        'program_assignments',
        type_='check',
    )
    op.drop_column('program_assignments', 'cursor_exhausted')
    op.drop_column('program_assignments', 'current_program_day_id')
    op.drop_column('program_assignments', 'current_day_number')
    op.drop_column('program_assignments', 'current_week_number')
