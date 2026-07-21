"""Security primitives for admin authentication.

Two concerns live here and nowhere else:
- Password hashing/verification via bcrypt (passlib).
- Stateless JWT creation/decoding for access and refresh tokens.

Refresh tokens carry a unique ``jti`` so they can be tracked and revoked in the
database (see ``app.models.refresh_token``); access tokens are short-lived and
purely stateless.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

# bcrypt has a 72-byte input limit; passlib truncates transparently and we also
# guard against absurdly long inputs in the service layer.
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

TOKEN_TYPE_ACCESS = "access"
TOKEN_TYPE_REFRESH = "refresh"


# --- Password hashing ----------------------------------------------------
def hash_password(plain_password: str) -> str:
    """Return a bcrypt hash for the given plaintext password."""
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True when the plaintext matches the stored bcrypt hash."""
    try:
        return _pwd_context.verify(plain_password, hashed_password)
    except ValueError:
        # Malformed hash — treat as a failed verification rather than crashing.
        return False


# --- Token helpers -------------------------------------------------------
def _now() -> datetime:
    return datetime.now(tz=UTC)


def _encode(payload: dict[str, Any], expires_delta: timedelta) -> str:
    to_encode = dict(payload)
    issued_at = _now()
    to_encode.update({"iat": issued_at, "exp": issued_at + expires_delta})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_access_token(subject: str, *, role: str) -> str:
    """Create a short-lived access token for the given admin subject (id)."""
    return _encode(
        {"sub": subject, "role": role, "type": TOKEN_TYPE_ACCESS},
        timedelta(minutes=settings.access_token_expire_minutes),
    )


def create_refresh_token(subject: str, *, remember: bool = False) -> tuple[str, str, datetime]:
    """Create a refresh token.

    Returns a tuple of ``(token, jti, expires_at)`` so the caller can persist the
    jti for later revocation.
    """
    jti = uuid.uuid4().hex
    days = settings.refresh_token_remember_days if remember else settings.refresh_token_expire_days
    expires_delta = timedelta(days=days)
    expires_at = _now() + expires_delta
    token = _encode(
        {"sub": subject, "jti": jti, "type": TOKEN_TYPE_REFRESH},
        expires_delta,
    )
    return token, jti, expires_at


def decode_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT, raising ``ValueError`` on any failure."""
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:  # noqa: PERF203 - narrow, explicit conversion
        raise ValueError("Invalid or expired token.") from exc
