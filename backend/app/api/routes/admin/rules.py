"""Admin recommendation-rule management — the engine's data-driven behavior.

Every row edited here is loaded by the recommendation engine at request time, so
changing recommendation behavior requires only these database updates.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Path, Query, status

from app.api.admin_deps import (
    ActivityServiceDep,
    CurrentAdmin,
    RequireAdmin,
    RuleServiceDep,
)
from app.schemas.rule import OperatorCatalog, RuleCreate, RuleRead, RuleUpdate

router = APIRouter(prefix="/recommendation-rules", tags=["Admin · Recommendation Rules"])


@router.get("", response_model=list[RuleRead], summary="List recommendation rules")
def list_rules(
    _current: CurrentAdmin,
    service: RuleServiceDep,
    search: Annotated[str | None, Query(description="Search by code/description/label")] = None,
    outcome: Annotated[str | None, Query(description="Filter by outcome")] = None,
    is_active: Annotated[bool | None, Query(alias="isActive")] = None,
) -> list[RuleRead]:
    return service.list_rules(search=search, outcome=outcome, is_active=is_active)


@router.get("/catalog", response_model=OperatorCatalog, summary="Operators, card fields, weights")
def catalog(_current: CurrentAdmin, service: RuleServiceDep) -> OperatorCatalog:
    return service.catalog()


@router.get("/{rule_id}", response_model=RuleRead, summary="Get a recommendation rule")
def get_rule(
    _current: CurrentAdmin,
    service: RuleServiceDep,
    rule_id: Annotated[int, Path(description="Rule id")],
) -> RuleRead:
    return service.get_rule(rule_id)


@router.post(
    "", response_model=RuleRead, status_code=status.HTTP_201_CREATED, summary="Create a rule"
)
def create_rule(
    current: CurrentAdmin,
    service: RuleServiceDep,
    activity: ActivityServiceDep,
    payload: RuleCreate,
) -> RuleRead:
    rule = service.create_rule(payload)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="created",
        entity_type="rule",
        entity_id=str(rule.id),
        summary=f"Created rule “{rule.code}”.",
    )
    return rule


@router.patch("/{rule_id}", response_model=RuleRead, summary="Update a rule")
def update_rule(
    current: CurrentAdmin,
    service: RuleServiceDep,
    activity: ActivityServiceDep,
    rule_id: Annotated[int, Path(description="Rule id")],
    payload: RuleUpdate,
) -> RuleRead:
    rule = service.update_rule(rule_id, payload)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="updated",
        entity_type="rule",
        entity_id=str(rule.id),
        summary=f"Updated rule “{rule.code}”.",
    )
    return rule


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a rule")
def delete_rule(
    current: RequireAdmin,
    service: RuleServiceDep,
    activity: ActivityServiceDep,
    rule_id: Annotated[int, Path(description="Rule id")],
):
    rule = service.get_rule(rule_id)
    service.delete_rule(rule_id)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="deleted",
        entity_type="rule",
        entity_id=str(rule.id),
        summary=f"Deleted rule “{rule.code}”.",
    )
    return None
