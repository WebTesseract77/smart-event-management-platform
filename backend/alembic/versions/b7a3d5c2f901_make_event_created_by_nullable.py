"""make event created_by nullable

Revision ID: b7a3d5c2f901
Revises: 8b880ad087ac
Create Date: 2026-06-30 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "b7a3d5c2f901"
down_revision = "8b880ad087ac"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("events") as batch_op:
        batch_op.alter_column(
            "created_by",
            existing_type=sa.Integer(),
            nullable=True,
        )


def downgrade() -> None:
    with op.batch_alter_table("events") as batch_op:
        batch_op.alter_column(
            "created_by",
            existing_type=sa.Integer(),
            nullable=False,
        )
