"""add user token version

Revision ID: c4b1a2d3e4f5
Revises: 1712ddbf6048
Create Date: 2026-07-16
"""

from alembic import op
import sqlalchemy as sa


revision = "c4b1a2d3e4f5"
down_revision = "1712ddbf6048"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("token_version", sa.Integer(), nullable=False, server_default="0"),
    )
    op.alter_column("users", "token_version", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "token_version")
