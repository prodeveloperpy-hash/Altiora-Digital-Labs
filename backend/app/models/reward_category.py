"""Reward category catalog.

A normalized list of spending/reward categories (dining, travel, groceries, …)
that reward rates, question mappings, and rules reference by code.
"""

from __future__ import annotations

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin


class RewardCategory(Base, TimestampMixin):
    __tablename__ = "reward_categories"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
