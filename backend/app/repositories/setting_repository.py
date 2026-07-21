"""Data access for application settings."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.setting import Setting


class SettingRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self) -> list[Setting]:
        stmt = select(Setting).order_by(Setting.key.asc())
        return list(self.db.execute(stmt).scalars().all())

    def get(self, key: str) -> Setting | None:
        return self.db.get(Setting, key)

    def as_dict(self) -> dict[str, object]:
        return {setting.key: setting.value for setting in self.list()}
