"""add ai_narration column to simulations

Revision ID: 1fb860c56b74
Revises: cdcc0a19b932
Create Date: 2026-08-10 14:44:18.438065

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa



# revision identifiers, used by Alembic.
revision: str = '1fb860c56b74'
down_revision: Union[str, Sequence[str], None] = 'cdcc0a19b932'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('simulations', sa.Column('ai_narration', sa.Text, nullable=True))
    op.add_column('simulations', sa.Column('ai_narration_status', sa.String, nullable=True))

def downgrade():
    op.drop_column('simulations', 'ai_narration')
    op.drop_column('simulations', 'ai_narration_status')
