"""Admin card management: full CRUD plus publish/unpublish."""

from __future__ import annotations

from typing import Annotated, Literal

from fastapi import APIRouter, Path, Query, status

from app.api.admin_deps import (
    ActivityServiceDep,
    AdminCardServiceDep,
    CurrentAdmin,
    RequireAdmin,
)
from app.repositories.card_repository import CardQuery
from app.schemas.card import AdminCardRead, CardCreate, CardUpdate
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/cards", tags=["Admin · Cards"])

SortField = Literal["recommended", "rating", "annualFee", "apr", "name"]
Direction = Literal["asc", "desc"]


@router.get("", response_model=PaginatedResponse[AdminCardRead], summary="List cards (admin)")
def list_cards(
    _current: CurrentAdmin,
    service: AdminCardServiceDep,
    search: Annotated[str | None, Query(description="Free-text search")] = None,
    category: Annotated[str | None, Query(description="Filter by category slug")] = None,
    network: Annotated[str | None, Query(description="Filter by card network")] = None,
    sort: Annotated[SortField, Query(description="Sort field")] = "name",
    direction: Annotated[Direction | None, Query(description="Sort direction")] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 20,
) -> PaginatedResponse[AdminCardRead]:
    query = CardQuery(
        search=search,
        category=category,
        network=network,
        sort=sort,
        direction=direction,
        page=page,
        page_size=page_size,
        include_inactive=True,
    )
    return service.admin_list_cards(query)


@router.get("/{card_id}", response_model=AdminCardRead, summary="Get a card (admin)")
def get_card(
    _current: CurrentAdmin,
    service: AdminCardServiceDep,
    card_id: Annotated[str, Path(description="Card id or slug")],
) -> AdminCardRead:
    return service.admin_get_card(card_id)


@router.post(
    "",
    response_model=AdminCardRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a card",
)
def create_card(
    current: CurrentAdmin,
    service: AdminCardServiceDep,
    activity: ActivityServiceDep,
    payload: CardCreate,
) -> AdminCardRead:
    card = service.admin_create_card(payload)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="created",
        entity_type="card",
        entity_id=card.id,
        summary=f"Created card “{card.name}”.",
    )
    return card


@router.patch("/{card_id}", response_model=AdminCardRead, summary="Update a card")
def update_card(
    current: CurrentAdmin,
    service: AdminCardServiceDep,
    activity: ActivityServiceDep,
    card_id: Annotated[str, Path(description="Card id or slug")],
    payload: CardUpdate,
) -> AdminCardRead:
    card = service.admin_update_card(card_id, payload)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="updated",
        entity_type="card",
        entity_id=card.id,
        summary=f"Updated card “{card.name}”.",
    )
    return card


@router.post("/{card_id}/publish", response_model=AdminCardRead, summary="Publish a card")
def publish_card(
    current: CurrentAdmin,
    service: AdminCardServiceDep,
    activity: ActivityServiceDep,
    card_id: Annotated[str, Path(description="Card id or slug")],
) -> AdminCardRead:
    card = service.set_active(card_id, True)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="published",
        entity_type="card",
        entity_id=card.id,
        summary=f"Published card “{card.name}”.",
    )
    return card


@router.post("/{card_id}/unpublish", response_model=AdminCardRead, summary="Unpublish a card")
def unpublish_card(
    current: CurrentAdmin,
    service: AdminCardServiceDep,
    activity: ActivityServiceDep,
    card_id: Annotated[str, Path(description="Card id or slug")],
) -> AdminCardRead:
    card = service.set_active(card_id, False)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="unpublished",
        entity_type="card",
        entity_id=card.id,
        summary=f"Unpublished card “{card.name}”.",
    )
    return card


@router.delete(
    "/{card_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a card",
)
def delete_card(
    current: RequireAdmin,
    service: AdminCardServiceDep,
    activity: ActivityServiceDep,
    card_id: Annotated[str, Path(description="Card id or slug")],
):
    card = service.admin_get_card(card_id)
    service.delete_card(card_id)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="deleted",
        entity_type="card",
        entity_id=card.id,
        summary=f"Deleted card “{card.name}”.",
    )
    return None
