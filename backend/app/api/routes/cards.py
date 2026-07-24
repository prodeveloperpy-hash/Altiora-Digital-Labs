"""Credit card endpoints: search, filter, sort, pagination, and CRUD."""

from __future__ import annotations

from typing import Annotated, Literal

from fastapi import APIRouter, Path, Query, status

from app.api.deps import AdminAccess, CardServiceDep
from app.exceptions import ValidationError
from app.repositories.card_repository import CardQuery
from app.schemas.card import CardCreate, CardRead, CardUpdate
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/cards", tags=["Cards"])

SortField = Literal["recommended", "rating", "annualFee", "apr", "name"]
Direction = Literal["asc", "desc"]


@router.get(
    "",
    response_model=PaginatedResponse[CardRead],
    summary="List, search, filter, and sort credit cards",
)
def list_cards(
    service: CardServiceDep,
    search: Annotated[str | None, Query(description="Free-text search")] = None,
    category: Annotated[str | None, Query(description="Filter by category slug")] = None,
    network: Annotated[str | None, Query(description="Filter by card network")] = None,
    credit_score: Annotated[
        str | None, Query(alias="creditScore", description="Filter by recommended credit tier")
    ] = None,
    max_annual_fee: Annotated[
        float | None, Query(alias="maxAnnualFee", ge=0, description="Maximum annual fee")
    ] = None,
    no_annual_fee: Annotated[
        bool, Query(alias="noAnnualFee", description="Only cards with no annual fee")
    ] = False,
    bank: Annotated[str | None, Query(description="Bank slug")] = None,
    fee: Annotated[str | None, Query(description="Fee preset")] = None,
    benefits: Annotated[str | None, Query(description="Comma-separated benefit codes")] = None,
    sort: Annotated[SortField, Query(description="Sort field")] = "recommended",
    direction: Annotated[Direction | None, Query(description="Sort direction")] = None,
    page: Annotated[int, Query(ge=1, description="1-indexed page number")] = 1,
    page_size: Annotated[
        int, Query(alias="pageSize", ge=1, le=100, description="Items per page")
    ] = 12,
) -> PaginatedResponse[CardRead]:
    query = CardQuery(
        search=search,
        category=category,
        network=network,
        credit_score=credit_score,
        max_annual_fee=max_annual_fee,
        no_annual_fee=no_annual_fee,
        bank=bank,
        fee=fee,
        benefits=[value.strip() for value in benefits.split(",") if value.strip()] if benefits else [],
        sort=sort,
        direction=direction,
        page=page,
        page_size=page_size,
    )
    return service.list_cards(query)


@router.get("/featured", response_model=list[CardRead], summary="Featured cards")
def featured_cards(
    service: CardServiceDep,
    limit: Annotated[int, Query(ge=1, le=24)] = 6,
) -> list[CardRead]:
    return service.get_featured(limit)


@router.get("/compare", response_model=list[CardRead], summary="Compare a set of cards")
def compare_cards(
    service: CardServiceDep,
    ids: Annotated[str, Query(description="Comma-separated card ids or slugs")],
) -> list[CardRead]:
    id_list = [item.strip() for item in ids.split(",") if item.strip()]
    if not id_list:
        raise ValidationError(
            "Provide at least one card id via the 'ids' query parameter.",
            errors={"ids": "This field is required."},
        )
    if len(id_list) > 10:
        raise ValidationError(
            "At most 10 cards can be compared at once.",
            errors={"ids": "Provide no more than 10 card ids."},
        )
    return service.compare(id_list)


@router.get("/{card_id}", response_model=CardRead, summary="Get a card by id or slug")
def get_card(
    service: CardServiceDep,
    card_id: Annotated[str, Path(description="Card id or slug")],
) -> CardRead:
    return service.get_card(card_id)


@router.post(
    "",
    response_model=CardRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a card",
)
def create_card(service: CardServiceDep, payload: CardCreate, _admin: AdminAccess) -> CardRead:
    return service.create_card(payload)


@router.patch("/{card_id}", response_model=CardRead, summary="Partially update a card")
def update_card(
    service: CardServiceDep,
    card_id: Annotated[str, Path(description="Card id or slug")],
    payload: CardUpdate,
    _admin: AdminAccess,
) -> CardRead:
    return service.update_card(card_id, payload)


@router.delete(
    "/{card_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a card",
)
def delete_card(
    service: CardServiceDep,
    card_id: Annotated[str, Path(description="Card id or slug")],
    _admin: AdminAccess,
):
    service.delete_card(card_id)
    return None
