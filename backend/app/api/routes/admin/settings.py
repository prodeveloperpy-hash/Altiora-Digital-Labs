"""Admin application settings management."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Path

from app.api.admin_deps import (
    ActivityServiceDep,
    CurrentAdmin,
    RequireAdmin,
    SettingServiceDep,
)
from app.schemas.setting import SettingRead, SettingsBulkUpdate, SettingUpdate

router = APIRouter(prefix="/settings", tags=["Admin · Settings"])


@router.get("", response_model=list[SettingRead], summary="List all settings")
def list_settings(_current: CurrentAdmin, service: SettingServiceDep) -> list[SettingRead]:
    return service.list_settings()


@router.put("", response_model=list[SettingRead], summary="Update multiple settings")
def update_settings(
    current: RequireAdmin,
    service: SettingServiceDep,
    activity: ActivityServiceDep,
    payload: SettingsBulkUpdate,
) -> list[SettingRead]:
    settings = service.update_many(payload.values)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="updated",
        entity_type="settings",
        summary=f"Updated {len(payload.values)} setting(s).",
    )
    return settings


@router.put("/{key}", response_model=SettingRead, summary="Update a single setting")
def update_setting(
    current: RequireAdmin,
    service: SettingServiceDep,
    activity: ActivityServiceDep,
    key: Annotated[str, Path(description="Setting key")],
    payload: SettingUpdate,
) -> SettingRead:
    setting = service.update_setting(key, payload.value)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="updated",
        entity_type="settings",
        entity_id=key,
        summary=f"Updated setting “{key}”.",
    )
    return setting
