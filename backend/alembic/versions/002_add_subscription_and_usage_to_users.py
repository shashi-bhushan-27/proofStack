"""Add subscription and usage fields to users table

Revision ID: 002_add_subscription_and_usage
Revises: 001_add_firebase_uid_to_users
Create Date: 2026-07-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002_add_subscription_and_usage'
down_revision: Union[str, None] = '001_add_firebase_uid'

branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if columns already exist before adding
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_columns = [col['name'] for col in inspector.get_columns('users')]

    if 'subscription_tier' not in existing_columns:
        op.add_column('users', sa.Column('subscription_tier', sa.String(length=50), server_default='free', nullable=False))
    if 'subscription_status' not in existing_columns:
        op.add_column('users', sa.Column('subscription_status', sa.String(length=50), server_default='active', nullable=False))
    if 'cashfree_subscription_id' not in existing_columns:
        op.add_column('users', sa.Column('cashfree_subscription_id', sa.String(length=128), nullable=True))
    if 'cashfree_customer_id' not in existing_columns:
        op.add_column('users', sa.Column('cashfree_customer_id', sa.String(length=128), nullable=True))
    if 'daily_analyses_count' not in existing_columns:
        op.add_column('users', sa.Column('daily_analyses_count', sa.Integer(), server_default='0', nullable=False))
    if 'last_analysis_date' not in existing_columns:
        op.add_column('users', sa.Column('last_analysis_date', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'last_analysis_date')
    op.drop_column('users', 'daily_analyses_count')
    op.drop_column('users', 'cashfree_customer_id')
    op.drop_column('users', 'cashfree_subscription_id')
    op.drop_column('users', 'subscription_status')
    op.drop_column('users', 'subscription_tier')
