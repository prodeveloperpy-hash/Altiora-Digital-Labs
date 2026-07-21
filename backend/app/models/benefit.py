"""Benefit catalog and card<->benefit association."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.card import CreditCard

# Association between cards and structured benefits.
card_benefit = Table(
    "card_benefit",
    Base.metadata,
    Column("card_id", ForeignKey("credit_cards.id", ondelete="CASCADE"), primary_key=True),
    Column("benefit_id", ForeignKey("benefits.id", ondelete="CASCADE"), primary_key=True),
)


class Benefit(Base, TimestampMixin):
    """A structured, reusable benefit that cards can offer (e.g. lounge access)."""

    __tablename__ = "benefits"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    # Grouping such as "travel", "protection", "rewards".
    category: Mapped[str] = mapped_column(String(64), default="general", nullable=False)

    cards: Mapped[list["CreditCard"]] = relationship(
        secondary=card_benefit,
        back_populates="benefit_links",
    )
