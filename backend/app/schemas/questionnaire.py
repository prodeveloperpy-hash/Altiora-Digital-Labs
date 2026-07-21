"""Questionnaire answer schema (recommendation request body)."""

from __future__ import annotations

from typing import Literal

from pydantic import Field

from app.schemas.common import RequestModel

CardCategoryLiteral = Literal[
    "cashback",
    "travel",
    "rewards",
    "balance-transfer",
    "low-interest",
    "student",
    "business",
    "secured",
    "no-annual-fee",
]
CreditScoreTierLiteral = Literal["excellent", "good", "fair", "poor", "building"]
RewardPreferenceLiteral = Literal["cashback", "points", "miles", "no-preference"]


class QuestionnaireAnswers(RequestModel):
    primary_goal: CardCategoryLiteral
    credit_score: CreditScoreTierLiteral
    monthly_spend: int = Field(ge=0, le=100_000)
    spending_categories: list[str] = Field(default_factory=list, max_length=20)
    max_annual_fee: int = Field(ge=0, le=1000)
    travels_internationally: bool = False
    carries_balance: bool = False
    reward_preference: RewardPreferenceLiteral = "no-preference"
