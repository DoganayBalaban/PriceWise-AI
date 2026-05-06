"""add lemon_subscription_id to users

Revision ID: c3f1a2b4d5e6
Revises: b2d874136916
Create Date: 2026-05-06 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "c3f1a2b4d5e6"
down_revision = "b2d874136916"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("lemon_subscription_id", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "lemon_subscription_id")
