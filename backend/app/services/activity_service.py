"""Records and reads the administrative activity log."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog
from app.repositories.activity_repository import ActivityRepository


class ActivityService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = ActivityRepository(db)

    def record(
        self,
        *,
        actor: str,
        actor_id: str | None,
        action: str,
        entity_type: str,
        entity_id: str | None = None,
        summary: str = "",
    ) -> ActivityLog:
        entry = ActivityLog(
            actor=actor,
            actor_id=actor_id,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id is not None else None,
            summary=summary,
        )
        self.repo.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def recent(self, limit: int = 10) -> list[ActivityLog]:
        return self.repo.recent(limit)
