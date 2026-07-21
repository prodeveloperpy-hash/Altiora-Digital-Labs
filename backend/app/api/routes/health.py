"""Health check endpoint."""

from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import text

from app.api.deps import DbSession
from app.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Service health check")
def health_check(db: DbSession) -> dict[str, object]:
    """Report service and database health."""
    database_ok = True
    try:
        db.execute(text("SELECT 1"))
    except Exception:  # noqa: BLE001 - report degraded rather than raising
        database_ok = False

    return {
        "status": "ok" if database_ok else "degraded",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "database": "connected" if database_ok else "unavailable",
    }
