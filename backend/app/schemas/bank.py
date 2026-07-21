"""Bank (issuer) schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import Field

from app.schemas.common import RequestModel, ResponseModel


class BankRead(ResponseModel):
    id: str
    slug: str
    name: str
    country: str
    website: str
    description: str
    is_active: bool
    # Populated by the service layer (count of cards issued by this bank).
    card_count: int = 0
    updated_at: datetime


class BankCreate(RequestModel):
    slug: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=160)
    country: str = Field(default="US", max_length=64)
    website: str = Field(default="", max_length=255)
    description: str = Field(default="", max_length=2000)
    is_active: bool = True


class BankUpdate(RequestModel):
    slug: str | None = Field(default=None, min_length=1, max_length=64)
    name: str | None = Field(default=None, min_length=1, max_length=160)
    country: str | None = Field(default=None, max_length=64)
    website: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    is_active: bool | None = None
