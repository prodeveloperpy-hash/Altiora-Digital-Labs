"""Admin category management: full CRUD."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Path, status

from app.api.admin_deps import (
    ActivityServiceDep,
    AdminCategoryServiceDep,
    CurrentAdmin,
    RequireAdmin,
)
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["Admin · Categories"])


@router.get("", response_model=list[CategoryRead], summary="List categories")
def list_categories(_current: CurrentAdmin, service: AdminCategoryServiceDep) -> list[CategoryRead]:
    return service.list_categories()


@router.post(
    "",
    response_model=CategoryRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a category",
)
def create_category(
    current: CurrentAdmin,
    service: AdminCategoryServiceDep,
    activity: ActivityServiceDep,
    payload: CategoryCreate,
) -> CategoryRead:
    category = service.create_category(payload)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="created",
        entity_type="category",
        entity_id=category.id,
        summary=f"Created category “{category.name}”.",
    )
    return category


@router.patch("/{slug}", response_model=CategoryRead, summary="Update a category")
def update_category(
    current: CurrentAdmin,
    service: AdminCategoryServiceDep,
    activity: ActivityServiceDep,
    slug: Annotated[str, Path(description="Category slug")],
    payload: CategoryUpdate,
) -> CategoryRead:
    category = service.update_category(slug, payload)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="updated",
        entity_type="category",
        entity_id=category.id,
        summary=f"Updated category “{category.name}”.",
    )
    return category


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a category")
def delete_category(
    current: RequireAdmin,
    service: AdminCategoryServiceDep,
    activity: ActivityServiceDep,
    slug: Annotated[str, Path(description="Category slug")],
):
    service.delete_category(slug)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="deleted",
        entity_type="category",
        entity_id=slug,
        summary=f"Deleted category “{slug}”.",
    )
    return None
