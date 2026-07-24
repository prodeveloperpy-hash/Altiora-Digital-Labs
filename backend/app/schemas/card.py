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
    card_type: str
    joining_fee: float
    fee_waiver: str
    eligibility: str
    income_requirement: str
    reward_rate: str
    reward_points: str
    cashback_categories: str
    lounge_domestic: str
    lounge_international: str
    insurance: str
    fuel: str
    dining: str
    shopping: str
    travel: str
    forex: str
    upi: str
    concierge: str
    golf: str
    welcome_bonus: str
    renewal_benefits: str
    add_on_cards: str
    emi_conversion: str
    balance_transfer: str
    merchant_offers: str
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
    benefits: list[str] = Field(
        default_factory=list,
        validation_alias="benefit_names",
        serialization_alias="benefits",
    )
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
    card_type: str = Field(default="", max_length=80)
    joining_fee: float = Field(default=0.0, ge=0)
    fee_waiver: str = Field(default="", max_length=300)
    eligibility: str = ""
    income_requirement: str = Field(default="", max_length=200)
    reward_rate: str = Field(default="", max_length=300)
    reward_points: str = Field(default="", max_length=300)
    cashback_categories: str = Field(default="", max_length=300)
    lounge_domestic: str = Field(default="", max_length=300)
    lounge_international: str = Field(default="", max_length=300)
    insurance: str = ""
    fuel: str = Field(default="", max_length=300)
    dining: str = Field(default="", max_length=300)
    shopping: str = Field(default="", max_length=300)
    travel: str = Field(default="", max_length=300)
    forex: str = Field(default="", max_length=200)
    upi: str = Field(default="", max_length=300)
    concierge: str = Field(default="", max_length=300)
    golf: str = Field(default="", max_length=300)
    welcome_bonus: str = Field(default="", max_length=300)
    renewal_benefits: str = Field(default="", max_length=300)
    add_on_cards: str = Field(default="", max_length=300)
    emi_conversion: str = Field(default="", max_length=300)
    balance_transfer: str = Field(default="", max_length=300)
    merchant_offers: str = ""
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
    benefit_codes: list[str] = Field(default_factory=list)
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
    card_type: str | None = Field(default=None, max_length=80)
    joining_fee: float | None = Field(default=None, ge=0)
    fee_waiver: str | None = Field(default=None, max_length=300)
    eligibility: str | None = None
    income_requirement: str | None = Field(default=None, max_length=200)
    reward_rate: str | None = Field(default=None, max_length=300)
    reward_points: str | None = Field(default=None, max_length=300)
    cashback_categories: str | None = Field(default=None, max_length=300)
    lounge_domestic: str | None = Field(default=None, max_length=300)
    lounge_international: str | None = Field(default=None, max_length=300)
    insurance: str | None = None
    fuel: str | None = Field(default=None, max_length=300)
    dining: str | None = Field(default=None, max_length=300)
    shopping: str | None = Field(default=None, max_length=300)
    travel: str | None = Field(default=None, max_length=300)
    forex: str | None = Field(default=None, max_length=200)
    upi: str | None = Field(default=None, max_length=300)
    concierge: str | None = Field(default=None, max_length=300)
    golf: str | None = Field(default=None, max_length=300)
    welcome_bonus: str | None = Field(default=None, max_length=300)
    renewal_benefits: str | None = Field(default=None, max_length=300)
    add_on_cards: str | None = Field(default=None, max_length=300)
    emi_conversion: str | None = Field(default=None, max_length=300)
    balance_transfer: str | None = Field(default=None, max_length=300)
    merchant_offers: str | None = None
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
    benefit_codes: list[str] | None = None
    pros: list[str] | None = None
    cons: list[str] | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    review_count: int | None = Field(default=None, ge=0)
    apply_url: str | None = Field(default=None, max_length=512)
    is_featured: bool | None = None
    is_active: bool | None = None
