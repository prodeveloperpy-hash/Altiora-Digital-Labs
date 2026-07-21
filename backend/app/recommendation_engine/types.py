"""Value objects produced and consumed by the recommendation engine.

These are plain dataclasses with no dependency on FastAPI, Pydantic, or the web
layer, keeping the engine an independent, reusable module.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.card import CreditCard


@dataclass(frozen=True)
class Reason:
    """An explanation for a scoring contribution."""

    label: str
    detail: str
    outcome: str  # "pro" | "con" | "neutral"
    contribution: float


@dataclass(frozen=True)
class MatchedBenefit:
    code: str
    name: str
    detail: str


@dataclass
class Eligibility:
    eligible: bool
    passed: list[str] = field(default_factory=list)
    failed: list[str] = field(default_factory=list)


@dataclass
class ScoredCard:
    card: "CreditCard"
    raw_score: float
    overall_score: int
    ranking: int
    reasons: list[Reason]
    matched_benefits: list[MatchedBenefit]
    pros: list[str]
    cons: list[str]
    eligibility: Eligibility
    highlight: str | None = None


@dataclass
class EngineOutput:
    recommendations: list[ScoredCard]
    evaluated_count: int
    session_id: str


@dataclass
class RuleSet:
    """All engine data loaded from the database for a single evaluation."""

    rules: list  # list[RecommendationRule]
    matrix: list  # list[ScoringMatrixEntry]
    eligibility_rules: list  # list[EligibilityRule]
    weights: dict[str, float]
    credit_ranks: dict[str, int]
    benefit_names: dict[str, tuple[str, str]]  # code -> (name, description)
    derived_tokens: dict[str, set[str]]  # token_type -> set of codes for the user


@dataclass
class EvaluationContext:
    """Per-request lookup data passed to operators."""

    weights: dict[str, float]
    credit_ranks: dict[str, int]
    derived_tokens: dict[str, set[str]]
