"""Category endpoints."""

from __future__ import annotations

from fastapi import APIRouter, status

from app.api.deps import AdminAccess, CategoryServiceDep
from app.schemas.category import CategoryCreate, CategoryRead

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=list[CategoryRead], summary="List categories with card counts")
def list_categories(service: CategoryServiceDep) -> list[CategoryRead]:
    return service.list_categories()


@router.post(
    "",
    response_model=CategoryRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a category",
)
def create_category(
    service: CategoryServiceDep, payload: CategoryCreate, _admin: AdminAccess
) -> CategoryRead:
    return service.create_category(payload)
