"""Audit trail of administrative actions, surfaced as dashboard recent activity."""

from __future__ import annotations

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin


class ActivityLog(Base, TimestampMixin):
    __tablename__ = "activity_logs"

    # Integer PK gives a natural, monotonic ordering for "recent activity".
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # Human-readable identity of the actor (admin username or email).
    actor: Mapped[str] = mapped_column(String(120), default="system", nullable=False)
    actor_id: Mapped[str | None] = mapped_column(String(32), index=True, nullable=True)
    # "created" | "updated" | "deleted" | "published" | "unpublished" | "login" | "logout".
    action: Mapped[str] = mapped_column(String(32), nullable=False)
    # The resource kind, e.g. "card", "bank", "question", "rule".
    entity_type: Mapped[str] = mapped_column(String(48), index=True, nullable=False)
    entity_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    summary: Mapped[str] = mapped_column(String(400), default="", nullable=False)
