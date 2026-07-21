"""Recommendation rule table plus the credit-tier lookup.

The engine's scoring is *entirely* data-driven. Each `RecommendationRule` row
declares an operator (an evaluation primitive), the fields it reads, any
thresholds, its base points, the named weight multiplier to apply, and the
explanation to surface. Effective contribution = ``points × weight.value``.
Adding, tuning, disabling, or reweighting a rule is a database change only.
"""

from __future__ import annotations

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin


class RecommendationRule(Base, TimestampMixin):
    __tablename__ = "recommendation_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)

    # The evaluation primitive to apply (see recommendation_engine/operators.py).
    operator: Mapped[str] = mapped_column(String(48), nullable=False)

    # The questionnaire answer field this rule reads (e.g. "primaryGoal").
    answer_field: Mapped[str | None] = mapped_column(String(48), nullable=True)
    # The card attribute this rule compares against (e.g. "annualFee").
    card_field: Mapped[str | None] = mapped_column(String(48), nullable=True)

    # Optional thresholds/targets consumed by the operator.
    target_number: Mapped[float | None] = mapped_column(Float, nullable=True)
    target_value: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # Base points awarded when the rule matches (may be negative for penalties).
    points: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    # Named weight multiplier (FK to scoring_weights.key); null => multiplier 1.0.
    weight_key: Mapped[str | None] = mapped_column(
        ForeignKey("scoring_weights.key", ondelete="SET NULL"), nullable=True
    )

    # Optional benefit surfaced as a "matched benefit" when this rule matches.
    benefit_code: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # Human-readable explanation shown to the user when this rule matches.
    reason_label: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    reason_detail: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    # "pro" | "con" | "neutral" — classifies the reason for the pros/cons lists.
    outcome: Mapped[str] = mapped_column(String(12), default="pro", nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=100, nullable=False)


class CreditScoreTier(Base):
    """Ordinal ranking of credit-score tiers, used by eligibility and rules."""

    __tablename__ = "credit_score_tiers"

    slug: Mapped[str] = mapped_column(String(24), primary_key=True)
    label: Mapped[str] = mapped_column(String(64), nullable=False)
    # Higher rank == stronger credit.
    rank: Mapped[int] = mapped_column(Integer, nullable=False)
