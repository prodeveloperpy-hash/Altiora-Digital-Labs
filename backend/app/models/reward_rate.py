"""Reward rate model — a single earn rate belonging to a card."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.card import CreditCard


class RewardRate(Base):
    __tablename__ = "reward_rates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    card_id: Mapped[str] = mapped_column(
        ForeignKey("credit_cards.id", ondelete="CASCADE"), index=True, nullable=False
    )
    category: Mapped[str] = mapped_column(String(64), nullable=False)
    rate: Mapped[float] = mapped_column(Float, nullable=False)
    # One of: "percent", "points", "miles".
    unit: Mapped[str] = mapped_column(String(16), nullable=False, default="percent")
    cap: Mapped[str | None] = mapped_column(String(128), nullable=True)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    card: Mapped["CreditCard"] = relationship(back_populates="reward_rates")
