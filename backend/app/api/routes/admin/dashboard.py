"""Admin dashboard statistics and recent activity."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Query

from app.api.admin_deps import CurrentAdmin, DashboardServiceDep
from app.schemas.dashboard import DashboardResponse

router = APIRouter(prefix="/dashboard", tags=["Admin · Dashboard"])


@router.get("", response_model=DashboardResponse, summary="Dashboard statistics + recent activity")
def get_dashboard(
    _current: CurrentAdmin,
    service: DashboardServiceDep,
    activity_limit: Annotated[int, Query(alias="activityLimit", ge=1, le=50)] = 10,
) -> DashboardResponse:
    return service.get_dashboard(activity_limit=activity_limit)
