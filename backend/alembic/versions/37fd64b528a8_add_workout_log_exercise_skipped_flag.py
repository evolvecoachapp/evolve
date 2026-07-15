"""add workout log exercise skipped flag

Revision ID: 37fd64b528a8
Revises: a4facc05013e
Create Date: 2026-07-15 00:00:00.000000

Sprint 6.3 — Workout Engine v1.

Adds ``skipped`` to ``workout_log_exercises`` so a single exercise
instance within an in-progress or completed session can be marked as
explicitly not performed, independent of ``WorkoutLog.status`` (which
tracks the whole session). Backs
:meth:`~app.services.workout_log_service.WorkoutLogService.skip_exercise`.
``server_default`` is set explicitly so this migration is safe to run
against a table that already has rows.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '37fd64b528a8'
down_revision: Union[str, Sequence[str], None] = 'a4facc05013e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'workout_log_exercises',
        sa.Column('skipped', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('workout_log_exercises', 'skipped')
