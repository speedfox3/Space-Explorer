"""add minigame_sessions and trades

Revision ID: 0002_add_minigame_and_trades
Revises: 0001_initial
Create Date: 2026-01-13 00:00:01.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0002_add_minigame_and_trades'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'minigame_sessions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('player_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('game_type', sa.String(), nullable=False),
        sa.Column('state', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('result', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
    )

    op.create_table(
        'trades',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('buyer_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('seller_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('item_type', sa.String(), nullable=False),
        sa.Column('price', sa.Numeric(18, 2), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )


def downgrade():
    op.drop_table('trades')
    op.drop_table('minigame_sessions')
