"""Data access for recommendation rules."""

from __future__ import annotations

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.rule import RecommendationRule


class RuleRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(
        self,
        *,
        search: str | None = None,
        outcome: str | None = None,
        is_active: bool | None = None,
    ) -> list[RecommendationRule]:
        stmt = select(RecommendationRule)
        if search:
            term = f"%{search.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(RecommendationRule.code).like(term),
                    func.lower(RecommendationRule.description).like(term),
                    func.lower(RecommendationRule.reason_label).like(term),
                )
            )
        if outcome:
            stmt = stmt.where(RecommendationRule.outcome == outcome)
        if is_active is not None:
            stmt = stmt.where(RecommendationRule.is_active.is_(is_active))
        stmt = stmt.order_by(RecommendationRule.priority.asc(), RecommendationRule.code.asc())
        return list(self.db.execute(stmt).scalars().all())

    def get(self, rule_id: int) -> RecommendationRule | None:
        return self.db.get(RecommendationRule, rule_id)

    def get_by_code(self, code: str) -> RecommendationRule | None:
        stmt = select(RecommendationRule).where(RecommendationRule.code == code)
        return self.db.execute(stmt).scalars().first()

    def add(self, rule: RecommendationRule) -> RecommendationRule:
        self.db.add(rule)
        self.db.flush()
        return rule

    def delete(self, rule: RecommendationRule) -> None:
        self.db.delete(rule)
        self.db.flush()
