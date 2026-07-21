"""Aggregates all API route modules under a single router."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.routes import cards, categories, faqs, health, recommendations

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(cards.router)
api_router.include_router(categories.router)
api_router.include_router(recommendations.router)
api_router.include_router(faqs.router)
