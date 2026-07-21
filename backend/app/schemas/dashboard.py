"""Dashboard statistics + activity schemas."""

from __future__ import annotations

from datetime import datetime

from app.schemas.common import ResponseModel


class DashboardStats(ResponseModel):
    total_cards: int
    active_cards: int
    total_banks: int
    total_questions: int
    total_categories: int
    total_rules: int
    active_rules: int


class ActivityRead(ResponseModel):
    id: int
    actor: str
    action: str
    entity_type: str
    entity_id: str | None = None
    summary: str
    created_at: datetime


class DashboardResponse(ResponseModel):
    stats: DashboardStats
    recent_activity: list[ActivityRead]


class UploadResponse(ResponseModel):
    url: str
    filename: str
    size: int
    content_type: str
