"""Business logic for banks (issuers)."""

from __future__ import annotations

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.exceptions import ConflictError, NotFoundError
from app.models.bank import Bank
from app.repositories.bank_repository import BankRepository
from app.schemas.bank import BankCreate, BankRead, BankUpdate


class BankService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = BankRepository(db)

    def _to_read(self, bank: Bank, counts: dict[str, int]) -> BankRead:
        return BankRead(
            id=bank.id,
            slug=bank.slug,
            name=bank.name,
            country=bank.country,
            website=bank.website,
            logo_url=bank.logo_url,
            description=bank.description,
            is_active=bank.is_active,
            card_count=counts.get(bank.id, 0),
            updated_at=bank.updated_at,
        )

    def list_banks(self, search: str | None = None) -> list[BankRead]:
        banks = self.repo.list(search)
        counts = self.repo.card_counts()
        return [self._to_read(bank, counts) for bank in banks]

    def get_bank(self, identifier: str) -> BankRead:
        bank = self.repo.get_by_id_or_slug(identifier)
        if bank is None:
            raise NotFoundError(f"Bank '{identifier}' was not found.")
        return self._to_read(bank, self.repo.card_counts())

    def create_bank(self, payload: BankCreate) -> BankRead:
        bank = Bank(
            id=payload.slug,
            slug=payload.slug,
            name=payload.name,
            country=payload.country,
            website=payload.website,
            logo_url=payload.logo_url,
            description=payload.description,
            is_active=payload.is_active,
        )
        try:
            self.repo.add(bank)
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError(f"Bank '{payload.slug}' already exists.") from exc
        self.db.refresh(bank)
        return self._to_read(bank, self.repo.card_counts())

    def update_bank(self, identifier: str, payload: BankUpdate) -> BankRead:
        bank = self.repo.get_by_id_or_slug(identifier)
        if bank is None:
            raise NotFoundError(f"Bank '{identifier}' was not found.")
        data = payload.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(bank, field, value)
        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError("Could not update bank due to a conflicting value.") from exc
        self.db.refresh(bank)
        return self._to_read(bank, self.repo.card_counts())

    def delete_bank(self, identifier: str) -> None:
        bank = self.repo.get_by_id_or_slug(identifier)
        if bank is None:
            raise NotFoundError(f"Bank '{identifier}' was not found.")
        # Cards keep existing but their bank link is cleared (FK ON DELETE SET NULL).
        self.repo.delete(bank)
        self.db.commit()
