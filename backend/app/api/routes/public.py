"""PRD public API facade."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.bank import Bank
from app.models.benefit import Benefit
from app.models.card import CreditCard
from app.repositories.card_repository import CardQuery, CardRepository
from app.schemas.bank import BankRead
from app.schemas.card import CardRead
from app.schemas.common import PaginatedResponse
from app.services.bank_service import BankService
from app.services.card_service import CardService

router = APIRouter(tags=["Public"])


class BenefitSelection(BaseModel):
    benefits: list[str] = Field(default_factory=list, max_length=100)


class CompareRequest(BaseModel):
    ids: list[str] = Field(min_length=1, max_length=10)


@router.get("/banks", response_model=list[BankRead])
def banks(db: Session = Depends(get_db)) -> list[BankRead]:
    return BankService(db).list_banks()


@router.get("/search", response_model=PaginatedResponse[CardRead])
def search(
    q: str | None = None,
    bank: str | None = None,
    fee: str | None = None,
    benefits: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(12, alias="pageSize", ge=1, le=100),
    db: Session = Depends(get_db),
) -> PaginatedResponse[CardRead]:
    return CardService(db).list_cards(CardQuery(
        search=q, bank=bank, fee=fee,
        benefits=[x.strip() for x in benefits.split(",") if x.strip()] if benefits else [],
        page=page, page_size=page_size,
    ))


@router.get("/filters")
def filters(db: Session = Depends(get_db)) -> dict:
    banks = db.execute(select(Bank).where(Bank.is_active.is_(True)).order_by(Bank.name)).scalars()
    benefits = db.execute(select(Benefit).order_by(Benefit.category, Benefit.name)).scalars()
    benefit_rows = [
        {"code": b.code, "name": b.name, "category": b.category, "weight": b.weight}
        for b in benefits
    ]
    return {
        "banks": [{"slug": b.slug, "name": b.name} for b in banks],
        "fees": [
            {"code": "lifetime-free", "name": "Lifetime Free"},
            {"code": "no-joining-fee", "name": "No Joining Fee"},
            {"code": "low-annual-fee", "name": "Low Annual Fee"},
        ],
        "benefits": benefit_rows,
    }


@router.post("/recommend")
def recommend(payload: BenefitSelection, db: Session = Depends(get_db)) -> dict:
    selected = list(dict.fromkeys(payload.benefits))
    cards = CardRepository(db).get_all_active()
    weights = {
        b.code: b.weight
        for b in db.execute(select(Benefit).where(Benefit.code.in_(selected))).scalars()
    }
    total_weight = sum(weights.values())
    ranked = []
    for card in cards:
        card_codes = set(card.benefit_codes)
        matched = [code for code in selected if code in card_codes]
        missing = [code for code in selected if code not in card_codes]
        score = sum(weights.get(code, 0) for code in matched)
        coverage = round(100 * len(matched) / len(selected)) if selected else 0
        ranked.append((card, matched, missing, score, coverage))
    # PRD tie breakers: weighted score, coverage, lower joining fee, lower annual
    # fee, higher benefit count, higher reward rate text, then alphabetical.
    ranked.sort(key=lambda x: (
        -x[3], -x[4], x[0].joining_fee, x[0].annual_fee,
        -len(x[0].benefit_codes), x[0].reward_rate.lower(), x[0].name.lower(),
    ))
    items = []
    names = {
        b.code: b.name
        for b in db.execute(select(Benefit).where(Benefit.code.in_(selected))).scalars()
    }
    for rank, (card, matched, missing, score, coverage) in enumerate(ranked[:5], 1):
        matched_names = [names.get(code, code) for code in matched]
        items.append({
            "card": CardRead.model_validate(card).model_dump(by_alias=True),
            "ranking": rank,
            "score": score,
            "matchPercentage": coverage,
            "matchedBenefits": matched_names,
            "missingBenefits": [names.get(code, code) for code in missing],
            "explanation": (
                f"Matched {', '.join(matched_names)}." if matched_names
                else "This card did not match any selected benefits."
            ),
        })
    return {"recommendations": items, "selectedCount": len(selected), "totalWeight": total_weight}


@router.post("/compare", response_model=list[CardRead])
def compare(payload: CompareRequest, db: Session = Depends(get_db)) -> list[CardRead]:
    return CardService(db).compare(payload.ids)
