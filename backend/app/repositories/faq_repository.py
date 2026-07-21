"""Data access for FAQs."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.faq import Faq


class FaqRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[Faq]:
        stmt = select(Faq).order_by(Faq.category.asc(), Faq.position.asc())
        return list(self.db.execute(stmt).scalars().all())

    def get(self, faq_id: str) -> Faq | None:
        return self.db.get(Faq, faq_id)

    def add(self, faq: Faq) -> Faq:
        self.db.add(faq)
        self.db.flush()
        return faq

    def delete(self, faq: Faq) -> None:
        self.db.delete(faq)
        self.db.flush()
