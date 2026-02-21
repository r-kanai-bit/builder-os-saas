"""Initial schema creation for Excel Template Engine

Revision ID: 001_initial
Revises:
Create Date: 2024-01-15 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ExcelTemplate テーブル
    op.create_table(
        'excel_templates',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('tenant_id', sa.BigInteger(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), nullable=False),
        sa.Column('file_path', sa.String(512), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tenant_id', 'slug', name='uk_tenant_slug'),
    )
    op.create_index('idx_tenant_active', 'excel_templates', ['tenant_id', 'is_active'])
    op.create_index('ix_excel_templates_id', 'excel_templates', ['id'])
    op.create_index('ix_excel_templates_tenant_id', 'excel_templates', ['tenant_id'])

    # CellMapping テーブル
    op.create_table(
        'cell_mappings',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('template_id', sa.BigInteger(), nullable=False),
        sa.Column('cell_ref', sa.String(20), nullable=False),
        sa.Column('field_name', sa.String(255), nullable=False),
        sa.Column('data_type', sa.String(50), nullable=False, server_default='string'),
        sa.Column('format_pattern', sa.String(255), nullable=True),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['template_id'], ['excel_templates.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('template_id', 'cell_ref', name='uk_template_cellref'),
    )
    op.create_index('idx_template_field', 'cell_mappings', ['template_id', 'field_name'])
    op.create_index('ix_cell_mappings_id', 'cell_mappings', ['id'])
    op.create_index('ix_cell_mappings_template_id', 'cell_mappings', ['template_id'])

    # GenerationHistory テーブル
    op.create_table(
        'generation_histories',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('template_id', sa.BigInteger(), nullable=False),
        sa.Column('tenant_id', sa.BigInteger(), nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('input_data', postgresql.JSON(), nullable=True),
        sa.Column('output_path', sa.String(512), nullable=True),
        sa.Column('file_size', sa.BigInteger(), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='pending'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['template_id'], ['excel_templates.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_tenant_created', 'generation_histories', ['tenant_id', 'created_at'])
    op.create_index('idx_template_status', 'generation_histories', ['template_id', 'status'])
    op.create_index('idx_user_created', 'generation_histories', ['user_id', 'created_at'])
    op.create_index('ix_generation_histories_id', 'generation_histories', ['id'])


def downgrade() -> None:
    # テーブルを削除（逆順）
    op.drop_table('generation_histories')
    op.drop_table('cell_mappings')
    op.drop_table('excel_templates')
