"""add team member qr code path

Revision ID: 0002_add_team_member_qr_code_path
Revises: 0001_initial
Create Date: 2026-06-15 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "0002_add_team_member_qr_code_path"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "team_members",
        sa.Column("qr_code_path", sa.String(length=500), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("team_members", "qr_code_path")
