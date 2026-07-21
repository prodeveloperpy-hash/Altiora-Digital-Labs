"""Questionnaire question models managed from the admin panel.

A ``Question`` has a type (radio/checkbox/dropdown/number/slider) and an ordered
set of ``QuestionOption`` rows. Each option carries a scoring weight and the
targets it maps to (categories, recommendation rules, and raw card conditions),
so the questionnaire can be reshaped entirely from data.
"""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    pass

# Supported input types.
QUESTION_TYPES: tuple[str, ...] = ("radio", "checkbox", "dropdown", "number", "slider")


def _generate_id() -> str:
    return uuid.uuid4().hex


class Question(Base, TimestampMixin):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_generate_id)
    # Stable machine key the engine reads (e.g. "primaryGoal").
    key: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    help_text: Mapped[str] = mapped_column(Text, default="", nullable=False)
    # One of QUESTION_TYPES.
    type: Mapped[str] = mapped_column(String(24), default="radio", nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, index=True, nullable=False)
    # Config for number/slider types: {"min": 0, "max": 100, "step": 1, "unit": "$"}.
    config: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    options: Mapped[list["QuestionOption"]] = relationship(
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="QuestionOption.position",
        lazy="selectin",
    )


class QuestionOption(Base, TimestampMixin):
    __tablename__ = "question_options"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_generate_id)
    question_id: Mapped[str] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[str] = mapped_column(String(128), nullable=False)
    weight: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    # Category slugs this option maps to.
    mapped_categories: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    # Recommendation-rule codes this option reinforces.
    mapped_rules: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    # Raw card conditions, e.g. [{"field": "annualFee", "operator": "lte", "value": 0}].
    mapped_card_conditions: Mapped[list[dict[str, Any]]] = mapped_column(
        JSON, default=list, nullable=False
    )

    question: Mapped["Question"] = relationship(back_populates="options")
