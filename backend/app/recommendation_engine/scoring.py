"""The scoring algorithm.

Given a loaded RuleSet and the user's answers, evaluates every rule and matrix
entry against a card, determines eligibility, accumulates a weighted score, and
assembles a fully explained result (reasons, matched benefits, pros, cons).
"""

from __future__ import annotations

import logging

from app.models.card import CreditCard
from app.recommendation_engine.operators import (
    ELIGIBILITY_OPERATORS,
    SCORING_OPERATORS,
)
from app.recommendation_engine.types import (
    Eligibility,
    EvaluationContext,
    MatchedBenefit,
    Reason,
    RuleSet,
    ScoredCard,
)

logger = logging.getLogger("cardwise.recommendation")

_MAX_REASONS = 6

Answers = dict[str, object]


def _weight(weight_key: str | None, weights: dict[str, float]) -> float:
    if not weight_key:
        return 1.0
    return weights.get(weight_key, 1.0)


def _evaluate_scorables(
    scorables: list,
    base_attr: str,
    answers: Answers,
    card: CreditCard,
    ctx: EvaluationContext,
    weights: dict[str, float],
) -> list[tuple[float, Reason, str | None]]:
    """Evaluate a list of rule/matrix rows; return (contribution, reason, benefit_code)."""
    results: list[tuple[float, Reason, str | None]] = []
    for item in scorables:
        operator = SCORING_OPERATORS.get(item.operator)
        if operator is None:
            logger.warning("Unknown scoring operator '%s' on '%s'", item.operator, item.code)
            continue
        try:
            matched = operator(item, answers, card, ctx)
        except Exception:  # noqa: BLE001 - a bad rule must never break scoring
            logger.exception("Rule '%s' raised during evaluation; skipping", item.code)
            continue
        if not matched:
            continue

        base_value = float(getattr(item, base_attr))
        contribution = base_value * _weight(item.weight_key, weights)
        reason = Reason(
            label=item.reason_label,
            detail=item.reason_detail,
            outcome=item.outcome,
            contribution=contribution,
        )
        benefit_code = getattr(item, "benefit_code", None)
        results.append((contribution, reason, benefit_code))
    return results


def _evaluate_eligibility(
    eligibility_rules: list,
    answers: Answers,
    card: CreditCard,
    ctx: EvaluationContext,
) -> Eligibility:
    eligibility = Eligibility(eligible=True)
    for rule in eligibility_rules:
        if rule.card_id is not None and rule.card_id != card.id:
            continue
        operator = ELIGIBILITY_OPERATORS.get(rule.operator)
        if operator is None:
            logger.warning("Unknown eligibility operator '%s' on '%s'", rule.operator, rule.code)
            continue
        try:
            passed = operator(rule, answers, card, ctx)
        except Exception:  # noqa: BLE001
            logger.exception("Eligibility rule '%s' raised; treating as passed", rule.code)
            passed = True
        if passed:
            if rule.pass_message:
                eligibility.passed.append(rule.pass_message)
        else:
            eligibility.eligible = False
            if rule.fail_message:
                eligibility.failed.append(rule.fail_message)
    return eligibility


def _matched_benefits(
    card: CreditCard,
    matched_benefit_codes: set[str],
    ruleset: RuleSet,
) -> list[MatchedBenefit]:
    card_codes = set(card.benefit_codes)
    derived = ruleset.derived_tokens.get("benefit", set())
    codes = (matched_benefit_codes | (card_codes & derived)) & card_codes

    benefits: list[MatchedBenefit] = []
    for code in sorted(codes):
        name, description = ruleset.benefit_names.get(code, (code, ""))
        benefits.append(MatchedBenefit(code=code, name=name, detail=description))
    return benefits


def score_card(
    card: CreditCard,
    answers: Answers,
    ruleset: RuleSet,
    ctx: EvaluationContext,
) -> ScoredCard:
    """Score and fully explain a single card (ranking/normalization applied later)."""
    contributions = _evaluate_scorables(
        ruleset.rules, "points", answers, card, ctx, ruleset.weights
    ) + _evaluate_scorables(
        ruleset.matrix, "score", answers, card, ctx, ruleset.weights
    )

    raw_score = sum(contribution for contribution, _, _ in contributions)

    matched_benefit_codes = {
        benefit_code
        for _, reason, benefit_code in contributions
        if benefit_code and benefit_code in set(card.benefit_codes) and reason.outcome != "con"
    }

    eligibility = _evaluate_eligibility(ruleset.eligibility_rules, answers, card, ctx)

    # Split explanations.
    positive = [r for _, r, _ in contributions if r.outcome in ("pro", "neutral")]
    negative = [r for _, r, _ in contributions if r.outcome == "con"]

    reasons = sorted(positive, key=lambda r: r.contribution, reverse=True)[:_MAX_REASONS]

    benefits = _matched_benefits(card, matched_benefit_codes, ruleset)

    pros = _dedupe(
        [r.label for r in sorted(positive, key=lambda r: r.contribution, reverse=True) if r.label]
        + [benefit.name for benefit in benefits]
    )
    cons = _dedupe([r.label for r in negative if r.label] + eligibility.failed)

    return ScoredCard(
        card=card,
        raw_score=raw_score,
        overall_score=0,  # set during normalization
        ranking=0,  # set during ranking
        reasons=reasons,
        matched_benefits=benefits,
        pros=pros,
        cons=cons,
        eligibility=eligibility,
    )


def _dedupe(items: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        if item and item not in seen:
            seen.add(item)
            result.append(item)
    return result
