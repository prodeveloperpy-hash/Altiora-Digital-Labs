"""Data access for the administrative activity log."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog


class ActivityRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def add(self, entry: ActivityLog) -> ActivityLog:
        self.db.add(entry)
        self.db.flush()
        return entry

    def recent(self, limit: int = 10) -> list[ActivityLog]:
        stmt = select(ActivityLog).order_by(ActivityLog.id.desc()).limit(limit)
        return list(self.db.execute(stmt).scalars().all())
