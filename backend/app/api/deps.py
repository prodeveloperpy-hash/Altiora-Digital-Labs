"""Shared API dependencies."""

from __future__ import annotations

import secrets
from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.config import settings
from app.database.session import get_db
from app.exceptions import AppError
from app.services.card_service import CardService
from app.services.category_service import CategoryService
from app.services.faq_service import FaqService
from app.services.recommendation_service import RecommendationService

DbSession = Annotated[Session, Depends(get_db)]


def require_admin_api_key(x_api_key: Annotated[str | None, Header()] = None) -> None:
    """Protect writes when an administrator key is configured."""
    if settings.admin_api_key and (
        x_api_key is None or not secrets.compare_digest(x_api_key, settings.admin_api_key)
    ):
        raise AppError(
            "A valid administrator API key is required.",
            status_code=401,
            code="unauthorized",
        )


AdminAccess = Annotated[None, Depends(require_admin_api_key)]


def get_card_service(db: DbSession) -> CardService:
    return CardService(db)


def get_category_service(db: DbSession) -> CategoryService:
    return CategoryService(db)


def get_faq_service(db: DbSession) -> FaqService:
    return FaqService(db)


def get_recommendation_service(db: DbSession) -> RecommendationService:
    return RecommendationService(db)


CardServiceDep = Annotated[CardService, Depends(get_card_service)]
CategoryServiceDep = Annotated[CategoryService, Depends(get_category_service)]
FaqServiceDep = Annotated[FaqService, Depends(get_faq_service)]
RecommendationServiceDep = Annotated[RecommendationService, Depends(get_recommendation_service)]
