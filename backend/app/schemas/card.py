"""Credit card schemas (read + write)."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import Field

from app.schemas.common import RequestModel, ResponseModel
from app.schemas.reward_rate import RewardRateInput, RewardRateRead

CardNetwork = Literal["visa", "mastercard", "amex", "discover"]
CreditScoreTierLiteral = Literal["excellent", "good", "fair", "poor", "building"]


class CardRead(ResponseModel):
    id: str
    slug: str
    name: str
    issuer: str
    network: str
    # Sourced from the ORM `category_slugs` property, serialized as `categories`.
    categories: list[str] = Field(
        default_factory=list,
        validation_alias="category_slugs",
        serialization_alias="categories",
    )
    image_url: str
    summary: str
    description: str
    annual_fee: float
    apr_min: float
    apr_max: float
    intro_apr: str | None = None
    intro_apr_months: int | None = None
    foreign_transaction_fee: float
    recommended_credit_score: str
    rewards_summary: str
    reward_rates: list[RewardRateRead] = Field(default_factory=list)
    signup_bonus: str | None = None
    signup_bonus_value: float | None = None
    rewards_currency: str | None = None
    benefits: list[str] = Field(default_factory=list)
    pros: list[str] = Field(default_factory=list)
    cons: list[str] = Field(default_factory=list)
    rating: float
    review_count: int
    apply_url: str
    updated_at: datetime


class AdminCardRead(CardRead):
    """Card view for the admin panel — adds status flags and bank linkage."""

    is_featured: bool
    is_active: bool
    bank_id: str | None = None
    created_at: datetime


class CardCreate(RequestModel):
    slug: str = Field(min_length=1, max_length=160)
    name: str = Field(min_length=1, max_length=160)
    issuer: str = Field(min_length=1, max_length=120)
    network: CardNetwork
    bank_id: str | None = Field(default=None, max_length=64)
    categories: list[str] = Field(default_factory=list)
    image_url: str = Field(default="", max_length=512)
    summary: str = Field(default="", max_length=400)
    description: str = ""
    annual_fee: float = Field(default=0.0, ge=0)
    apr_min: float = Field(default=0.0, ge=0)
    apr_max: float = Field(default=0.0, ge=0)
    intro_apr: str | None = Field(default=None, max_length=200)
    intro_apr_months: int | None = Field(default=None, ge=0)
    foreign_transaction_fee: float = Field(default=0.0, ge=0)
    recommended_credit_score: CreditScoreTierLiteral = "good"
    rewards_summary: str = Field(default="", max_length=200)
    reward_rates: list[RewardRateInput] = Field(default_factory=list)
    signup_bonus: str | None = Field(default=None, max_length=300)
    signup_bonus_value: float | None = Field(default=None, ge=0)
    rewards_currency: str | None = Field(default=None, max_length=64)
    benefits: list[str] = Field(default_factory=list)
    pros: list[str] = Field(default_factory=list)
    cons: list[str] = Field(default_factory=list)
    rating: float = Field(default=0.0, ge=0, le=5)
    review_count: int = Field(default=0, ge=0)
    apply_url: str = Field(default="", max_length=512)
    is_featured: bool = False
    is_active: bool = True


class CardUpdate(RequestModel):
    """Partial update — all fields optional."""

    slug: str | None = Field(default=None, min_length=1, max_length=160)
    name: str | None = Field(default=None, min_length=1, max_length=160)
    issuer: str | None = Field(default=None, min_length=1, max_length=120)
    network: CardNetwork | None = None
    bank_id: str | None = Field(default=None, max_length=64)
    categories: list[str] | None = None
    image_url: str | None = Field(default=None, max_length=512)
    summary: str | None = Field(default=None, max_length=400)
    description: str | None = None
    annual_fee: float | None = Field(default=None, ge=0)
    apr_min: float | None = Field(default=None, ge=0)
    apr_max: float | None = Field(default=None, ge=0)
    intro_apr: str | None = Field(default=None, max_length=200)
    intro_apr_months: int | None = Field(default=None, ge=0)
    foreign_transaction_fee: float | None = Field(default=None, ge=0)
    recommended_credit_score: CreditScoreTierLiteral | None = None
    rewards_summary: str | None = Field(default=None, max_length=200)
    reward_rates: list[RewardRateInput] | None = None
    signup_bonus: str | None = Field(default=None, max_length=300)
    signup_bonus_value: float | None = Field(default=None, ge=0)
    rewards_currency: str | None = Field(default=None, max_length=64)
    benefits: list[str] | None = None
    pros: list[str] | None = None
    cons: list[str] | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    review_count: int | None = Field(default=None, ge=0)
    apply_url: str | None = Field(default=None, max_length=512)
    is_featured: bool | None = None
    is_active: bool | None = None
