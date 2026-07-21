"""Independent, database-driven recommendation engine.

Public surface:
    RecommendationEngine(db).recommend(answers) -> EngineOutput

The engine loads all rules dynamically from SQLite and contains no hardcoded
scoring. See operators.py for the (fixed) operator vocabulary and the database
tables (recommendation_rules, scoring_matrix, eligibility_rules, scoring_weights,
question_mappings, benefits, reward_categories, credit_score_tiers) for the
(fully editable) rules.
"""

from app.recommendation_engine.engine import RecommendationEngine
from app.recommendation_engine.loader import RuleLoader
from app.recommendation_engine.operators import (
    ELIGIBILITY_OPERATORS,
    SCORING_OPERATORS,
    available_operators,
)
from app.recommendation_engine.types import (
    Eligibility,
    EngineOutput,
    EvaluationContext,
    MatchedBenefit,
    Reason,
    RuleSet,
    ScoredCard,
)

__all__ = [
    "RecommendationEngine",
    "RuleLoader",
    "SCORING_OPERATORS",
    "ELIGIBILITY_OPERATORS",
    "available_operators",
    "Eligibility",
    "EngineOutput",
    "EvaluationContext",
    "MatchedBenefit",
    "Reason",
    "RuleSet",
    "ScoredCard",
]
