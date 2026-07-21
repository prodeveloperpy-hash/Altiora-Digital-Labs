"""Recommendation engine facade.

Orchestrates the pipeline requested of the engine:
  1. Load every rule (dynamically, from SQLite).
  2. Evaluate the user's answers.
  3. Calculate weighted scores.
  4. Rank cards (eligible first, then by score).
  5. Explain every recommendation.

The engine is self-contained: it depends only on the ORM models and a database
session — not on the web/service layer. Behavior is defined entirely by data, so
future rule changes are database updates only.
"""

from __future__ import annotations

import logging
import uuid

from sqlalchemy.orm import Session

from app.config import settings
from app.models.scoring import UserAnswer
from app.recommendation_engine.loader import RuleLoader
from app.recommendation_engine.scoring import score_card
from app.recommendation_engine.types import EngineOutput, EvaluationContext
from app.repositories.card_repository import CardRepository

logger = logging.getLogger("cardwise.recommendation")

Answers = dict[str, object]


class RecommendationEngine:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.loader = RuleLoader(db)
        self.cards_repo = CardRepository(db)

    def recommend(
        self,
        answers: Answers,
        *,
        session_id: str | None = None,
        limit: int | None = None,
        persist_answers: bool = True,
    ) -> EngineOutput:
        result_limit = limit if limit is not None else settings.recommendation_result_limit
        session_id = session_id or uuid.uuid4().hex

        if persist_answers:
            self._persist_answers(session_id, answers)

        # 1. Load every rule dynamically from the database.
        ruleset = self.loader.load(answers)
        ctx = EvaluationContext(
            weights=ruleset.weights,
            credit_ranks=ruleset.credit_ranks,
            derived_tokens=ruleset.derived_tokens,
        )
        cards = self.cards_repo.get_all_active()

        # 2/3. Evaluate answers and calculate weighted, explained scores.
        scored = [score_card(card, answers, ruleset, ctx) for card in cards]

        # Keep only cards with a positive score.
        scored = [sc for sc in scored if sc.raw_score > settings.recommendation_min_raw_score]

        # Normalize so the best eligible match scores 100.
        eligible_scores = [sc.raw_score for sc in scored if sc.eligibility.eligible]
        max_raw = max(eligible_scores, default=0.0) or max(
            (sc.raw_score for sc in scored), default=0.0
        )
        for sc in scored:
            sc.overall_score = (
                int(max(0, min(100, round(100 * sc.raw_score / max_raw)))) if max_raw > 0 else 0
            )

        # 4. Rank: eligible cards first, then by score, then rating as a tie-break.
        scored.sort(
            key=lambda sc: (sc.eligibility.eligible, sc.raw_score, sc.card.rating),
            reverse=True,
        )
        scored = scored[:result_limit]
        for index, sc in enumerate(scored, start=1):
            sc.ranking = index
        if scored:
            scored[0].highlight = "Best overall match"

        logger.info(
            "session=%s evaluated=%d rules=%d matrix=%d returned=%d",
            session_id,
            len(cards),
            len(ruleset.rules),
            len(ruleset.matrix),
            len(scored),
        )

        return EngineOutput(
            recommendations=scored,
            evaluated_count=len(cards),
            session_id=session_id,
        )

    def _persist_answers(self, session_id: str, answers: Answers) -> None:
        rows = [
            UserAnswer(
                session_id=session_id,
                question_key=str(key),
                answer_value=_stringify(value),
            )
            for key, value in answers.items()
        ]
        if rows:
            self.db.add_all(rows)
            self.db.commit()


def _stringify(value: object) -> str:
    if isinstance(value, (list, tuple, set)):
        return ",".join(str(item) for item in value)
    return str(value)
