"""Eligibility rules.

Each row declares a data-driven eligibility check. A rule with a null card_id
applies to every card (a global rule evaluated against each card's own
attributes); a rule with a card_id applies only to that card. Like scoring
rules, eligibility rules carry no logic in code beyond a generic operator
vocabulary — thresholds and messages live in the database.
"""

from __future__ import annotations

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin


class EligibilityRule(Base, TimestampMixin):
    __tablename__ = "eligibility_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    # Null => applies to all cards.
    card_id: Mapped[str | None] = mapped_column(
        ForeignKey("credit_cards.id", ondelete="CASCADE"), nullable=True, index=True
    )
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)

    # Generic operator (see recommendation_engine/operators.py::ELIGIBILITY_OPERATORS).
    operator: Mapped[str] = mapped_column(String(48), nullable=False)
    # The questionnaire answer field the check reads (e.g. "creditScore").
    answer_field: Mapped[str | None] = mapped_column(String(48), nullable=True)
    # The card attribute the check compares against (e.g. "recommendedCreditScore").
    card_field: Mapped[str | None] = mapped_column(String(48), nullable=True)

    threshold_number: Mapped[float | None] = mapped_column(Float, nullable=True)
    threshold_value: Mapped[str | None] = mapped_column(String(120), nullable=True)

    # Message shown when the rule FAILS (i.e. the user is not eligible).
    fail_message: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    # Message shown when the rule PASSES (optional, for positive eligibility notes).
    pass_message: Mapped[str] = mapped_column(String(300), default="", nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
