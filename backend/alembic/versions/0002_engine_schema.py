"""Recommendation engine schema: banks, benefits, reward categories,
eligibility rules, weights, question mappings, scoring matrix, user answers;
plus card.bank_id and richer recommendation_rules columns.

Revision ID: 0002_engine
Revises: 0001_initial
Create Date: 2026-01-02 00:00:00.000000
"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002_engine"
down_revision: str | None = "0001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # --- Banks -----------------------------------------------------------
    op.create_table(
        "banks",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("slug", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("country", sa.String(length=64), nullable=False),
        sa.Column("website", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_banks_slug", "banks", ["slug"], unique=True)

    # --- Benefits --------------------------------------------------------
    op.create_table(
        "benefits",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_benefits_code", "benefits", ["code"], unique=True)

    op.create_table(
        "card_benefit",
        sa.Column("card_id", sa.String(length=32), nullable=False),
        sa.Column("benefit_id", sa.String(length=64), nullable=False),
        sa.ForeignKeyConstraint(["card_id"], ["credit_cards.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["benefit_id"], ["benefits.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("card_id", "benefit_id"),
    )

    # --- Reward categories ----------------------------------------------
    op.create_table(
        "reward_categories",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_reward_categories_code", "reward_categories", ["code"], unique=True)

    # --- Scoring weights -------------------------------------------------
    op.create_table(
        "scoring_weights",
        sa.Column("key", sa.String(length=48), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("key"),
    )

    # --- Question mappings ----------------------------------------------
    op.create_table(
        "question_mappings",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("question_key", sa.String(length=48), nullable=False),
        sa.Column("answer_value", sa.String(length=64), nullable=True),
        sa.Column("target_type", sa.String(length=32), nullable=False),
        sa.Column("target_code", sa.String(length=64), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_question_mappings_question_key", "question_mappings", ["question_key"])

    # --- Scoring matrix --------------------------------------------------
    op.create_table(
        "scoring_matrix",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("operator", sa.String(length=48), nullable=False),
        sa.Column("answer_field", sa.String(length=48), nullable=True),
        sa.Column("card_field", sa.String(length=48), nullable=True),
        sa.Column("target_number", sa.Float(), nullable=True),
        sa.Column("target_value", sa.String(length=64), nullable=True),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("weight_key", sa.String(length=48), nullable=True),
        sa.Column("reason_label", sa.String(length=120), nullable=False),
        sa.Column("reason_detail", sa.String(length=300), nullable=False),
        sa.Column("outcome", sa.String(length=12), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_scoring_matrix_code", "scoring_matrix", ["code"], unique=True)
    op.create_index("ix_scoring_matrix_is_active", "scoring_matrix", ["is_active"])

    # --- Eligibility rules ----------------------------------------------
    op.create_table(
        "eligibility_rules",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("card_id", sa.String(length=32), nullable=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("operator", sa.String(length=48), nullable=False),
        sa.Column("answer_field", sa.String(length=48), nullable=True),
        sa.Column("card_field", sa.String(length=48), nullable=True),
        sa.Column("threshold_number", sa.Float(), nullable=True),
        sa.Column("threshold_value", sa.String(length=120), nullable=True),
        sa.Column("fail_message", sa.String(length=300), nullable=False),
        sa.Column("pass_message", sa.String(length=300), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["card_id"], ["credit_cards.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_eligibility_rules_code", "eligibility_rules", ["code"], unique=True)
    op.create_index("ix_eligibility_rules_card_id", "eligibility_rules", ["card_id"])
    op.create_index("ix_eligibility_rules_is_active", "eligibility_rules", ["is_active"])

    # --- User answers ----------------------------------------------------
    op.create_table(
        "user_answers",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("session_id", sa.String(length=48), nullable=False),
        sa.Column("question_key", sa.String(length=48), nullable=False),
        sa.Column("answer_value", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_answers_session_id", "user_answers", ["session_id"])

    # --- credit_cards.bank_id -------------------------------------------
    with op.batch_alter_table("credit_cards") as batch:
        batch.add_column(sa.Column("bank_id", sa.String(length=64), nullable=True))
    op.create_index("ix_credit_cards_bank_id", "credit_cards", ["bank_id"])

    # --- recommendation_rules: add new columns, drop the legacy `weight` ----
    with op.batch_alter_table("recommendation_rules") as batch:
        batch.add_column(sa.Column("points", sa.Float(), server_default="0", nullable=False))
        batch.add_column(sa.Column("weight_key", sa.String(length=48), nullable=True))
        batch.add_column(sa.Column("benefit_code", sa.String(length=64), nullable=True))
        batch.add_column(sa.Column("outcome", sa.String(length=12), server_default="pro", nullable=False))
        batch.drop_column("weight")

    # --- Drop the legacy reward_preference_units table -------------------
    op.drop_table("reward_preference_units")


def downgrade() -> None:
    op.create_table(
        "reward_preference_units",
        sa.Column("preference", sa.String(length=24), nullable=False),
        sa.Column("unit", sa.String(length=16), nullable=False),
        sa.PrimaryKeyConstraint("preference"),
    )

    with op.batch_alter_table("recommendation_rules") as batch:
        batch.add_column(sa.Column("weight", sa.Float(), server_default="0", nullable=False))
        batch.drop_column("outcome")
        batch.drop_column("benefit_code")
        batch.drop_column("weight_key")
        batch.drop_column("points")

    op.drop_index("ix_credit_cards_bank_id", table_name="credit_cards")
    with op.batch_alter_table("credit_cards") as batch:
        batch.drop_column("bank_id")

    op.drop_index("ix_user_answers_session_id", table_name="user_answers")
    op.drop_table("user_answers")
    op.drop_index("ix_eligibility_rules_is_active", table_name="eligibility_rules")
    op.drop_index("ix_eligibility_rules_card_id", table_name="eligibility_rules")
    op.drop_index("ix_eligibility_rules_code", table_name="eligibility_rules")
    op.drop_table("eligibility_rules")
    op.drop_index("ix_scoring_matrix_is_active", table_name="scoring_matrix")
    op.drop_index("ix_scoring_matrix_code", table_name="scoring_matrix")
    op.drop_table("scoring_matrix")
    op.drop_index("ix_question_mappings_question_key", table_name="question_mappings")
    op.drop_table("question_mappings")
    op.drop_table("scoring_weights")
    op.drop_index("ix_reward_categories_code", table_name="reward_categories")
    op.drop_table("reward_categories")
    op.drop_table("card_benefit")
    op.drop_index("ix_benefits_code", table_name="benefits")
    op.drop_table("benefits")
    op.drop_index("ix_banks_slug", table_name="banks")
    op.drop_table("banks")
