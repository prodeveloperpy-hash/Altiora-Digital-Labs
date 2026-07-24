"""Recommendation engine unit tests.

These exercise the engine directly (not via HTTP) and, crucially, prove that
behavior is defined by the database: disabling a rule row changes the output with
no code change.
"""

from __future__ import annotations

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401 - register models
from app.database.base import Base
from app.database.seed import seed
from app.models.rule import RecommendationRule
from app.models.scoring import ScoringWeight, UserAnswer
from app.recommendation_engine import RecommendationEngine, available_operators

TRAVEL_ANSWERS = {
    "primaryGoal": "travel",
    "creditScore": "excellent",
    "monthlySpend": 2500,
    "spendingCategories": ["travel", "dining"],
    "maxAnnualFee": 200,
    "travelsInternationally": True,
    "carriesBalance": False,
    "rewardPreference": "miles",
}


def _fresh_session() -> Session:
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    db = factory()
    seed(db)
    return db


def test_engine_produces_rich_explained_output() -> None:
    db = _fresh_session()
    try:
        output = RecommendationEngine(db).recommend(TRAVEL_ANSWERS)
        assert output.evaluated_count >= 6
        assert output.session_id
        top = output.recommendations[0]
        assert top.overall_score == 100
        assert top.ranking == 1
        assert top.highlight == "Best overall match"
        assert top.reasons
        assert isinstance(top.matched_benefits, list)
        assert top.pros
        assert top.eligibility.eligible is True
    finally:
        db.close()


def test_engine_persists_user_answers() -> None:
    db = _fresh_session()
    try:
        output = RecommendationEngine(db).recommend(TRAVEL_ANSWERS)
        rows = db.execute(
            select(UserAnswer).where(UserAnswer.session_id == output.session_id)
        ).scalars().all()
        assert {row.question_key for row in rows} >= {"primaryGoal", "creditScore"}
    finally:
        db.close()


def test_engine_is_database_driven_disable_rule() -> None:
    """Disabling a rule row (a DB change only) must change the output."""
    db = _fresh_session()
    try:
        engine = RecommendationEngine(db)
        before = engine.recommend(TRAVEL_ANSWERS)
        assert any(r.label == "Matches your primary goal" for r in before.recommendations[0].reasons)

        rule = db.execute(
            select(RecommendationRule).where(RecommendationRule.code == "goal_match")
        ).scalar_one()
        rule.is_active = False
        db.commit()

        after = engine.recommend(TRAVEL_ANSWERS)
        labels = {r.label for rec in after.recommendations for r in rec.reasons}
        assert "Matches your primary goal" not in labels
    finally:
        db.close()


def test_engine_is_database_driven_reweight() -> None:
    """Changing a weight value (a DB change only) must change the scores/order."""
    db = _fresh_session()
    try:
        engine = RecommendationEngine(db)
        before_top = engine.recommend(TRAVEL_ANSWERS).recommendations[0].card.slug

        # Zero out the goal weight so travel no longer dominates.
        weight = db.get(ScoringWeight, "goal")
        weight.value = 0.0
        db.commit()

        after = engine.recommend(TRAVEL_ANSWERS)
        # The raw scoring changed; the goal reason no longer contributes.
        labels = {r.label for r in after.recommendations[0].reasons}
        assert before_top  # sanity
        assert "Matches your primary goal" not in labels or after.recommendations[0].card.slug != before_top
    finally:
        db.close()


def test_operator_vocabulary_exposed() -> None:
    ops = available_operators()
    assert "scoring" in ops and "eligibility" in ops
    assert "answer_in_card_list" in ops["scoring"]
    assert "credit_tier_meets" in ops["eligibility"]
