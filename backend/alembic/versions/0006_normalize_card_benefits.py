"""Remove redundant JSON benefit names.

Revision ID: 0006_normalize_benefits
Revises: 0005_prd
"""

from alembic import op
import sqlalchemy as sa

revision = "0006_normalize_benefits"
down_revision = "0005_prd"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("credit_cards") as batch:
        batch.drop_column("benefits")


def downgrade() -> None:
    with op.batch_alter_table("credit_cards") as batch:
        batch.add_column(sa.Column("benefits", sa.JSON(), nullable=False, server_default="[]"))
