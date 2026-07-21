"""Business logic for recommendations — adapts the engine to the API layer."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.recommendation_engine.engine import RecommendationEngine
from app.schemas.card import CardRead
from app.schemas.questionnaire import QuestionnaireAnswers
from app.schemas.recommendation import (
    EligibilityInfo,
    MatchedBenefit,
    MatchReason,
    Recommendation,
    RecommendationResult,
)


class RecommendationService:
    def __init__(self, db: Session) -> None:
        self.engine = RecommendationEngine(db)

    def recommend(self, answers: QuestionnaireAnswers) -> RecommendationResult:
        # The engine is decoupled from Pydantic: pass answers as a camelCase dict
        # keyed by question key (matching the frontend questionnaire fields).
        answers_dict = answers.model_dump(by_alias=True)

        output = self.engine.recommend(answers_dict)

        recommendations = [
            Recommendation(
                card=CardRead.model_validate(sc.card),
                match_score=sc.overall_score,
                overall_score=sc.overall_score,
                ranking=sc.ranking,
                reasons=[
                    MatchReason(label=reason.label, detail=reason.detail)
                    for reason in sc.reasons
                ],
                matched_benefits=[
                    MatchedBenefit(code=b.code, name=b.name, detail=b.detail)
                    for b in sc.matched_benefits
                ],
                pros=sc.pros,
                cons=sc.cons,
                eligibility=EligibilityInfo(
                    eligible=sc.eligibility.eligible,
                    passed=sc.eligibility.passed,
                    failed=sc.eligibility.failed,
                ),
                highlight=sc.highlight,
            )
            for sc in output.recommendations
        ]

        return RecommendationResult(
            recommendations=recommendations,
            evaluated_count=output.evaluated_count,
            session_id=output.session_id,
        )
