"""Reward rate schemas."""

from __future__ import annotations

from typing import Literal

from pydantic import Field

from app.schemas.common import RequestModel, ResponseModel

RewardUnit = Literal["percent", "points", "miles"]


class RewardRateRead(ResponseModel):
    category: str
    rate: float
    unit: RewardUnit
    cap: str | None = None


class RewardRateInput(RequestModel):
    category: str = Field(min_length=1, max_length=64)
    rate: float = Field(ge=0)
    unit: RewardUnit = "percent"
    cap: str | None = Field(default=None, max_length=128)
