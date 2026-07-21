"""Data access for banks (issuers)."""

from __future__ import annotations

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.bank import Bank
from app.models.card import CreditCard


class BankRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list(self, search: str | None = None) -> list[Bank]:
        stmt = select(Bank).order_by(Bank.name.asc())
        if search:
            term = f"%{search.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(Bank.name).like(term),
                    func.lower(Bank.slug).like(term),
                )
            )
        return list(self.db.execute(stmt).scalars().all())

    def get_by_id_or_slug(self, identifier: str) -> Bank | None:
        stmt = select(Bank).where(or_(Bank.id == identifier, Bank.slug == identifier))
        return self.db.execute(stmt).scalars().first()

    def card_counts(self) -> dict[str, int]:
        """Mapping of bank id -> total number of cards issued by that bank."""
        stmt = (
            select(CreditCard.bank_id, func.count(CreditCard.id))
            .where(CreditCard.bank_id.is_not(None))
            .group_by(CreditCard.bank_id)
        )
        return {row[0]: int(row[1]) for row in self.db.execute(stmt).all()}

    def add(self, bank: Bank) -> Bank:
        self.db.add(bank)
        self.db.flush()
        return bank

    def delete(self, bank: Bank) -> None:
        self.db.delete(bank)
        self.db.flush()
