"""Add llm_traces table

Revision ID: 003_add_llm_traces
Revises: 002_add_subscription_and_usage
Create Date: 2026-07-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '003_add_llm_traces'
down_revision: Union[str, None] = '002_add_subscription_and_usage'

branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if table already exists
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'llm_traces' not in inspector.get_table_names():
        op.create_table('llm_traces',
            sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('trace_id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column('analysis_id', postgresql.UUID(as_uuid=True), nullable=True),
            
            sa.Column('operation', sa.String(length=100), nullable=False),
            sa.Column('provider', sa.String(length=50), nullable=False),
            sa.Column('model', sa.String(length=100), nullable=False),
            sa.Column('prompt_version', sa.String(length=50), nullable=False),
            
            sa.Column('input_tokens', sa.Integer(), nullable=True),
            sa.Column('output_tokens', sa.Integer(), nullable=True),
            sa.Column('total_tokens', sa.Integer(), nullable=True),
            
            sa.Column('latency_ms', sa.Integer(), nullable=False),
            sa.Column('estimated_cost_usd', sa.Numeric(precision=12, scale=8), nullable=True),
            
            sa.Column('status', sa.String(length=20), nullable=False),
            sa.Column('retry_count', sa.Integer(), server_default='0', nullable=False),
            
            sa.Column('error_type', sa.String(length=50), nullable=True),
            sa.Column('error_message', sa.Text(), nullable=True),
            
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
            
            sa.ForeignKeyConstraint(['analysis_id'], ['analyses.id'], ondelete='SET NULL'),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id')
        )
        
        op.create_index(op.f('ix_llm_traces_analysis_id'), 'llm_traces', ['analysis_id'], unique=False)
        op.create_index(op.f('ix_llm_traces_created_at_desc'), 'llm_traces', ['created_at'], unique=False, postgresql_using='btree')
        op.create_index(op.f('ix_llm_traces_error_type'), 'llm_traces', ['error_type'], unique=False)
        op.create_index(op.f('ix_llm_traces_model'), 'llm_traces', ['model'], unique=False)
        op.create_index(op.f('ix_llm_traces_operation'), 'llm_traces', ['operation'], unique=False)
        op.create_index(op.f('ix_llm_traces_prompt_version'), 'llm_traces', ['prompt_version'], unique=False)
        op.create_index(op.f('ix_llm_traces_status'), 'llm_traces', ['status'], unique=False)
        op.create_index(op.f('ix_llm_traces_trace_id'), 'llm_traces', ['trace_id'], unique=True)
        op.create_index(op.f('ix_llm_traces_user_id'), 'llm_traces', ['user_id'], unique=False)


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'llm_traces' in inspector.get_table_names():
        op.drop_table('llm_traces')
