"""add alerts table

Revision ID: 6973b5e2f7a3
Revises: 550530b8091a
Create Date: 2026-05-02 17:03:05.711070

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '6973b5e2f7a3'
down_revision: Union[str, None] = '550530b8091a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'alerts',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=True),
        sa.Column('product_id', sa.Uuid(), nullable=False),
        sa.Column('email', sa.Text(), nullable=False),
        sa.Column('target_price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('product_id', 'email', name='uq_alert_product_email'),
    )
    op.create_index('idx_alerts_active', 'alerts', ['active'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_alerts_active', table_name='alerts')
    op.drop_table('alerts')
