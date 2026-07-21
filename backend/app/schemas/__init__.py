"""Pydantic schemas."""

from app.schemas.card import CardCreate, CardRead, CardUpdate
from app.schemas.category import CategoryCreate, CategoryRead
from app.schemas.common import PaginatedResponse, RequestModel, ResponseModel
from app.schemas.faq import FaqCreate, FaqRead, FaqUpdate
from app.schemas.questionnaire import QuestionnaireAnswers
from app.schemas.recommendation import (
    EligibilityInfo,
    MatchedBenefit,
    MatchReason,
    Recommendation,
    RecommendationResult,
)
from app.schemas.reward_rate import RewardRateInput, RewardRateRead

__all__ = [
    "CardCreate",
    "CardRead",
    "CardUpdate",
    "CategoryCreate",
    "CategoryRead",
    "PaginatedResponse",
    "RequestModel",
    "ResponseModel",
    "FaqCreate",
    "FaqRead",
    "FaqUpdate",
    "QuestionnaireAnswers",
    "EligibilityInfo",
    "MatchedBenefit",
    "MatchReason",
    "Recommendation",
    "RecommendationResult",
    "RewardRateInput",
    "RewardRateRead",
]
