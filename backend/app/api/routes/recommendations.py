"""Recommendation endpoint."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import RecommendationServiceDep
from app.schemas.questionnaire import QuestionnaireAnswers
from app.schemas.recommendation import RecommendationResult

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.post(
    "",
    response_model=RecommendationResult,
    summary="Get database-driven card recommendations for questionnaire answers",
)
def get_recommendations(
    service: RecommendationServiceDep,
    answers: QuestionnaireAnswers,
) -> RecommendationResult:
    return service.recommend(answers)
