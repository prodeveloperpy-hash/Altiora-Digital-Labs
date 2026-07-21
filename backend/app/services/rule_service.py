"""Business logic for recommendation rules.

Rules are the data the engine loads at request time; validating operators here
keeps the admin panel from writing rows the engine cannot evaluate.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.rule import RecommendationRule
from app.models.scoring import ScoringWeight
from app.recommendation_engine.operators import (
    CARD_FIELDS,
    SCORING_OPERATORS,
    available_operators,
)
from app.repositories.rule_repository import RuleRepository
from app.schemas.rule import OperatorCatalog, RuleCreate, RuleRead, RuleUpdate


class RuleService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = RuleRepository(db)

    def list_rules(
        self,
        *,
        search: str | None = None,
        outcome: str | None = None,
        is_active: bool | None = None,
    ) -> list[RuleRead]:
        rules = self.repo.list(search=search, outcome=outcome, is_active=is_active)
        return [RuleRead.model_validate(rule) for rule in rules]

    def get_rule(self, rule_id: int) -> RuleRead:
        rule = self.repo.get(rule_id)
        if rule is None:
            raise NotFoundError(f"Rule '{rule_id}' was not found.")
        return RuleRead.model_validate(rule)

    def catalog(self) -> OperatorCatalog:
        ops = available_operators()
        weight_keys = self._weight_keys()
        return OperatorCatalog(
            scoring=ops["scoring"],
            eligibility=ops["eligibility"],
            card_fields=sorted(CARD_FIELDS.keys()),
            weight_keys=weight_keys,
        )

    def create_rule(self, payload: RuleCreate) -> RuleRead:
        self._validate_operator(payload.operator)
        rule = RecommendationRule(**payload.model_dump())
        try:
            self.repo.add(rule)
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError(f"A rule with code '{payload.code}' already exists.") from exc
        self.db.refresh(rule)
        return RuleRead.model_validate(rule)

    def update_rule(self, rule_id: int, payload: RuleUpdate) -> RuleRead:
        rule = self.repo.get(rule_id)
        if rule is None:
            raise NotFoundError(f"Rule '{rule_id}' was not found.")
        data = payload.model_dump(exclude_unset=True)
        if "operator" in data and data["operator"] is not None:
            self._validate_operator(data["operator"])
        for field, value in data.items():
            setattr(rule, field, value)
        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError("Could not update rule due to a conflicting value.") from exc
        self.db.refresh(rule)
        return RuleRead.model_validate(rule)

    def delete_rule(self, rule_id: int) -> None:
        rule = self.repo.get(rule_id)
        if rule is None:
            raise NotFoundError(f"Rule '{rule_id}' was not found.")
        self.repo.delete(rule)
        self.db.commit()

    def _validate_operator(self, operator: str) -> None:
        if operator not in SCORING_OPERATORS:
            raise ValidationError(
                "Unknown scoring operator.",
                errors={"operator": f"Must be one of: {', '.join(sorted(SCORING_OPERATORS))}"},
            )

    def _weight_keys(self) -> list[str]:
        stmt = select(ScoringWeight.key).order_by(ScoringWeight.key)
        return list(self.db.execute(stmt).scalars().all())
