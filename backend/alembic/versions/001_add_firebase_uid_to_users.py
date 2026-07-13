"""add firebase_uid and auth_provider to users

Revision ID: 001_add_firebase_uid
Revises: 
Create Date: 2026-07-13 17:10:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_add_firebase_uid'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add firebase_uid column
    op.add_column('users', sa.Column('firebase_uid', sa.String(length=128), nullable=True))
    op.create_index(op.f('ix_users_firebase_uid'), 'users', ['firebase_uid'], unique=True)
    
    # Add auth_provider column
    op.add_column('users', sa.Column('auth_provider', sa.String(length=50), server_default='firebase', nullable=False))
    
    # Alter hashed_password to be nullable
    op.alter_column('users', 'hashed_password',
               existing_type=sa.String(length=256),
               nullable=True)


def downgrade() -> None:
    op.alter_column('users', 'hashed_password',
               existing_type=sa.String(length=256),
               nullable=False)
    op.drop_column('users', 'auth_provider')
    op.drop_index(op.f('ix_users_firebase_uid'), table_name='users')
    op.drop_column('users', 'firebase_uid')
