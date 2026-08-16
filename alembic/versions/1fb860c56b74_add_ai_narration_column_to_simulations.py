"""add ai_narration column to simulations

Revision ID: 1fb860c56b74
Revises: cdcc0a19b932
Create Date: 2026-08-10 14:44:18.438065

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '1fb860c56b74'
down_revision: str | Sequence[str] | None = 'cdcc0a19b932'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade():
    op.add_column('simulations', sa.Column('ai_narration', sa.Text, nullable=True))
    op.add_column('simulations', sa.Column('ai_narration_status', sa.String, nullable=True))

def downgrade():
    op.drop_column('simulations', 'ai_narration')
    op.drop_column('simulations', 'ai_narration_status')
