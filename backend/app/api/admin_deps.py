"""Admin authentication & authorization dependencies (JWT bearer tokens)."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.api.deps import DbSession
from app.core.security import TOKEN_TYPE_ACCESS, decode_token
from app.exceptions import AppError
from app.models.admin_user import ADMIN_ROLES, AdminUser
from app.services.activity_service import ActivityService
from app.services.auth_service import AuthService
from app.services.bank_service import BankService
from app.services.card_service import CardService
from app.services.category_service import CategoryService
from app.services.dashboard_service import DashboardService
from app.services.question_service import QuestionService
from app.services.rule_service import RuleService
from app.services.setting_service import SettingService
from app.services.upload_service import UploadService

# Roles ordered most → least privileged; lower index == more privilege.
_ROLE_RANK: dict[str, int] = {role: index for index, role in enumerate(ADMIN_ROLES)}

# auto_error=False so we can return the app's consistent error envelope.
_bearer = HTTPBearer(auto_error=False, description="Admin JWT access token")


def _unauthorized(message: str = "Authentication is required.") -> AppError:
    return AppError(message, status_code=401, code="unauthorized")


def get_current_admin(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)] = None,
) -> AdminUser:
    if credentials is None or not credentials.credentials:
        raise _unauthorized()
    try:
        payload = decode_token(credentials.credentials)
    except ValueError as exc:
        raise _unauthorized("Invalid or expired token.") from exc
    if payload.get("type") != TOKEN_TYPE_ACCESS:
        raise _unauthorized("Invalid token type.")

    user_id = str(payload.get("sub", ""))
    user = AuthService(db).get_active_user(user_id)
    if user is None:
        raise _unauthorized("Account is unavailable.")
    return user


CurrentAdmin = Annotated[AdminUser, Depends(get_current_admin)]


def require_min_role(minimum: str):
    """Dependency factory enforcing a minimum role for a route."""
    required_rank = _ROLE_RANK[minimum]

    def _dependency(current: CurrentAdmin) -> AdminUser:
        if _ROLE_RANK.get(current.role, len(ADMIN_ROLES)) > required_rank:
            raise AppError(
                "You do not have permission to perform this action.",
                status_code=403,
                code="forbidden",
            )
        return current

    return _dependency


# Common authorization tiers.
RequireAdmin = Annotated[AdminUser, Depends(require_min_role("admin"))]
RequireSuperAdmin = Annotated[AdminUser, Depends(require_min_role("super_admin"))]


# --- Service dependency providers ---------------------------------------
def get_auth_service(db: DbSession) -> AuthService:
    return AuthService(db)


def get_bank_service(db: DbSession) -> BankService:
    return BankService(db)


def get_rule_service(db: DbSession) -> RuleService:
    return RuleService(db)


def get_question_service(db: DbSession) -> QuestionService:
    return QuestionService(db)


def get_setting_service(db: DbSession) -> SettingService:
    return SettingService(db)


def get_dashboard_service(db: DbSession) -> DashboardService:
    return DashboardService(db)


def get_activity_service(db: DbSession) -> ActivityService:
    return ActivityService(db)


def get_admin_card_service(db: DbSession) -> CardService:
    return CardService(db)


def get_admin_category_service(db: DbSession) -> CategoryService:
    return CategoryService(db)


def get_upload_service() -> UploadService:
    return UploadService()


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]
BankServiceDep = Annotated[BankService, Depends(get_bank_service)]
RuleServiceDep = Annotated[RuleService, Depends(get_rule_service)]
QuestionServiceDep = Annotated[QuestionService, Depends(get_question_service)]
SettingServiceDep = Annotated[SettingService, Depends(get_setting_service)]
DashboardServiceDep = Annotated[DashboardService, Depends(get_dashboard_service)]
ActivityServiceDep = Annotated[ActivityService, Depends(get_activity_service)]
AdminCardServiceDep = Annotated[CardService, Depends(get_admin_card_service)]
AdminCategoryServiceDep = Annotated[CategoryService, Depends(get_admin_category_service)]
UploadServiceDep = Annotated[UploadService, Depends(get_upload_service)]
