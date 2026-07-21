"""Application settings schemas."""

from __future__ import annotations

from typing import Any

from pydantic import Field

from app.schemas.common import RequestModel, ResponseModel


class SettingRead(ResponseModel):
    key: str
    value: Any = None
    label: str
    description: str
    value_type: str


class SettingUpdate(RequestModel):
    """Single setting value update."""

    value: Any = None


class SettingsBulkUpdate(RequestModel):
    """Update many settings at once: a mapping of key -> value."""

    values: dict[str, Any] = Field(default_factory=dict)
