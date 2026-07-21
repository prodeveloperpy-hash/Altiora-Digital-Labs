"""FAQ endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Path, status

from app.api.deps import FaqServiceDep
from app.schemas.faq import FaqCreate, FaqRead, FaqUpdate

router = APIRouter(prefix="/faqs", tags=["FAQs"])


@router.get("", response_model=list[FaqRead], summary="List FAQs")
def list_faqs(service: FaqServiceDep) -> list[FaqRead]:
    return service.list_faqs()


@router.post(
    "",
    response_model=FaqRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create an FAQ",
)
def create_faq(service: FaqServiceDep, payload: FaqCreate) -> FaqRead:
    return service.create_faq(payload)


@router.patch("/{faq_id}", response_model=FaqRead, summary="Update an FAQ")
def update_faq(
    service: FaqServiceDep,
    faq_id: Annotated[str, Path(description="FAQ id")],
    payload: FaqUpdate,
) -> FaqRead:
    return service.update_faq(faq_id, payload)


@router.delete(
    "/{faq_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an FAQ",
)
def delete_faq(
    service: FaqServiceDep,
    faq_id: Annotated[str, Path(description="FAQ id")],
):
    service.delete_faq(faq_id)
    return None
