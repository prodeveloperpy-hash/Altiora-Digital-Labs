"""Category schemas."""

from __future__ import annotations

from pydantic import Field

from app.schemas.common import RequestModel, ResponseModel


class CategoryRead(ResponseModel):
    id: str
    slug: str
    name: str
    description: str
    # Populated by the service layer (count of active cards in the category).
    card_count: int = 0


class CategoryCreate(RequestModel):
    slug: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=128)
    description: str = Field(default="", max_length=1000)
