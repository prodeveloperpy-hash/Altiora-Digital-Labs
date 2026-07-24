"""Business logic for credit cards."""

from __future__ import annotations

import math

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.card import CreditCard
from app.models.benefit import Benefit
from app.models.reward_rate import RewardRate
from app.repositories.card_repository import CardQuery, CardRepository
from app.schemas.card import AdminCardRead, CardCreate, CardRead, CardUpdate
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

    def admin_list_cards(self, query: CardQuery) -> PaginatedResponse[AdminCardRead]:
        """List cards for the admin panel, including inactive (unpublished) ones."""
        query.include_inactive = True
        items, total = self.repo.list(query)
        total_pages = math.ceil(total / query.page_size) if query.page_size else 0
        return PaginatedResponse[AdminCardRead](
            items=[AdminCardRead.model_validate(card) for card in items],
            page=query.page,
            page_size=query.page_size,
            total=total,
            total_pages=total_pages,
        )

    def admin_get_card(self, identifier: str) -> AdminCardRead:
        card = self.repo.get_by_id_or_slug(identifier)
        if card is None:
            raise NotFoundError(f"Card '{identifier}' was not found.")
        return AdminCardRead.model_validate(card)

    def admin_create_card(self, payload: CardCreate) -> AdminCardRead:
        created = self.create_card(payload)
        return self.admin_get_card(created.id)

    def admin_update_card(self, identifier: str, payload: CardUpdate) -> AdminCardRead:
        updated = self.update_card(identifier, payload)
        # Re-fetch by the stable id in case the slug was part of this update.
        return self.admin_get_card(updated.id)

    def set_active(self, identifier: str, is_active: bool) -> AdminCardRead:
        card = self.repo.get_by_id_or_slug(identifier)
        if card is None:
            raise NotFoundError(f"Card '{identifier}' was not found.")
        card.is_active = is_active
        self.db.commit()
        self.db.refresh(card)
        return AdminCardRead.model_validate(card)

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
            bank_id=payload.bank_id,
            image_url=payload.image_url,
            summary=payload.summary,
            description=payload.description,
            annual_fee=payload.annual_fee,
            card_type=payload.card_type,
            joining_fee=payload.joining_fee,
            fee_waiver=payload.fee_waiver,
            eligibility=payload.eligibility,
            income_requirement=payload.income_requirement,
            reward_rate=payload.reward_rate,
            reward_points=payload.reward_points,
            cashback_categories=payload.cashback_categories,
            lounge_domestic=payload.lounge_domestic,
            lounge_international=payload.lounge_international,
            insurance=payload.insurance,
            fuel=payload.fuel,
            dining=payload.dining,
            shopping=payload.shopping,
            travel=payload.travel,
            forex=payload.forex,
            upi=payload.upi,
            concierge=payload.concierge,
            golf=payload.golf,
            welcome_bonus=payload.welcome_bonus,
            renewal_benefits=payload.renewal_benefits,
            add_on_cards=payload.add_on_cards,
            emi_conversion=payload.emi_conversion,
            balance_transfer=payload.balance_transfer,
            merchant_offers=payload.merchant_offers,
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
            pros=payload.pros,
            cons=payload.cons,
            rating=payload.rating,
            review_count=payload.review_count,
            apply_url=payload.apply_url,
            is_featured=payload.is_featured,
            is_active=payload.is_active,
        )
        card.categories = self._resolve_categories(payload.categories)
        card.benefit_links = self._resolve_benefits(payload.benefit_codes)
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
        if "benefit_codes" in data:
            card.benefit_links = self._resolve_benefits(data.pop("benefit_codes") or [])
        # Legacy display-only input is superseded by normalized benefitCodes.
        data.pop("benefits", None)

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

    def _resolve_benefits(self, codes: list[str]) -> list[Benefit]:
        benefits = list(
            self.db.query(Benefit).filter(Benefit.code.in_(codes)).all()
        ) if codes else []
        found = {benefit.code for benefit in benefits}
        missing = sorted(set(codes) - found)
        if missing:
            raise ValidationError(
                "One or more benefits do not exist.",
                errors={"benefitCodes": f"Unknown benefit codes: {', '.join(missing)}"},
            )
        return benefits
