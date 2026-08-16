"""add initial_config column to simulations

Revision ID: f180c8af50fb
Revises: 1fb860c56b74
Create Date: 2026-08-16 08:15:34.257636

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f180c8af50fb'
down_revision: Union[str, Sequence[str], None] = '1fb860c56b74'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('simulations', sa.Column('initial_config', sa.JSON, nullable = True))
    


def downgrade():
    op.drop_column('simulations', 'initial_config')
