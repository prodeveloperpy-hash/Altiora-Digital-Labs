"""Data access for categories."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.associations import card_category
from app.models.card import CreditCard
from app.models.category import Category


class CategoryRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[Category]:
        stmt = (
            select(Category)
            .where(~Category.slug.like("questionnaire-%"))
            .order_by(Category.name.asc())
        )
        return list(self.db.execute(stmt).scalars().all())

    def get_by_slug(self, slug: str) -> Category | None:
        stmt = select(Category).where(Category.slug == slug)
        return self.db.execute(stmt).scalars().first()

    def active_card_counts(self) -> dict[str, int]:
        """Return a mapping of category id -> number of active cards."""
        stmt = (
            select(card_category.c.category_id, func.count(CreditCard.id))
            .join(CreditCard, CreditCard.id == card_category.c.card_id)
            .where(CreditCard.is_active.is_(True))
            .group_by(card_category.c.category_id)
        )
        return {row[0]: int(row[1]) for row in self.db.execute(stmt).all()}

    def add(self, category: Category) -> Category:
        self.db.add(category)
        self.db.flush()
        return category

    def delete(self, category: Category) -> None:
        self.db.delete(category)
        self.db.flush()
