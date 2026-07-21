"""Operator vocabulary — the engine's only "logic".

Operators are pure *mechanism*: generic comparisons between a questionnaire
answer and a card attribute. They contain no weights, thresholds, targets, or
reason text — every one of those is supplied by a database row. The set of
operators is a stable vocabulary; rules (which operators to use, with what
weights/thresholds/messages) live entirely in SQLite, so tuning behavior or
adding rules is a data change, not a code change.

Answers are provided as a plain dict keyed by question key (e.g. "primaryGoal").
Card attributes are read via `CARD_FIELDS`.
"""

from __future__ import annotations

from collections.abc import Callable

from app.models.card import CreditCard
from app.recommendation_engine.types import EvaluationContext

Answers = dict[str, object]

# --- Card field accessors -----------------------------------------------
CARD_FIELDS: dict[str, Callable[[CreditCard], object]] = {
    "categories": lambda c: c.category_slugs,
    "recommendedCreditScore": lambda c: c.recommended_credit_score,
    "annualFee": lambda c: c.annual_fee,
    "aprMin": lambda c: c.apr_min,
    "aprMax": lambda c: c.apr_max,
    "foreignTransactionFee": lambda c: c.foreign_transaction_fee,
    "rating": lambda c: c.rating,
    "reviewCount": lambda c: c.review_count,
    "rewardCategories": lambda c: [r.category for r in c.reward_rates],
    "rewardUnits": lambda c: [r.unit for r in c.reward_rates],
    "benefitCodes": lambda c: c.benefit_codes,
    "signupBonusValue": lambda c: c.signup_bonus_value or 0.0,
}


def card_value(field: str | None, card: CreditCard):
    if field is None:
        return None
    accessor = CARD_FIELDS.get(field)
    return accessor(card) if accessor else None


def answer_value(field: str | None, answers: Answers):
    if field is None:
        return None
    return answers.get(field)


def as_number(value: object) -> float | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    return None


def _as_list(value: object) -> list | None:
    if isinstance(value, (list, tuple, set)):
        return list(value)
    return None


# --- Scoring operators ---------------------------------------------------
# Signature: (rule, answers, card, ctx) -> bool matched.

ScoringOperator = Callable[[object, Answers, CreditCard, EvaluationContext], bool]


def op_answer_in_card_list(rule, answers, card, _ctx) -> bool:
    collection = _as_list(card_value(rule.card_field, card))
    if collection is None:
        return False
    return answer_value(rule.answer_field, answers) in collection


def op_answer_list_overlaps_card_list(rule, answers, card, _ctx) -> bool:
    answer_list = _as_list(answer_value(rule.answer_field, answers))
    card_list = _as_list(card_value(rule.card_field, card))
    if answer_list is None or card_list is None:
        return False
    return bool(set(answer_list) & set(card_list))


def op_derived_token_overlaps_card_list(rule, _answers, card, ctx) -> bool:
    # target_value names a derived token type (e.g. "benefit", "reward_unit").
    tokens = ctx.derived_tokens.get(str(rule.target_value), set())
    card_list = _as_list(card_value(rule.card_field, card))
    if not tokens or card_list is None:
        return False
    return bool(tokens & set(card_list))


def op_card_num_lte_answer_num(rule, answers, card, _ctx) -> bool:
    c = as_number(card_value(rule.card_field, card))
    a = as_number(answer_value(rule.answer_field, answers))
    return c is not None and a is not None and c <= a


def op_card_num_gt_answer_num(rule, answers, card, _ctx) -> bool:
    c = as_number(card_value(rule.card_field, card))
    a = as_number(answer_value(rule.answer_field, answers))
    return c is not None and a is not None and c > a


def op_answer_equals_card(rule, answers, card, _ctx) -> bool:
    return answer_value(rule.answer_field, answers) == card_value(rule.card_field, card)


def op_credit_tier_meets(rule, answers, card, ctx) -> bool:
    user_rank = ctx.credit_ranks.get(str(answer_value(rule.answer_field, answers)))
    card_rank = ctx.credit_ranks.get(str(card_value(rule.card_field, card)))
    return user_rank is not None and card_rank is not None and user_rank >= card_rank


def op_answer_true_and_card_num_lte_target(rule, answers, card, _ctx) -> bool:
    if not bool(answer_value(rule.answer_field, answers)):
        return False
    c = as_number(card_value(rule.card_field, card))
    return c is not None and rule.target_number is not None and c <= rule.target_number


def op_answer_true_and_card_num_gt_target(rule, answers, card, _ctx) -> bool:
    if not bool(answer_value(rule.answer_field, answers)):
        return False
    c = as_number(card_value(rule.card_field, card))
    return c is not None and rule.target_number is not None and c > rule.target_number


def op_card_num_gte_target(rule, _answers, card, _ctx) -> bool:
    c = as_number(card_value(rule.card_field, card))
    return c is not None and rule.target_number is not None and c >= rule.target_number


def op_card_num_lte_target(rule, _answers, card, _ctx) -> bool:
    c = as_number(card_value(rule.card_field, card))
    return c is not None and rule.target_number is not None and c <= rule.target_number


SCORING_OPERATORS: dict[str, ScoringOperator] = {
    "answer_in_card_list": op_answer_in_card_list,
    "answer_list_overlaps_card_list": op_answer_list_overlaps_card_list,
    "derived_token_overlaps_card_list": op_derived_token_overlaps_card_list,
    "card_num_lte_answer_num": op_card_num_lte_answer_num,
    "card_num_gt_answer_num": op_card_num_gt_answer_num,
    "answer_equals_card": op_answer_equals_card,
    "credit_tier_meets": op_credit_tier_meets,
    "answer_true_and_card_num_lte_target": op_answer_true_and_card_num_lte_target,
    "answer_true_and_card_num_gt_target": op_answer_true_and_card_num_gt_target,
    "card_num_gte_target": op_card_num_gte_target,
    "card_num_lte_target": op_card_num_lte_target,
}


# --- Eligibility operators ----------------------------------------------
# Return True when the applicant PASSES the eligibility check.

EligibilityOperator = Callable[[object, Answers, CreditCard, EvaluationContext], bool]


def elig_credit_tier_meets(rule, answers, card, ctx) -> bool:
    user_rank = ctx.credit_ranks.get(str(answer_value(rule.answer_field, answers)))
    # Compare against the card's own attribute when card_field is set, else a fixed target.
    if rule.card_field:
        card_rank = ctx.credit_ranks.get(str(card_value(rule.card_field, card)))
    else:
        card_rank = ctx.credit_ranks.get(str(rule.threshold_value))
    if user_rank is None or card_rank is None:
        return True  # insufficient data -> do not block eligibility
    return user_rank >= card_rank


def elig_answer_num_gte_threshold(rule, answers, _card, _ctx) -> bool:
    a = as_number(answer_value(rule.answer_field, answers))
    if a is None or rule.threshold_number is None:
        return True
    return a >= rule.threshold_number


def elig_answer_num_lte_threshold(rule, answers, _card, _ctx) -> bool:
    a = as_number(answer_value(rule.answer_field, answers))
    if a is None or rule.threshold_number is None:
        return True
    return a <= rule.threshold_number


ELIGIBILITY_OPERATORS: dict[str, EligibilityOperator] = {
    "credit_tier_meets": elig_credit_tier_meets,
    "answer_num_gte_threshold": elig_answer_num_gte_threshold,
    "answer_num_lte_threshold": elig_answer_num_lte_threshold,
}


def available_operators() -> dict[str, list[str]]:
    return {
        "scoring": sorted(SCORING_OPERATORS),
        "eligibility": sorted(ELIGIBILITY_OPERATORS),
    }
