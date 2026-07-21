"""Authentication and admin-user schemas."""

from __future__ import annotations

import re
from datetime import datetime
from typing import Annotated, Literal

from pydantic import AfterValidator, Field

from app.models.admin_user import ADMIN_ROLES
from app.schemas.common import RequestModel, ResponseModel

AdminRole = Literal["super_admin", "admin", "editor"]

assert set(ADMIN_ROLES) == set(AdminRole.__args__)  # keep model/schema roles in lockstep

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _validate_email(value: str) -> str:
    normalized = value.strip().lower()
    if not _EMAIL_RE.match(normalized):
        raise ValueError("A valid email address is required.")
    return normalized


# A validated, normalized email address without the email-validator dependency.
EmailStr = Annotated[str, Field(max_length=255), AfterValidator(_validate_email)]


class LoginRequest(RequestModel):
    # Accepts either a username or an email in the same field.
    username: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1, max_length=128)
    remember: bool = False


class RefreshRequest(RequestModel):
    refresh_token: str = Field(min_length=1)


class LogoutRequest(RequestModel):
    refresh_token: str | None = None


class TokenResponse(ResponseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # access-token lifetime in seconds


class AdminUserRead(ResponseModel):
    id: str
    email: str
    username: str
    full_name: str
    role: str
    is_active: bool
    last_login_at: datetime | None = None
    created_at: datetime


class AdminUserCreate(RequestModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(default="", max_length=120)
    role: AdminRole = "admin"
    is_active: bool = True


class AdminUserUpdate(RequestModel):
    email: EmailStr | None = None
    username: str | None = Field(default=None, min_length=3, max_length=64)
    password: str | None = Field(default=None, min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=120)
    role: AdminRole | None = None
    is_active: bool | None = None


class LoginResponse(ResponseModel):
    """Full login payload: tokens plus the authenticated user."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: AdminUserRead
