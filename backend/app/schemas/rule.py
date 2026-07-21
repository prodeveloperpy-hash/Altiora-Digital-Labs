"""Recommendation-rule schemas.

These map 1:1 to the ``recommendation_rules`` table the engine loads at request
time. Editing rows through these schemas is the sole way to change scoring
behavior — there is no hardcoded scoring logic.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import Field

from app.schemas.common import RequestModel, ResponseModel

RuleOutcome = Literal["pro", "con", "neutral"]


class RuleRead(ResponseModel):
    id: int
    code: str
    description: str
    operator: str
    answer_field: str | None = None
    card_field: str | None = None
    target_number: float | None = None
    target_value: str | None = None
    points: float
    weight_key: str | None = None
    benefit_code: str | None = None
    reason_label: str
    reason_detail: str
    outcome: str
    is_active: bool
    priority: int
    updated_at: datetime


class RuleCreate(RequestModel):
    code: str = Field(min_length=1, max_length=64)
    description: str = Field(default="", max_length=2000)
    operator: str = Field(min_length=1, max_length=48)
    answer_field: str | None = Field(default=None, max_length=48)
    card_field: str | None = Field(default=None, max_length=48)
    target_number: float | None = None
    target_value: str | None = Field(default=None, max_length=64)
    points: float = 0.0
    weight_key: str | None = Field(default=None, max_length=48)
    benefit_code: str | None = Field(default=None, max_length=64)
    reason_label: str = Field(default="", max_length=120)
    reason_detail: str = Field(default="", max_length=300)
    outcome: RuleOutcome = "pro"
    is_active: bool = True
    priority: int = Field(default=100, ge=0)


class RuleUpdate(RequestModel):
    code: str | None = Field(default=None, min_length=1, max_length=64)
    description: str | None = Field(default=None, max_length=2000)
    operator: str | None = Field(default=None, min_length=1, max_length=48)
    answer_field: str | None = Field(default=None, max_length=48)
    card_field: str | None = Field(default=None, max_length=48)
    target_number: float | None = None
    target_value: str | None = Field(default=None, max_length=64)
    points: float | None = None
    weight_key: str | None = Field(default=None, max_length=48)
    benefit_code: str | None = Field(default=None, max_length=64)
    reason_label: str | None = Field(default=None, max_length=120)
    reason_detail: str | None = Field(default=None, max_length=300)
    outcome: RuleOutcome | None = None
    is_active: bool | None = None
    priority: int | None = Field(default=None, ge=0)


class OperatorCatalog(ResponseModel):
    """Available operator vocabulary and card fields for building rules."""

    scoring: list[str]
    eligibility: list[str]
    card_fields: list[str]
    weight_keys: list[str]
