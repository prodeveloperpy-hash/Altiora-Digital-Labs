"""Persisted refresh tokens, enabling rotation and revocation (logout)."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.admin_user import AdminUser


class RefreshToken(Base, TimestampMixin):
    __tablename__ = "refresh_tokens"

    # The JWT's unique identifier (jti). Never stores the raw token.
    jti: Mapped[str] = mapped_column(String(32), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("admin_users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    # Set when the token is revoked (logout or rotation); NULL while active.
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["AdminUser"] = relationship(back_populates="refresh_tokens")
