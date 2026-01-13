"""initial

Revision ID: 0001_initial
Revises: 
Create Date: 2026-01-13 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('username', sa.String(), nullable=False, unique=True),
        sa.Column('email', sa.String(), nullable=True, unique=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('currency', sa.Numeric(18, 2), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('last_active', sa.DateTime(), nullable=True),
    )

    op.create_table(
        'galaxies',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('seed', sa.String(), nullable=False, unique=True),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    op.create_table(
        'ships',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('owner_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('level', sa.Integer(), nullable=True),
        sa.Column('hp_current', sa.Integer(), nullable=True),
        sa.Column('hp_max', sa.Integer(), nullable=True),
        sa.Column('modules', sa.JSON(), nullable=True),
        sa.Column('cargo_capacity', sa.Integer(), nullable=True),
        sa.Column('sensors', sa.Integer(), nullable=True),
        sa.Column('inventory', sa.JSON(), nullable=True),
        sa.Column('position', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
    )

    op.create_table(
        'market_orders',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('player_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('item_type', sa.String(), nullable=False),
        sa.Column('order_type', sa.String(), nullable=False),
        sa.Column('price', sa.Numeric(18, 2), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('filled', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )


def downgrade():
    op.drop_table('market_orders')
    op.drop_table('ships')
    op.drop_table('galaxies')
    op.drop_table('users')
