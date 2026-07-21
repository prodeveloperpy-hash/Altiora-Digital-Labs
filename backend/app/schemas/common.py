"""Shared schema base classes and generic response wrappers.

Two base classes separate concerns cleanly:
- `ResponseModel` reads from ORM objects by snake_case attribute name and
  serializes to camelCase (matching the frontend contract).
- `RequestModel` accepts camelCase input (via validation aliases) while exposing
  snake_case field names internally.
"""

from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import AliasGenerator, BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

T = TypeVar("T")


class ResponseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=AliasGenerator(serialization_alias=to_camel),
        populate_by_name=True,
        from_attributes=True,
    )


class RequestModel(BaseModel):
    # camelCase for both validation (incoming JSON) and serialization
    # (model_dump(by_alias=True)), the latter used to feed the engine.
    model_config = ConfigDict(
        alias_generator=AliasGenerator(validation_alias=to_camel, serialization_alias=to_camel),
        populate_by_name=True,
    )


class PaginatedResponse(ResponseModel, Generic[T]):
    """Standard paginated envelope returned by list endpoints."""

    items: list[T]
    page: int
    page_size: int
    total: int
    total_pages: int
