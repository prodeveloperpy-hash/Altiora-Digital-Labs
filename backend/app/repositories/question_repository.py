"""Data access for questionnaire questions."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.question import Question


class QuestionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self, *, include_inactive: bool = True) -> list[Question]:
        stmt = select(Question)
        if not include_inactive:
            stmt = stmt.where(Question.is_active.is_(True))
        stmt = stmt.order_by(Question.position.asc(), Question.created_at.asc())
        return list(self.db.execute(stmt).scalars().unique().all())

    def get(self, question_id: str) -> Question | None:
        return self.db.get(Question, question_id)

    def get_by_key(self, key: str) -> Question | None:
        stmt = select(Question).where(Question.key == key)
        return self.db.execute(stmt).scalars().first()

    def next_position(self) -> int:
        current_max = self.db.execute(select(func.max(Question.position))).scalar()
        return (current_max or 0) + 1

    def add(self, question: Question) -> Question:
        self.db.add(question)
        self.db.flush()
        return question

    def delete(self, question: Question) -> None:
        self.db.delete(question)
        self.db.flush()
