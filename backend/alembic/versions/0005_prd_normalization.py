"""PRD database indexes and bank logo.

Revision ID: 0005_prd
Revises: 0004_india_prd
"""

from alembic import op
import sqlalchemy as sa

revision = "0005_prd"
down_revision = "0004_india_prd"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("banks") as batch:
        batch.add_column(sa.Column("logo_url", sa.String(512), nullable=False, server_default=""))
    op.create_index("ix_benefits_category", "benefits", ["category"])
    op.create_index("ix_benefits_name", "benefits", ["name"])


def downgrade() -> None:
    op.drop_index("ix_benefits_name", table_name="benefits")
    op.drop_index("ix_benefits_category", table_name="benefits")
    with op.batch_alter_table("banks") as batch:
        batch.drop_column("logo_url")
