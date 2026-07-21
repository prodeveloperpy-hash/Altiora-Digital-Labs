"""Shared API dependencies."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.card_service import CardService
from app.services.category_service import CategoryService
from app.services.faq_service import FaqService
from app.services.recommendation_service import RecommendationService

DbSession = Annotated[Session, Depends(get_db)]


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
