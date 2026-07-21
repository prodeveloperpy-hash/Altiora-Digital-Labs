"""Business logic for categories."""

from __future__ import annotations

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.exceptions import ConflictError, NotFoundError
from app.models.category import Category
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate


class CategoryService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = CategoryRepository(db)

    def list_categories(self) -> list[CategoryRead]:
        categories = self.repo.list()
        counts = self.repo.active_card_counts()
        result: list[CategoryRead] = []
        for category in categories:
            result.append(
                CategoryRead(
                    id=category.id,
                    slug=category.slug,
                    name=category.name,
                    description=category.description,
                    card_count=counts.get(category.id, 0),
                )
            )
        return result

    def create_category(self, payload: CategoryCreate) -> CategoryRead:
        category = Category(
            id=payload.slug,
            slug=payload.slug,
            name=payload.name,
            description=payload.description,
        )
        try:
            self.repo.add(category)
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError(f"Category '{payload.slug}' already exists.") from exc
        return CategoryRead(
            id=category.id,
            slug=category.slug,
            name=category.name,
            description=category.description,
            card_count=0,
        )

    def update_category(self, slug: str, payload: CategoryUpdate) -> CategoryRead:
        category = self.repo.get_by_slug(slug)
        if category is None:
            raise NotFoundError(f"Category '{slug}' was not found.")
        data = payload.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(category, field, value)
        self.db.commit()
        self.db.refresh(category)
        counts = self.repo.active_card_counts()
        return CategoryRead(
            id=category.id,
            slug=category.slug,
            name=category.name,
            description=category.description,
            card_count=counts.get(category.id, 0),
        )

    def delete_category(self, slug: str) -> None:
        category = self.repo.get_by_slug(slug)
        if category is None:
            raise NotFoundError(f"Category '{slug}' was not found.")
        # The card_category association rows are removed via ON DELETE CASCADE.
        self.repo.delete(category)
        self.db.commit()
