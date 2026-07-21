"""Authentication: login, token refresh (with rotation), logout, and lookup.

Access tokens are short-lived and stateless. Refresh tokens are persisted by
their ``jti`` so they can be rotated on use and revoked on logout, giving proper
server-side session invalidation on top of JWTs.
"""

from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.config import settings
from app.core.security import (
    TOKEN_TYPE_REFRESH,
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from app.exceptions import AppError
from app.models.admin_user import AdminUser
from app.models.refresh_token import RefreshToken
from app.repositories.admin_user_repository import AdminUserRepository
from app.schemas.auth import AdminUserRead, LoginResponse


def _unauthorized(message: str = "Invalid credentials.") -> AppError:
    return AppError(message, status_code=401, code="unauthorized")


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = AdminUserRepository(db)

    # --- Login -----------------------------------------------------------
    def login(self, identifier: str, password: str, *, remember: bool) -> LoginResponse:
        user = self.repo.get_by_login(identifier)
        if user is None or not verify_password(password, user.hashed_password):
            raise _unauthorized()
        if not user.is_active:
            raise _unauthorized("This account has been deactivated.")

        user.last_login_at = datetime.now(tz=UTC)
        access, refresh = self._issue_pair(user, remember=remember)
        self.db.commit()
        self.db.refresh(user)
        return self._login_response(user, access, refresh)

    # --- Refresh ---------------------------------------------------------
    def refresh(self, refresh_token: str) -> LoginResponse:
        payload = self._decode_refresh(refresh_token)
        jti = str(payload.get("jti", ""))
        stored = self.repo.get_refresh_token(jti)
        if stored is None or stored.revoked_at is not None:
            raise _unauthorized("Session is no longer valid. Please sign in again.")
        if stored.expires_at.replace(tzinfo=stored.expires_at.tzinfo or UTC) < datetime.now(
            tz=UTC
        ):
            raise _unauthorized("Session has expired. Please sign in again.")

        user = self.repo.get(str(payload.get("sub", "")))
        if user is None or not user.is_active:
            raise _unauthorized("Account is unavailable.")

        # Rotate: revoke the used token and issue a fresh pair.
        stored.revoked_at = datetime.now(tz=UTC)
        # Preserve "remember" longevity by comparing the token's remaining life.
        lifetime_days = (stored.expires_at - stored.created_at).days
        remember = lifetime_days >= settings.refresh_token_remember_days
        access, refresh = self._issue_pair(user, remember=remember)
        self.db.commit()
        self.db.refresh(user)
        return self._login_response(user, access, refresh)

    # --- Logout ----------------------------------------------------------
    def logout(self, user: AdminUser, refresh_token: str | None) -> None:
        if refresh_token:
            try:
                payload = self._decode_refresh(refresh_token)
                stored = self.repo.get_refresh_token(str(payload.get("jti", "")))
                if stored is not None and stored.user_id == user.id:
                    stored.revoked_at = datetime.now(tz=UTC)
            except AppError:
                # An invalid token on logout is a no-op — fall through to full revoke.
                pass
        # Revoke any remaining active sessions for this user for good measure.
        self.repo.revoke_all_for_user(user.id)
        self.db.commit()

    # --- Current user ----------------------------------------------------
    def get_active_user(self, user_id: str) -> AdminUser | None:
        user = self.repo.get(user_id)
        if user is None or not user.is_active:
            return None
        return user

    # --- Helpers ---------------------------------------------------------
    def _issue_pair(self, user: AdminUser, *, remember: bool) -> tuple[str, str]:
        access = create_access_token(user.id, role=user.role)
        refresh_token, jti, expires_at = create_refresh_token(user.id, remember=remember)
        self.repo.add_refresh_token(
            RefreshToken(jti=jti, user_id=user.id, expires_at=expires_at)
        )
        return access, refresh_token

    def _decode_refresh(self, token: str) -> dict[str, object]:
        try:
            payload = decode_token(token)
        except ValueError as exc:
            raise _unauthorized("Invalid session token.") from exc
        if payload.get("type") != TOKEN_TYPE_REFRESH:
            raise _unauthorized("Invalid session token.")
        return payload

    def _login_response(self, user: AdminUser, access: str, refresh: str) -> LoginResponse:
        return LoginResponse(
            access_token=access,
            refresh_token=refresh,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
            user=AdminUserRead.model_validate(user),
        )
