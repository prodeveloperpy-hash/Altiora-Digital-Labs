"""Initial schema.

Revision ID: 0001_initial
Revises:
Create Date: 2026-01-01 00:00:00.000000
"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "categories",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("slug", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_categories_slug", "categories", ["slug"], unique=True)

    op.create_table(
        "credit_cards",
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("issuer", sa.String(length=120), nullable=False),
        sa.Column("network", sa.String(length=24), nullable=False),
        sa.Column("image_url", sa.String(length=512), nullable=False),
        sa.Column("summary", sa.String(length=400), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("annual_fee", sa.Float(), nullable=False),
        sa.Column("apr_min", sa.Float(), nullable=False),
        sa.Column("apr_max", sa.Float(), nullable=False),
        sa.Column("intro_apr", sa.String(length=200), nullable=True),
        sa.Column("intro_apr_months", sa.Integer(), nullable=True),
        sa.Column("foreign_transaction_fee", sa.Float(), nullable=False),
        sa.Column("recommended_credit_score", sa.String(length=24), nullable=False),
        sa.Column("rewards_summary", sa.String(length=200), nullable=False),
        sa.Column("rewards_currency", sa.String(length=64), nullable=True),
        sa.Column("signup_bonus", sa.String(length=300), nullable=True),
        sa.Column("signup_bonus_value", sa.Float(), nullable=True),
        sa.Column("benefits", sa.JSON(), nullable=False),
        sa.Column("pros", sa.JSON(), nullable=False),
        sa.Column("cons", sa.JSON(), nullable=False),
        sa.Column("rating", sa.Float(), nullable=False),
        sa.Column("review_count", sa.Integer(), nullable=False),
        sa.Column("apply_url", sa.String(length=512), nullable=False),
        sa.Column("is_featured", sa.Boolean(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_credit_cards_slug", "credit_cards", ["slug"], unique=True)
    op.create_index("ix_credit_cards_name", "credit_cards", ["name"], unique=False)
    op.create_index("ix_credit_cards_issuer", "credit_cards", ["issuer"], unique=False)
    op.create_index("ix_credit_cards_network", "credit_cards", ["network"], unique=False)
    op.create_index(
        "ix_credit_cards_recommended_credit_score",
        "credit_cards",
        ["recommended_credit_score"],
        unique=False,
    )
    op.create_index("ix_credit_cards_is_featured", "credit_cards", ["is_featured"], unique=False)
    op.create_index("ix_credit_cards_is_active", "credit_cards", ["is_active"], unique=False)

    op.create_table(
        "card_category",
        sa.Column("card_id", sa.String(length=32), nullable=False),
        sa.Column("category_id", sa.String(length=64), nullable=False),
        sa.ForeignKeyConstraint(["card_id"], ["credit_cards.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("card_id", "category_id"),
    )

    op.create_table(
        "reward_rates",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("card_id", sa.String(length=32), nullable=False),
        sa.Column("category", sa.String(length=64), nullable=False),
        sa.Column("rate", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(length=16), nullable=False),
        sa.Column("cap", sa.String(length=128), nullable=True),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["card_id"], ["credit_cards.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_reward_rates_card_id", "reward_rates", ["card_id"], unique=False)

    op.create_table(
        "faqs",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("question", sa.String(length=300), nullable=False),
        sa.Column("answer", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=64), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_faqs_category", "faqs", ["category"], unique=False)

    op.create_table(
        "recommendation_rules",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("operator", sa.String(length=48), nullable=False),
        sa.Column("answer_field", sa.String(length=48), nullable=True),
        sa.Column("card_field", sa.String(length=48), nullable=True),
        sa.Column("target_number", sa.Float(), nullable=True),
        sa.Column("target_value", sa.String(length=64), nullable=True),
        sa.Column("weight", sa.Float(), nullable=False),
        sa.Column("reason_label", sa.String(length=120), nullable=False),
        sa.Column("reason_detail", sa.String(length=300), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_recommendation_rules_code", "recommendation_rules", ["code"], unique=True)
    op.create_index(
        "ix_recommendation_rules_is_active", "recommendation_rules", ["is_active"], unique=False
    )

    op.create_table(
        "credit_score_tiers",
        sa.Column("slug", sa.String(length=24), nullable=False),
        sa.Column("label", sa.String(length=64), nullable=False),
        sa.Column("rank", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("slug"),
    )

    op.create_table(
        "reward_preference_units",
        sa.Column("preference", sa.String(length=24), nullable=False),
        sa.Column("unit", sa.String(length=16), nullable=False),
        sa.PrimaryKeyConstraint("preference"),
    )


def downgrade() -> None:
    op.drop_table("reward_preference_units")
    op.drop_table("credit_score_tiers")
    op.drop_index("ix_recommendation_rules_is_active", table_name="recommendation_rules")
    op.drop_index("ix_recommendation_rules_code", table_name="recommendation_rules")
    op.drop_table("recommendation_rules")
    op.drop_index("ix_faqs_category", table_name="faqs")
    op.drop_table("faqs")
    op.drop_index("ix_reward_rates_card_id", table_name="reward_rates")
    op.drop_table("reward_rates")
    op.drop_table("card_category")
    op.drop_index("ix_credit_cards_is_active", table_name="credit_cards")
    op.drop_index("ix_credit_cards_is_featured", table_name="credit_cards")
    op.drop_index("ix_credit_cards_recommended_credit_score", table_name="credit_cards")
    op.drop_index("ix_credit_cards_network", table_name="credit_cards")
    op.drop_index("ix_credit_cards_issuer", table_name="credit_cards")
    op.drop_index("ix_credit_cards_name", table_name="credit_cards")
    op.drop_index("ix_credit_cards_slug", table_name="credit_cards")
    op.drop_table("credit_cards")
    op.drop_index("ix_categories_slug", table_name="categories")
    op.drop_table("categories")
