"""Data access for credit cards: search, filter, sort, pagination, and CRUD."""

from __future__ import annotations

from dataclasses import dataclass, field

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.card import CreditCard
from app.models.category import Category


@dataclass
class CardQuery:
    """Normalized query parameters for listing cards."""

    search: str | None = None
    category: str | None = None
    network: str | None = None
    credit_score: str | None = None
    max_annual_fee: float | None = None
    no_annual_fee: bool = False
    sort: str = "recommended"
    direction: str | None = None
    page: int = 1
    page_size: int = 12
    include_inactive: bool = False


# Maps a sort field to (column, default_direction).
_SORT_COLUMNS: dict[str, tuple[object, str]] = {
    "rating": (CreditCard.rating, "desc"),
    "annualFee": (CreditCard.annual_fee, "asc"),
    "apr": (CreditCard.apr_min, "asc"),
    "name": (CreditCard.name, "asc"),
}


class CardRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    # --- Read ------------------------------------------------------------
    def _base_stmt(self, include_inactive: bool):
        stmt = select(CreditCard)
        if not include_inactive:
            stmt = stmt.where(CreditCard.is_active.is_(True))
        return stmt

    def _apply_filters(self, stmt, query: CardQuery):
        if query.search:
            term = f"%{query.search.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(CreditCard.name).like(term),
                    func.lower(CreditCard.issuer).like(term),
                    func.lower(CreditCard.summary).like(term),
                    func.lower(CreditCard.description).like(term),
                )
            )
        if query.category:
            stmt = stmt.where(
                CreditCard.categories.any(Category.slug == query.category)
            )
        if query.network:
            stmt = stmt.where(CreditCard.network == query.network)
        if query.credit_score:
            stmt = stmt.where(CreditCard.recommended_credit_score == query.credit_score)
        if query.max_annual_fee is not None:
            stmt = stmt.where(CreditCard.annual_fee <= query.max_annual_fee)
        if query.no_annual_fee:
            stmt = stmt.where(CreditCard.annual_fee <= 0)
        return stmt

    def _apply_sort(self, stmt, query: CardQuery):
        if query.sort == "recommended":
            # Curated default: highest rated, most reviewed, featured first.
            return stmt.order_by(
                CreditCard.is_featured.desc(),
                CreditCard.rating.desc(),
                CreditCard.review_count.desc(),
            )
        column, default_dir = _SORT_COLUMNS.get(query.sort, _SORT_COLUMNS["rating"])
        direction = query.direction or default_dir
        ordering = column.asc() if direction == "asc" else column.desc()
        # Stable secondary ordering by name to keep pagination deterministic.
        return stmt.order_by(ordering, CreditCard.name.asc())

    def list(self, query: CardQuery) -> tuple[list[CreditCard], int]:
        stmt = self._apply_filters(self._base_stmt(query.include_inactive), query)

        count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
        total = self.db.execute(count_stmt).scalar_one()

        stmt = self._apply_sort(stmt, query)
        offset = (query.page - 1) * query.page_size
        stmt = stmt.offset(offset).limit(query.page_size)

        items = list(self.db.execute(stmt).scalars().unique().all())
        return items, int(total)

    def get_by_id_or_slug(self, identifier: str) -> CreditCard | None:
        stmt = select(CreditCard).where(
            or_(CreditCard.id == identifier, CreditCard.slug == identifier)
        )
        return self.db.execute(stmt).scalars().first()

    def get_by_ids(self, ids: list[str]) -> list[CreditCard]:
        if not ids:
            return []
        stmt = select(CreditCard).where(
            or_(CreditCard.id.in_(ids), CreditCard.slug.in_(ids))
        )
        found = list(self.db.execute(stmt).scalars().unique().all())
        # Preserve the caller's requested order.
        by_key: dict[str, CreditCard] = {}
        for card in found:
            by_key[card.id] = card
            by_key[card.slug] = card
        ordered: list[CreditCard] = []
        seen: set[str] = set()
        for identifier in ids:
            card = by_key.get(identifier)
            if card and card.id not in seen:
                ordered.append(card)
                seen.add(card.id)
        return ordered

    def get_featured(self, limit: int = 6) -> list[CreditCard]:
        stmt = (
            self._base_stmt(include_inactive=False)
            .where(CreditCard.is_featured.is_(True))
            .order_by(CreditCard.rating.desc(), CreditCard.review_count.desc())
            .limit(limit)
        )
        return list(self.db.execute(stmt).scalars().unique().all())

    def get_all_active(self) -> list[CreditCard]:
        stmt = self._base_stmt(include_inactive=False)
        return list(self.db.execute(stmt).scalars().unique().all())

    # --- Write -----------------------------------------------------------
    def add(self, card: CreditCard) -> CreditCard:
        self.db.add(card)
        self.db.flush()
        return card

    def delete(self, card: CreditCard) -> None:
        self.db.delete(card)
        self.db.flush()

    def resolve_categories(self, slugs: list[str]) -> list[Category]:
        if not slugs:
            return []
        stmt = select(Category).where(Category.slug.in_(slugs))
        return list(self.db.execute(stmt).scalars().all())
