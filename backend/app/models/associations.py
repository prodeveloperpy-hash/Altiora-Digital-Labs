"""Association tables for many-to-many relationships."""

from __future__ import annotations

from sqlalchemy import Column, ForeignKey, Table

from app.database.base import Base

# Links credit cards to their categories.
card_category = Table(
    "card_category",
    Base.metadata,
    Column(
        "card_id",
        ForeignKey("credit_cards.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "category_id",
        ForeignKey("categories.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)
