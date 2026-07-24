"""Credit card model."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.database.base import Base, TimestampMixin
from app.models.associations import card_category
from app.models.benefit import card_benefit

if TYPE_CHECKING:
    from app.models.bank import Bank
    from app.models.benefit import Benefit
    from app.models.category import Category
    from app.models.reward_rate import RewardRate


def _generate_id() -> str:
    return uuid.uuid4().hex


class CreditCard(Base, TimestampMixin):
    __tablename__ = "credit_cards"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_generate_id)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(160), index=True, nullable=False)
    issuer: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    # One of: "visa", "mastercard", "amex", "discover".
    network: Mapped[str] = mapped_column(String(24), index=True, nullable=False)

    image_url: Mapped[str] = mapped_column(String(512), default="", nullable=False)
    summary: Mapped[str] = mapped_column(String(400), default="", nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)

    annual_fee: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    card_type: Mapped[str] = mapped_column(String(80), default="", nullable=False)
    joining_fee: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    fee_waiver: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    eligibility: Mapped[str] = mapped_column(Text, default="", nullable=False)
    income_requirement: Mapped[str] = mapped_column(String(200), default="", nullable=False)
    reward_rate: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    reward_points: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    cashback_categories: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    lounge_domestic: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    lounge_international: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    insurance: Mapped[str] = mapped_column(Text, default="", nullable=False)
    fuel: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    dining: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    shopping: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    travel: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    forex: Mapped[str] = mapped_column(String(200), default="", nullable=False)
    upi: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    concierge: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    golf: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    welcome_bonus: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    renewal_benefits: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    add_on_cards: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    emi_conversion: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    balance_transfer: Mapped[str] = mapped_column(String(300), default="", nullable=False)
    merchant_offers: Mapped[str] = mapped_column(Text, default="", nullable=False)
    apr_min: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    apr_max: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    intro_apr: Mapped[str | None] = mapped_column(String(200), nullable=True)
    intro_apr_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    foreign_transaction_fee: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # One of: "excellent", "good", "fair", "poor", "building".
    recommended_credit_score: Mapped[str] = mapped_column(
        String(24), index=True, nullable=False, default="good"
    )

    rewards_summary: Mapped[str] = mapped_column(String(200), default="", nullable=False)
    rewards_currency: Mapped[str | None] = mapped_column(String(64), nullable=True)

    signup_bonus: Mapped[str | None] = mapped_column(String(300), nullable=True)
    signup_bonus_value: Mapped[float | None] = mapped_column(Float, nullable=True)

    benefits: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    pros: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    cons: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)

    rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    apply_url: Mapped[str] = mapped_column(String(512), default="", nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)

    bank_id: Mapped[str | None] = mapped_column(
        ForeignKey("banks.id", ondelete="SET NULL"), nullable=True, index=True
    )

    bank: Mapped["Bank | None"] = relationship(back_populates="cards", lazy="selectin")
    categories: Mapped[list["Category"]] = relationship(
        secondary=card_category,
        back_populates="cards",
        lazy="selectin",
    )
    reward_rates: Mapped[list["RewardRate"]] = relationship(
        back_populates="card",
        cascade="all, delete-orphan",
        order_by="RewardRate.position",
        lazy="selectin",
    )
    benefit_links: Mapped[list["Benefit"]] = relationship(
        secondary=card_benefit,
        back_populates="cards",
        lazy="selectin",
    )

    @property
    def category_slugs(self) -> list[str]:
        """Category slugs, used directly by the API response schema."""
        return [category.slug for category in self.categories]

    @property
    def benefit_codes(self) -> list[str]:
        """Structured benefit codes attached to this card."""
        return [benefit.code for benefit in self.benefit_links]
