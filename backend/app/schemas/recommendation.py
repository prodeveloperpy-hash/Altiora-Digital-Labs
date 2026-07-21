"""Recommendation response schemas.

Extends the original contract (card, matchScore, reasons, highlight) with the
engine's richer explanation (overallScore, matchedBenefits, pros, cons,
eligibility, ranking). The original fields are retained so the frontend keeps
working; the new fields are additive.
"""

from __future__ import annotations

from app.schemas.card import CardRead
from app.schemas.common import ResponseModel


class MatchReason(ResponseModel):
    label: str
    detail: str


class MatchedBenefit(ResponseModel):
    code: str
    name: str
    detail: str


class EligibilityInfo(ResponseModel):
    eligible: bool
    passed: list[str]
    failed: list[str]


class Recommendation(ResponseModel):
    card: CardRead
    # Retained for backward compatibility (equals overallScore).
    match_score: int
    overall_score: int
    ranking: int
    reasons: list[MatchReason]
    matched_benefits: list[MatchedBenefit]
    pros: list[str]
    cons: list[str]
    eligibility: EligibilityInfo
    highlight: str | None = None


class RecommendationResult(ResponseModel):
    recommendations: list[Recommendation]
    evaluated_count: int
    session_id: str
