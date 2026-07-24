"""Admin authentication endpoints: login, refresh, logout, and current user."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.admin_deps import ActivityServiceDep, AuthServiceDep, CurrentAdmin, RequireSuperAdmin
from app.schemas.auth import (
    AdminAccountCreate,
    AdminPasswordUpdate,
    AdminProfileUpdate,
    AdminUserRead,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    RefreshRequest,
    TokenResponse,
)

router = APIRouter(prefix="/auth", tags=["Admin · Auth"])


@router.post("/login", response_model=LoginResponse, summary="Authenticate an administrator")
def login(
    payload: LoginRequest,
    auth: AuthServiceDep,
    activity: ActivityServiceDep,
) -> LoginResponse:
    result = auth.login(payload.username, payload.password, remember=payload.remember)
    activity.record(
        actor=result.user.username,
        actor_id=result.user.id,
        action="login",
        entity_type="session",
        summary=f"{result.user.username} signed in.",
    )
    return result


@router.post("/refresh", response_model=TokenResponse, summary="Exchange a refresh token")
def refresh(payload: RefreshRequest, auth: AuthServiceDep) -> TokenResponse:
    result = auth.refresh(payload.refresh_token)
    return TokenResponse(
        access_token=result.access_token,
        refresh_token=result.refresh_token,
        token_type=result.token_type,
        expires_in=result.expires_in,
    )


@router.post("/logout", summary="Sign out and revoke the current session")
def logout(
    payload: LogoutRequest,
    current: CurrentAdmin,
    auth: AuthServiceDep,
    activity: ActivityServiceDep,
) -> dict[str, str]:
    auth.logout(current, payload.refresh_token)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="logout",
        entity_type="session",
        summary=f"{current.username} signed out.",
    )
    return {"status": "ok"}


@router.get("/me", response_model=AdminUserRead, summary="Current authenticated administrator")
def me(current: CurrentAdmin) -> AdminUserRead:
    return AdminUserRead.model_validate(current)


@router.patch("/me", response_model=AdminUserRead, summary="Update current administrator")
def update_me(
    payload: AdminProfileUpdate,
    current: CurrentAdmin,
    auth: AuthServiceDep,
) -> AdminUserRead:
    return auth.update_profile(current, payload)


@router.get("/admins", response_model=list[AdminUserRead], summary="List administrators")
def list_admins(_: RequireSuperAdmin, auth: AuthServiceDep) -> list[AdminUserRead]:
    return auth.list_admins()


@router.post(
    "/admins",
    response_model=AdminUserRead,
    status_code=201,
    summary="Create administrator",
)
def create_admin(
    payload: AdminAccountCreate,
    current: RequireSuperAdmin,
    auth: AuthServiceDep,
    activity: ActivityServiceDep,
) -> AdminUserRead:
    result = auth.create_admin(payload)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="create",
        entity_type="admin_user",
        entity_id=result.id,
        summary=f"Created administrator {result.email}.",
    )
    return result


@router.patch(
    "/admins/{user_id}/password",
    response_model=AdminUserRead,
    summary="Reset administrator password",
)
def reset_admin_password(
    user_id: str,
    payload: AdminPasswordUpdate,
    current: RequireSuperAdmin,
    auth: AuthServiceDep,
    activity: ActivityServiceDep,
) -> AdminUserRead:
    result = auth.update_admin_password(user_id, payload.password)
    activity.record(
        actor=current.username,
        actor_id=current.id,
        action="update",
        entity_type="admin_user",
        entity_id=result.id,
        summary=f"Updated password for {result.email}.",
    )
    return result


@router.delete("/admins/{user_id}", status_code=204, summary="Delete administrator")
def delete_admin(user_id: str, current: RequireSuperAdmin, auth: AuthServiceDep):
    auth.delete_admin(user_id, actor_id=current.id)
