"""Aggregates counts and recent activity for the admin dashboard."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.bank import Bank
from app.models.card import CreditCard
from app.models.category import Category
from app.models.question import Question
from app.models.rule import RecommendationRule
from app.schemas.dashboard import (
    ActivityRead,
    DashboardResponse,
    DashboardStats,
)
from app.services.activity_service import ActivityService


class DashboardService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.activity = ActivityService(db)

    def _count(self, model, *conditions) -> int:
        stmt = select(func.count()).select_from(model)
        for condition in conditions:
            stmt = stmt.where(condition)
        return int(self.db.execute(stmt).scalar_one())

    def get_dashboard(self, *, activity_limit: int = 10) -> DashboardResponse:
        stats = DashboardStats(
            total_cards=self._count(CreditCard),
            active_cards=self._count(CreditCard, CreditCard.is_active.is_(True)),
            total_banks=self._count(Bank),
            total_questions=self._count(Question),
            total_categories=self._count(Category),
            total_rules=self._count(RecommendationRule),
            active_rules=self._count(RecommendationRule, RecommendationRule.is_active.is_(True)),
        )
        recent = [
            ActivityRead.model_validate(entry)
            for entry in self.activity.recent(activity_limit)
        ]
        return DashboardResponse(stats=stats, recent_activity=recent)
