"""Admin questionnaire management: CRUD, enable/disable, and drag-and-drop reorder."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Path, status

from app.api.admin_deps import (
    ActivityServiceDep,
    CurrentAdmin,
    QuestionServiceDep,
    RequireAdmin,
)
from app.schemas.question import (
    QuestionCreate,
    QuestionRead,
    QuestionReorderInput,
    QuestionUpdate,
)

router = APIRouter(prefix="/questions", tags=["Admin · Questions"])


@router.get("", response_model=list[QuestionRead], summary="List questions (ordered)")
def list_questions(_current: CurrentAdmin, service: QuestionServiceDep) -> list[QuestionRead]:
    return service.list_questions(include_inactive=True)


@router.get("/{question_id}", response_model=QuestionRead, summary="Get a question")
def get_question(
    _current: CurrentAdmin,
    service: QuestionServiceDep,
    question_id: Annotated[str, Path(description="Question id")],
) -> QuestionRead:
    return service.get_question(question_id)


@router.post(
    "",
    response_model=QuestionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a question",
)
def create_question(
    current: CurrentAdmin,
    service: QuestionServiceDep,
    activity: ActivityServiceDep,
    payload: QuestionCreate,
) -> QuestionRead:
    question = service.create_question(payload)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="created",
        entity_type="question",
        entity_id=question.id,
        summary=f"Created question “{question.label}”.",
    )
    return question


@router.post("/reorder", response_model=list[QuestionRead], summary="Reorder questions")
def reorder_questions(
    current: CurrentAdmin,
    service: QuestionServiceDep,
    activity: ActivityServiceDep,
    payload: QuestionReorderInput,
) -> list[QuestionRead]:
    questions = service.reorder(payload.ids)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="updated",
        entity_type="question",
        summary="Reordered the questionnaire.",
    )
    return questions


@router.patch("/{question_id}", response_model=QuestionRead, summary="Update a question")
def update_question(
    current: CurrentAdmin,
    service: QuestionServiceDep,
    activity: ActivityServiceDep,
    question_id: Annotated[str, Path(description="Question id")],
    payload: QuestionUpdate,
) -> QuestionRead:
    question = service.update_question(question_id, payload)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="updated",
        entity_type="question",
        entity_id=question.id,
        summary=f"Updated question “{question.label}”.",
    )
    return question


@router.delete(
    "/{question_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a question",
)
def delete_question(
    current: RequireAdmin,
    service: QuestionServiceDep,
    activity: ActivityServiceDep,
    question_id: Annotated[str, Path(description="Question id")],
):
    question = service.get_question(question_id)
    service.delete_question(question_id)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="deleted",
        entity_type="question",
        entity_id=question.id,
        summary=f"Deleted question “{question.label}”.",
    )
    return None
