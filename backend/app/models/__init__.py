"""ORM models. Importing this package registers every table on Base.metadata."""

from app.models.associations import card_category
from app.models.bank import Bank
from app.models.benefit import Benefit, card_benefit
from app.models.card import CreditCard
from app.models.category import Category
from app.models.eligibility_rule import EligibilityRule
from app.models.faq import Faq
from app.models.reward_category import RewardCategory
from app.models.reward_rate import RewardRate
from app.models.rule import CreditScoreTier, RecommendationRule
from app.models.scoring import (
    QuestionMapping,
    ScoringMatrixEntry,
    ScoringWeight,
    UserAnswer,
)

__all__ = [
    "card_category",
    "card_benefit",
    "Bank",
    "Benefit",
    "CreditCard",
    "Category",
    "EligibilityRule",
    "Faq",
    "RewardCategory",
    "RewardRate",
    "RecommendationRule",
    "CreditScoreTier",
    "QuestionMapping",
    "ScoringMatrixEntry",
    "ScoringWeight",
    "UserAnswer",
]
