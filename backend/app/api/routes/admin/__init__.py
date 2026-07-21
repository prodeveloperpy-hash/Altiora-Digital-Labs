"""Admin panel API routes, mounted under ``/api/admin``."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.routes.admin import (
    auth,
    banks,
    cards,
    categories,
    dashboard,
    questions,
    rules,
    settings,
    uploads,
)

admin_router = APIRouter(prefix="/admin")
admin_router.include_router(auth.router)
admin_router.include_router(dashboard.router)
admin_router.include_router(cards.router)
admin_router.include_router(banks.router)
admin_router.include_router(questions.router)
admin_router.include_router(categories.router)
admin_router.include_router(rules.router)
admin_router.include_router(settings.router)
admin_router.include_router(uploads.router)

__all__ = ["admin_router"]
