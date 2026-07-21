"""Business logic for credit cards."""

from __future__ import annotations

import math

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.card import CreditCard
from app.models.reward_rate import RewardRate
from app.repositories.card_repository import CardQuery, CardRepository
from app.schemas.card import CardCreate, CardRead, CardUpdate
from app.schemas.common import PaginatedResponse


class CardService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = CardRepository(db)

    def list_cards(self, query: CardQuery) -> PaginatedResponse[CardRead]:
        items, total = self.repo.list(query)
        total_pages = math.ceil(total / query.page_size) if query.page_size else 0
        return PaginatedResponse[CardRead](
            items=[CardRead.model_validate(card) for card in items],
            page=query.page,
            page_size=query.page_size,
            total=total,
            total_pages=total_pages,
        )

    def get_card(self, identifier: str) -> CardRead:
        card = self.repo.get_by_id_or_slug(identifier)
        if card is None:
            raise NotFoundError(f"Card '{identifier}' was not found.")
        return CardRead.model_validate(card)

    def get_featured(self, limit: int = 6) -> list[CardRead]:
        return [CardRead.model_validate(card) for card in self.repo.get_featured(limit)]

    def compare(self, ids: list[str]) -> list[CardRead]:
        return [CardRead.model_validate(card) for card in self.repo.get_by_ids(ids)]

    def create_card(self, payload: CardCreate) -> CardRead:
        card = CreditCard(
            slug=payload.slug,
            name=payload.name,
            issuer=payload.issuer,
            network=payload.network,
            image_url=payload.image_url,
            summary=payload.summary,
            description=payload.description,
            annual_fee=payload.annual_fee,
            apr_min=payload.apr_min,
            apr_max=payload.apr_max,
            intro_apr=payload.intro_apr,
            intro_apr_months=payload.intro_apr_months,
            foreign_transaction_fee=payload.foreign_transaction_fee,
            recommended_credit_score=payload.recommended_credit_score,
            rewards_summary=payload.rewards_summary,
            rewards_currency=payload.rewards_currency,
            signup_bonus=payload.signup_bonus,
            signup_bonus_value=payload.signup_bonus_value,
            benefits=payload.benefits,
            pros=payload.pros,
            cons=payload.cons,
            rating=payload.rating,
            review_count=payload.review_count,
            apply_url=payload.apply_url,
            is_featured=payload.is_featured,
            is_active=payload.is_active,
        )
        card.categories = self._resolve_categories(payload.categories)
        card.reward_rates = [
            RewardRate(
                category=rate.category, rate=rate.rate, unit=rate.unit, cap=rate.cap, position=i
            )
            for i, rate in enumerate(payload.reward_rates)
        ]
        try:
            self.repo.add(card)
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError(f"A card with slug '{payload.slug}' already exists.") from exc
        self.db.refresh(card)
        return CardRead.model_validate(card)

    def update_card(self, identifier: str, payload: CardUpdate) -> CardRead:
        card = self.repo.get_by_id_or_slug(identifier)
        if card is None:
            raise NotFoundError(f"Card '{identifier}' was not found.")

        data = payload.model_dump(exclude_unset=True)

        if "categories" in data:
            card.categories = self._resolve_categories(data.pop("categories") or [])
        if "reward_rates" in data:
            rates = data.pop("reward_rates") or []
            card.reward_rates = [
                RewardRate(
                    category=rate["category"],
                    rate=rate["rate"],
                    unit=rate.get("unit", "percent"),
                    cap=rate.get("cap"),
                    position=i,
                )
                for i, rate in enumerate(rates)
            ]

        for field, value in data.items():
            setattr(card, field, value)

        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError("Could not update card due to a conflicting value.") from exc
        self.db.refresh(card)
        return CardRead.model_validate(card)

    def delete_card(self, identifier: str) -> None:
        card = self.repo.get_by_id_or_slug(identifier)
        if card is None:
            raise NotFoundError(f"Card '{identifier}' was not found.")
        self.repo.delete(card)
        self.db.commit()

    def _resolve_categories(self, slugs: list[str]):
        categories = self.repo.resolve_categories(slugs)
        found = {category.slug for category in categories}
        missing = sorted(set(slugs) - found)
        if missing:
            raise ValidationError(
                "One or more categories do not exist.",
                errors={"categories": f"Unknown category slugs: {', '.join(missing)}"},
            )
        return categories
