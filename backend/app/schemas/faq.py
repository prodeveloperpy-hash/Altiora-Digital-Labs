"""FAQ schemas."""

from __future__ import annotations

from pydantic import Field

from app.schemas.common import RequestModel, ResponseModel


class FaqRead(ResponseModel):
    id: str
    question: str
    answer: str
    category: str


class FaqCreate(RequestModel):
    id: str | None = Field(default=None, max_length=64)
    question: str = Field(min_length=1, max_length=300)
    answer: str = Field(min_length=1)
    category: str = Field(default="General", max_length=64)
    position: int = Field(default=0, ge=0)


class FaqUpdate(RequestModel):
    question: str | None = Field(default=None, min_length=1, max_length=300)
    answer: str | None = Field(default=None, min_length=1)
    category: str | None = Field(default=None, max_length=64)
    position: int | None = Field(default=None, ge=0)
