"""Business logic for questionnaire questions and their options."""

from __future__ import annotations

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.question import Question, QuestionOption
from app.repositories.question_repository import QuestionRepository
from app.schemas.question import (
    QuestionCreate,
    QuestionOptionInput,
    QuestionRead,
    QuestionUpdate,
)

# Types that require at least one option to be meaningful.
_CHOICE_TYPES = {"radio", "checkbox", "dropdown"}


class QuestionService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = QuestionRepository(db)

    def list_questions(self, *, include_inactive: bool = True) -> list[QuestionRead]:
        questions = self.repo.list(include_inactive=include_inactive)
        return [QuestionRead.model_validate(question) for question in questions]

    def get_question(self, question_id: str) -> QuestionRead:
        question = self._require(question_id)
        return QuestionRead.model_validate(question)

    def create_question(self, payload: QuestionCreate) -> QuestionRead:
        self._validate_options(payload.type, payload.options)
        question = Question(
            key=payload.key,
            label=payload.label,
            help_text=payload.help_text,
            type=payload.type,
            is_required=payload.is_required,
            is_active=payload.is_active,
            position=self.repo.next_position(),
            config=payload.config,
        )
        question.options = self._build_options(payload.options)
        try:
            self.repo.add(question)
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError(f"A question with key '{payload.key}' already exists.") from exc
        self.db.refresh(question)
        return QuestionRead.model_validate(question)

    def update_question(self, question_id: str, payload: QuestionUpdate) -> QuestionRead:
        question = self._require(question_id)
        data = payload.model_dump(exclude_unset=True)

        new_type = data.get("type", question.type)
        if "options" in data:
            options = payload.options or []
            self._validate_options(new_type, options)
            question.options = self._build_options(options)
            data.pop("options")

        for field, value in data.items():
            setattr(question, field, value)

        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError("Could not update question due to a conflicting value.") from exc
        self.db.refresh(question)
        return QuestionRead.model_validate(question)

    def delete_question(self, question_id: str) -> None:
        question = self._require(question_id)
        self.repo.delete(question)
        self.db.commit()

    def reorder(self, ordered_ids: list[str]) -> list[QuestionRead]:
        questions = {q.id: q for q in self.repo.list(include_inactive=True)}
        missing = [qid for qid in ordered_ids if qid not in questions]
        if missing:
            raise ValidationError(
                "One or more questions do not exist.",
                errors={"ids": f"Unknown question ids: {', '.join(missing)}"},
            )
        for index, qid in enumerate(ordered_ids):
            questions[qid].position = index + 1
        self.db.commit()
        return self.list_questions(include_inactive=True)

    # --- Helpers ---------------------------------------------------------
    def _require(self, question_id: str) -> Question:
        question = self.repo.get(question_id)
        if question is None:
            raise NotFoundError(f"Question '{question_id}' was not found.")
        return question

    def _validate_options(self, question_type: str, options: list[QuestionOptionInput]) -> None:
        if question_type in _CHOICE_TYPES and not options:
            raise ValidationError(
                "This question type requires at least one option.",
                errors={"options": "Add one or more options."},
            )
        values = [option.value for option in options]
        if len(values) != len(set(values)):
            raise ValidationError(
                "Option values must be unique within a question.",
                errors={"options": "Duplicate option values are not allowed."},
            )

    def _build_options(self, options: list[QuestionOptionInput]) -> list[QuestionOption]:
        return [
            QuestionOption(
                label=option.label,
                value=option.value,
                weight=option.weight,
                position=index,
                mapped_categories=option.mapped_categories,
                mapped_rules=option.mapped_rules,
                mapped_card_conditions=option.mapped_card_conditions,
            )
            for index, option in enumerate(options)
        ]
