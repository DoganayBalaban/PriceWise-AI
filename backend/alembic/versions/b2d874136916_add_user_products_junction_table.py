"""add_user_products_junction_table

Revision ID: b2d874136916
Revises: a1b2c3d4e5f6
Create Date: 2026-05-03 12:59:26.479750

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'b2d874136916'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'user_products',
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('product_id', sa.Uuid(), nullable=False),
        sa.Column('added_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id', 'product_id'),
        sa.UniqueConstraint('user_id', 'product_id', name='uq_user_product'),
    )


def downgrade() -> None:
    op.drop_table('user_products')
