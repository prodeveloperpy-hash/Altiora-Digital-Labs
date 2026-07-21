"""Business logic for FAQs."""

from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.exceptions import NotFoundError
from app.models.faq import Faq
from app.repositories.faq_repository import FaqRepository
from app.schemas.faq import FaqCreate, FaqRead, FaqUpdate


class FaqService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = FaqRepository(db)

    def list_faqs(self) -> list[FaqRead]:
        return [FaqRead.model_validate(faq) for faq in self.repo.list()]

    def create_faq(self, payload: FaqCreate) -> FaqRead:
        faq = Faq(
            id=payload.id or uuid.uuid4().hex,
            question=payload.question,
            answer=payload.answer,
            category=payload.category,
            position=payload.position,
        )
        self.repo.add(faq)
        self.db.commit()
        return FaqRead.model_validate(faq)

    def update_faq(self, faq_id: str, payload: FaqUpdate) -> FaqRead:
        faq = self.repo.get(faq_id)
        if faq is None:
            raise NotFoundError(f"FAQ '{faq_id}' was not found.")
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(faq, field, value)
        self.db.commit()
        return FaqRead.model_validate(faq)

    def delete_faq(self, faq_id: str) -> None:
        faq = self.repo.get(faq_id)
        if faq is None:
            raise NotFoundError(f"FAQ '{faq_id}' was not found.")
        self.repo.delete(faq)
        self.db.commit()
