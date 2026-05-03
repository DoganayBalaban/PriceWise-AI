"""add user name and email_verified, make hashed_password nullable

Revision ID: a1b2c3d4e5f6
Revises: 6973b5e2f7a3
Create Date: 2026-05-02 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '6973b5e2f7a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('name', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), nullable=False, server_default='false'))
    op.alter_column('users', 'hashed_password', existing_type=sa.Text(), nullable=True)


def downgrade() -> None:
    op.alter_column('users', 'hashed_password', existing_type=sa.Text(), nullable=False)
    op.drop_column('users', 'email_verified')
    op.drop_column('users', 'name')
