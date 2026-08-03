"""create simulations table

Revision ID: cdcc0a19b932
Revises: 
Create Date: 2026-08-03 15:45:27.661600

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cdcc0a19b932'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'simulations',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String, nullable=False),
        sa.Column('config', sa.JSON, nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('forked_from_id', sa.Integer, sa.ForeignKey('simulations.id'), nullable=True),
    )

def downgrade():
    op.drop_table('simulations')
