"""PRD public API facade."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Response
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.exceptions import NotFoundError, ValidationError
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
    benefits: list[str] = Field(min_length=1, max_length=100)


class CompareRequest(BaseModel):
    ids: list[str] = Field(min_length=2, max_length=2)


FILTER_BENEFITS = [
    {"code": "cashback", "name": "Cashback"},
    {"code": "travel", "name": "Travel"},
    {"code": "lounge-access", "name": "Lounge Access"},
    {"code": "shopping", "name": "Shopping"},
    {"code": "fuel", "name": "Fuel"},
    {"code": "dining", "name": "Dining"},
    {"code": "insurance", "name": "Insurance"},
    {"code": "entertainment", "name": "Entertainment"},
    {"code": "forex", "name": "Forex"},
    {"code": "upi", "name": "UPI"},
]
QUESTIONNAIRE_CATEGORY_ORDER = [
    "Rewards", "Travel", "Shopping", "Lifestyle", "Digital Payments", "Fuel",
    "Insurance", "Fees", "Eligibility", "Reward Redemption", "Other Features",
]


@router.get("/banks", response_model=list[BankRead])
def banks(response: Response, db: Session = Depends(get_db)) -> list[BankRead]:
    response.headers["Cache-Control"] = "public, max-age=300"
    return BankService(db).list_banks()


@router.get("/cards", response_model=PaginatedResponse[CardRead])
def cards(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, alias="pageSize", ge=1, le=100),
    db: Session = Depends(get_db),
) -> PaginatedResponse[CardRead]:
    return CardService(db).list_cards(CardQuery(page=page, page_size=page_size))


@router.get("/cards/{card_id}", response_model=CardRead)
def card_details(card_id: str, db: Session = Depends(get_db)) -> CardRead:
    return CardService(db).get_card(card_id)


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
def filters(response: Response, db: Session = Depends(get_db)) -> dict:
    response.headers["Cache-Control"] = "public, max-age=300"
    banks = db.execute(select(Bank).where(Bank.is_active.is_(True)).order_by(Bank.name)).scalars()
    return {
        "banks": [
            {
                "slug": b.slug,
                "name": "American Express" if b.slug == "american-express-india" else b.name,
            }
            for b in banks
        ],
        "fees": [
            {"code": "lifetime-free", "name": "Lifetime Free"},
            {"code": "no-joining-fee", "name": "No Joining Fee"},
            {"code": "low-annual-fee", "name": "Low Annual Fee"},
        ],
        "benefits": FILTER_BENEFITS,
    }


@router.get("/questionnaire")
def questionnaire(response: Response, db: Session = Depends(get_db)) -> dict:
    """Database-driven grouped questionnaire; weights remain server-side."""
    response.headers["Cache-Control"] = "public, max-age=300"
    benefits = db.execute(
        select(Benefit).order_by(Benefit.category, Benefit.name)
    ).scalars()
    grouped = _group_benefits(benefits)
    return {
        "categories": [
            {"name": category, "benefits": grouped.get(category, [])}
            for category in QUESTIONNAIRE_CATEGORY_ORDER
        ]
    }


def _group_benefits(benefits) -> dict[str, list[dict[str, str]]]:
    grouped: dict[str, list[dict[str, str]]] = {}
    for benefit in benefits:
        grouped.setdefault(benefit.category, []).append(
            {"code": benefit.code, "name": benefit.name, "description": benefit.description}
        )
    return grouped


@router.post("/recommend")
def recommend(payload: BenefitSelection, db: Session = Depends(get_db)) -> dict:
    selected = list(dict.fromkeys(payload.benefits))
    cards = CardRepository(db).get_all_active()
    weights = {
        b.code: b.weight
        for b in db.execute(select(Benefit).where(Benefit.code.in_(selected))).scalars()
    }
    unknown = [code for code in selected if code not in weights]
    if unknown:
        raise ValidationError(
            "One or more selected benefits are invalid.",
            errors={"benefits": f"Unknown benefit codes: {', '.join(unknown)}"},
        )
    ranked = []
    for card in cards:
        card_codes = set(card.benefit_codes)
        matched = [code for code in selected if code in card_codes]
        missing = [code for code in selected if code not in card_codes]
        score = sum(weights.get(code, 0) for code in matched)
        coverage = round(100 * len(matched) / len(selected)) if selected else 0
        ranked.append((card, matched, missing, score, coverage))
    # PRD 8.4 exact priority: score, matched count, coverage, annual fee,
    # joining fee, numeric reward rate, then alphabetical card name.
    ranked.sort(key=lambda x: (
        -x[3], -len(x[1]), -x[4], x[0].annual_fee, x[0].joining_fee,
        -max((rate.rate for rate in x[0].reward_rates), default=0),
        x[0].name.casefold(),
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
    return {"recommendations": items, "selectedCount": len(selected)}


@router.post("/compare", response_model=list[CardRead])
def compare(payload: CompareRequest, db: Session = Depends(get_db)) -> list[CardRead]:
    cards = CardService(db).compare(payload.ids)
    if len(cards) != 2:
        raise NotFoundError("One or more selected cards were not found.")
    return cards
