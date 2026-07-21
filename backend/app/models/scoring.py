"""Scoring-related tables: weights, question mappings, scoring matrix, user answers.

Together with recommendation_rules and eligibility_rules these fully describe the
engine's behavior in data. Changing any of them is a database-only operation.
"""

from __future__ import annotations

from sqlalchemy import Boolean, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin


class ScoringWeight(Base, TimestampMixin):
    """A named, reusable weight multiplier referenced by rules and matrix rows."""

    __tablename__ = "scoring_weights"

    key: Mapped[str] = mapped_column(String(48), primary_key=True)
    value: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)


class QuestionMapping(Base, TimestampMixin):
    """Maps a questionnaire answer to an internal token the engine understands.

    Example: (question_key="primaryGoal", answer_value="travel") maps to
    target_type="reward_category", target_code="travel". This indirection lets the
    questionnaire evolve without touching rule logic — only mappings change.
    """

    __tablename__ = "question_mappings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    question_key: Mapped[str] = mapped_column(String(48), index=True, nullable=False)
    # Null / "*" matches any answer for the question.
    answer_value: Mapped[str | None] = mapped_column(String(64), nullable=True)
    # One of: "reward_category", "benefit", "reward_unit", "attribute".
    target_type: Mapped[str] = mapped_column(String(32), nullable=False)
    target_code: Mapped[str] = mapped_column(String(64), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class ScoringMatrixEntry(Base, TimestampMixin):
    """A quantitative scoring contribution keyed by an answer condition and a card
    condition. Complements recommendation_rules with graded/numeric scoring."""

    __tablename__ = "scoring_matrix"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)

    operator: Mapped[str] = mapped_column(String(48), nullable=False)
    answer_field: Mapped[str | None] = mapped_column(String(48), nullable=True)
    card_field: Mapped[str | None] = mapped_column(String(48), nullable=True)
    target_number: Mapped[float | None] = mapped_column(Float, nullable=True)
    target_value: Mapped[str | None] = mapped_column(String(64), nullable=True)

    score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    weight_key: Mapped[str | None] = mapped_column(String(48), nullable=True)

    reason_label: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    reason_detail: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    # "pro" | "con" | "neutral" — classifies the contribution for explanations.
    outcome: Mapped[str] = mapped_column(String(12), default="neutral", nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=100, nullable=False)


class UserAnswer(Base, TimestampMixin):
    """Persisted questionnaire answers for auditability/analytics.

    Each recommendation request records the answers it evaluated under a
    generated session id.
    """

    __tablename__ = "user_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(48), index=True, nullable=False)
    question_key: Mapped[str] = mapped_column(String(48), nullable=False)
    answer_value: Mapped[str] = mapped_column(String(255), default="", nullable=False)
