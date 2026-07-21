"""ORM models. Importing this package registers every table on Base.metadata."""

from app.models.activity_log import ActivityLog
from app.models.admin_user import AdminUser
from app.models.associations import card_category
from app.models.bank import Bank
from app.models.benefit import Benefit, card_benefit
from app.models.card import CreditCard
from app.models.category import Category
from app.models.eligibility_rule import EligibilityRule
from app.models.faq import Faq
from app.models.question import Question, QuestionOption
from app.models.refresh_token import RefreshToken
from app.models.reward_category import RewardCategory
from app.models.reward_rate import RewardRate
from app.models.rule import CreditScoreTier, RecommendationRule
from app.models.scoring import (
    QuestionMapping,
    ScoringMatrixEntry,
    ScoringWeight,
    UserAnswer,
)
from app.models.setting import Setting

__all__ = [
    "card_category",
    "card_benefit",
    "ActivityLog",
    "AdminUser",
    "Bank",
    "Benefit",
    "CreditCard",
    "Category",
    "EligibilityRule",
    "Faq",
    "Question",
    "QuestionOption",
    "RefreshToken",
    "RewardCategory",
    "RewardRate",
    "RecommendationRule",
    "CreditScoreTier",
    "QuestionMapping",
    "ScoringMatrixEntry",
    "ScoringWeight",
    "Setting",
    "UserAnswer",
]
