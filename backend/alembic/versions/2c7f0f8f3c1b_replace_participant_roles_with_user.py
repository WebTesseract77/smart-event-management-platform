"""replace legacy participant roles with user

Revision ID: 2c7f0f8f3c1b
Revises: b7a3d5c2f901
Create Date: 2026-06-30 00:00:00.000000
"""

from alembic import op


revision = "2c7f0f8f3c1b"
down_revision = "b7a3d5c2f901"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "UPDATE users SET role = 'user' WHERE role = 'participant'"
    )


def downgrade() -> None:
    op.execute(
        "UPDATE users SET role = 'participant' WHERE role = 'user'"
    )
