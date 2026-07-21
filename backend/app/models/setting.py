"""Application settings, stored as editable key/value rows.

Each setting is a single row keyed by a stable string. Values are stored as JSON
so scalars (app name, threshold) and structured values (ranking weights) share
one table and are fully editable from the admin panel.
"""

from __future__ import annotations

from typing import Any

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.database.base import Base, TimestampMixin


class Setting(Base, TimestampMixin):
    __tablename__ = "settings"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[Any] = mapped_column(JSON, nullable=True)
    label: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    description: Mapped[str] = mapped_column(String(400), default="", nullable=False)
    # Hint for the admin UI: "text" | "number" | "select" | "json" | "color".
    value_type: Mapped[str] = mapped_column(String(24), default="text", nullable=False)
