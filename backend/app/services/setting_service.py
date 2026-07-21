"""Business logic for application settings.

Settings are seeded as a fixed catalog of editable keys. Updates only ever change
the value of an existing setting; unknown keys are rejected so the admin panel
stays a closed, well-typed surface.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.exceptions import ValidationError
from app.repositories.setting_repository import SettingRepository
from app.schemas.setting import SettingRead


class SettingService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = SettingRepository(db)

    def list_settings(self) -> list[SettingRead]:
        return [SettingRead.model_validate(setting) for setting in self.repo.list()]

    def update_setting(self, key: str, value: object) -> SettingRead:
        setting = self.repo.get(key)
        if setting is None:
            raise ValidationError(
                f"Unknown setting '{key}'.",
                errors={"key": "This setting does not exist."},
            )
        self._validate(key, value)
        setting.value = value
        self.db.commit()
        self.db.refresh(setting)
        return SettingRead.model_validate(setting)

    def update_many(self, values: dict[str, object]) -> list[SettingRead]:
        existing = {setting.key: setting for setting in self.repo.list()}
        unknown = [key for key in values if key not in existing]
        if unknown:
            raise ValidationError(
                "One or more settings do not exist.",
                errors={"values": f"Unknown settings: {', '.join(unknown)}"},
            )
        for key, value in values.items():
            self._validate(key, value)
            existing[key].value = value
        self.db.commit()
        return self.list_settings()

    def _validate(self, key: str, value: object) -> None:
        if key == "recommendationScoreThreshold":
            if not isinstance(value, int | float) or isinstance(value, bool):
                raise ValidationError(
                    "The score threshold must be a number.",
                    errors={key: "Provide a number between 0 and 100."},
                )
            if not 0 <= float(value) <= 100:
                raise ValidationError(
                    "The score threshold must be between 0 and 100.",
                    errors={key: "Out of range."},
                )
        if key == "defaultRankingWeights" and not isinstance(value, dict):
            raise ValidationError(
                "Ranking weights must be an object of key/number pairs.",
                errors={key: "Invalid structure."},
            )
