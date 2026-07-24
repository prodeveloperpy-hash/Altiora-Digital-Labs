"""Indian card catalog and PRD fields.

Revision ID: 0004_india_prd
Revises: 0003_admin
"""

from alembic import op
import sqlalchemy as sa

revision = "0004_india_prd"
down_revision = "0003_admin"
branch_labels = None
depends_on = None

CARD_TEXT_COLUMNS = [
    "card_type", "fee_waiver", "eligibility", "income_requirement",
    "reward_rate", "reward_points", "cashback_categories", "lounge_domestic",
    "lounge_international", "insurance", "fuel", "dining", "shopping",
    "travel", "forex", "upi", "concierge", "golf", "welcome_bonus",
    "renewal_benefits", "add_on_cards", "emi_conversion", "balance_transfer",
    "merchant_offers",
]


def upgrade() -> None:
    with op.batch_alter_table("benefits") as batch:
        batch.add_column(sa.Column("weight", sa.Float(), nullable=False, server_default="1"))
    with op.batch_alter_table("credit_cards") as batch:
        batch.add_column(sa.Column("joining_fee", sa.Float(), nullable=False, server_default="0"))
        for name in CARD_TEXT_COLUMNS:
            batch.add_column(sa.Column(name, sa.Text(), nullable=False, server_default=""))


def downgrade() -> None:
    with op.batch_alter_table("credit_cards") as batch:
        for name in reversed(CARD_TEXT_COLUMNS):
            batch.drop_column(name)
        batch.drop_column("joining_fee")
    with op.batch_alter_table("benefits") as batch:
        batch.drop_column("weight")
