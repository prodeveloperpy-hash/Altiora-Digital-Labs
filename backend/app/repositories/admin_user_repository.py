"""Data access for admin users and their refresh tokens."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.admin_user import AdminUser
from app.models.refresh_token import RefreshToken


class AdminUserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    # --- Admin users -----------------------------------------------------
    def get(self, user_id: str) -> AdminUser | None:
        return self.db.get(AdminUser, user_id)

    def get_by_login(self, identifier: str) -> AdminUser | None:
        """Look up an admin by username or email (case-insensitive)."""
        normalized = identifier.strip().lower()
        stmt = select(AdminUser).where(
            or_(
                func.lower(AdminUser.username) == normalized,
                func.lower(AdminUser.email) == normalized,
            )
        )
        return self.db.execute(stmt).scalars().first()

    def count(self) -> int:
        return int(self.db.execute(select(func.count(AdminUser.id))).scalar_one())

    def add(self, user: AdminUser) -> AdminUser:
        self.db.add(user)
        self.db.flush()
        return user

    # --- Refresh tokens --------------------------------------------------
    def add_refresh_token(self, token: RefreshToken) -> RefreshToken:
        self.db.add(token)
        self.db.flush()
        return token

    def get_refresh_token(self, jti: str) -> RefreshToken | None:
        return self.db.get(RefreshToken, jti)

    def revoke_all_for_user(self, user_id: str) -> None:
        now = datetime.now(tz=UTC)
        stmt = select(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked_at.is_(None),
        )
        for token in self.db.execute(stmt).scalars().all():
            token.revoked_at = now
        self.db.flush()
