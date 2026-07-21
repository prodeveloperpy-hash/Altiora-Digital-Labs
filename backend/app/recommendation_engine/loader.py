"""Dynamic rule loading.

Reads the entire engine configuration from SQLite at evaluation time — rules,
scoring matrix, eligibility rules, weights, credit-tier ranks, benefit catalog,
and question mappings — and derives the user's mapped tokens. Nothing here is
hardcoded: change the tables and the next request behaves differently.
"""

from __future__ import annotations

from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.benefit import Benefit
from app.models.eligibility_rule import EligibilityRule
from app.models.reward_category import RewardCategory  # noqa: F401 - catalog table
from app.models.rule import CreditScoreTier, RecommendationRule
from app.models.scoring import QuestionMapping, ScoringMatrixEntry, ScoringWeight
from app.recommendation_engine.types import RuleSet

Answers = dict[str, object]


class RuleLoader:
    def __init__(self, db: Session) -> None:
        self.db = db

    def _active(self, model, *, order_by=None):
        stmt = select(model).where(model.is_active.is_(True))
        if order_by is not None:
            stmt = stmt.order_by(order_by)
        return list(self.db.execute(stmt).scalars().all())

    def load(self, answers: Answers) -> RuleSet:
        rules = self._active(RecommendationRule, order_by=RecommendationRule.priority.asc())
        matrix = self._active(ScoringMatrixEntry, order_by=ScoringMatrixEntry.priority.asc())
        eligibility_rules = self._active(
            EligibilityRule, order_by=EligibilityRule.priority.asc()
        )

        weights = {
            w.key: w.value for w in self.db.execute(select(ScoringWeight)).scalars().all()
        }
        credit_ranks = {
            t.slug: t.rank for t in self.db.execute(select(CreditScoreTier)).scalars().all()
        }
        benefit_names = {
            b.code: (b.name, b.description)
            for b in self.db.execute(select(Benefit)).scalars().all()
        }
        mappings = self.db.execute(
            select(QuestionMapping).where(QuestionMapping.is_active.is_(True))
        ).scalars().all()

        derived_tokens = self._derive_tokens(mappings, answers)

        return RuleSet(
            rules=rules,
            matrix=matrix,
            eligibility_rules=eligibility_rules,
            weights=weights,
            credit_ranks=credit_ranks,
            benefit_names=benefit_names,
            derived_tokens=derived_tokens,
        )

    @staticmethod
    def _derive_tokens(
        mappings: list[QuestionMapping], answers: Answers
    ) -> dict[str, set[str]]:
        derived: dict[str, set[str]] = defaultdict(set)
        for mapping in mappings:
            answer = answers.get(mapping.question_key)
            if answer is None:
                continue
            if _mapping_matches(mapping.answer_value, answer):
                derived[mapping.target_type].add(mapping.target_code)
        return dict(derived)


def _mapping_matches(answer_value: str | None, answer: object) -> bool:
    # A null/wildcard answer_value matches whenever the question was answered.
    if answer_value in (None, "", "*"):
        if isinstance(answer, list | tuple | set):
            return len(answer) > 0
        return answer is not None
    if isinstance(answer, list | tuple | set):
        return answer_value in {str(item) for item in answer}
    if isinstance(answer, bool):
        return str(answer).lower() == answer_value.lower()
    return str(answer) == answer_value
