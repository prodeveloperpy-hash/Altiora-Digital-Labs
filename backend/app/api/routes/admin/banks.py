"""Admin bank (issuer) management: full CRUD."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Path, Query, status

from app.api.admin_deps import (
    ActivityServiceDep,
    BankServiceDep,
    CurrentAdmin,
    RequireAdmin,
)
from app.schemas.bank import BankCreate, BankRead, BankUpdate

router = APIRouter(prefix="/banks", tags=["Admin · Banks"])


@router.get("", response_model=list[BankRead], summary="List banks")
def list_banks(
    _current: CurrentAdmin,
    service: BankServiceDep,
    search: Annotated[str | None, Query(description="Search by name or slug")] = None,
) -> list[BankRead]:
    return service.list_banks(search)


@router.get("/{bank_id}", response_model=BankRead, summary="Get a bank")
def get_bank(
    _current: CurrentAdmin,
    service: BankServiceDep,
    bank_id: Annotated[str, Path(description="Bank id or slug")],
) -> BankRead:
    return service.get_bank(bank_id)


@router.post(
    "", response_model=BankRead, status_code=status.HTTP_201_CREATED, summary="Create a bank"
)
def create_bank(
    current: CurrentAdmin,
    service: BankServiceDep,
    activity: ActivityServiceDep,
    payload: BankCreate,
) -> BankRead:
    bank = service.create_bank(payload)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="created",
        entity_type="bank",
        entity_id=bank.id,
        summary=f"Created bank “{bank.name}”.",
    )
    return bank


@router.patch("/{bank_id}", response_model=BankRead, summary="Update a bank")
def update_bank(
    current: CurrentAdmin,
    service: BankServiceDep,
    activity: ActivityServiceDep,
    bank_id: Annotated[str, Path(description="Bank id or slug")],
    payload: BankUpdate,
) -> BankRead:
    bank = service.update_bank(bank_id, payload)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="updated",
        entity_type="bank",
        entity_id=bank.id,
        summary=f"Updated bank “{bank.name}”.",
    )
    return bank


@router.delete("/{bank_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a bank")
def delete_bank(
    current: RequireAdmin,
    service: BankServiceDep,
    activity: ActivityServiceDep,
    bank_id: Annotated[str, Path(description="Bank id or slug")],
):
    bank = service.get_bank(bank_id)
    service.delete_bank(bank_id)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="deleted",
        entity_type="bank",
        entity_id=bank.id,
        summary=f"Deleted bank “{bank.name}”.",
    )
    return None
