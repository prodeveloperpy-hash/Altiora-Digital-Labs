"""Questionnaire question + option schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import Field

from app.schemas.common import RequestModel, ResponseModel

QuestionType = Literal["radio", "checkbox", "dropdown", "number", "slider"]


class QuestionOptionRead(ResponseModel):
    id: str
    label: str
    value: str
    weight: float
    position: int
    mapped_categories: list[str] = Field(default_factory=list)
    mapped_rules: list[str] = Field(default_factory=list)
    mapped_card_conditions: list[dict[str, Any]] = Field(default_factory=list)


class QuestionOptionInput(RequestModel):
    label: str = Field(min_length=1, max_length=255)
    value: str = Field(min_length=1, max_length=128)
    weight: float = 0.0
    mapped_categories: list[str] = Field(default_factory=list)
    mapped_rules: list[str] = Field(default_factory=list)
    mapped_card_conditions: list[dict[str, Any]] = Field(default_factory=list)


class QuestionRead(ResponseModel):
    id: str
    key: str
    label: str
    help_text: str
    type: str
    is_required: bool
    is_active: bool
    position: int
    config: dict[str, Any] = Field(default_factory=dict)
    options: list[QuestionOptionRead] = Field(default_factory=list)
    updated_at: datetime


class QuestionCreate(RequestModel):
    key: str = Field(min_length=1, max_length=64)
    label: str = Field(min_length=1, max_length=255)
    help_text: str = Field(default="", max_length=2000)
    type: QuestionType = "radio"
    is_required: bool = False
    is_active: bool = True
    config: dict[str, Any] = Field(default_factory=dict)
    options: list[QuestionOptionInput] = Field(default_factory=list)


class QuestionUpdate(RequestModel):
    key: str | None = Field(default=None, min_length=1, max_length=64)
    label: str | None = Field(default=None, min_length=1, max_length=255)
    help_text: str | None = Field(default=None, max_length=2000)
    type: QuestionType | None = None
    is_required: bool | None = None
    is_active: bool | None = None
    config: dict[str, Any] | None = None
    options: list[QuestionOptionInput] | None = None


class QuestionReorderInput(RequestModel):
    """Ordered list of question ids representing the new display order."""

    ids: list[str] = Field(min_length=1)
