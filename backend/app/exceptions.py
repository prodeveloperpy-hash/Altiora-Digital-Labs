"""Application-level exceptions mapped to consistent HTTP error responses."""

from __future__ import annotations


class AppError(Exception):
    """Base class for expected, HTTP-mappable application errors."""

    status_code: int = 400
    code: str = "error"

    def __init__(
        self,
        message: str,
        *,
        status_code: int | None = None,
        code: str | None = None,
        errors: dict[str, str] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        if code is not None:
            self.code = code
        self.errors = errors


class NotFoundError(AppError):
    status_code = 404
    code = "not_found"


class ConflictError(AppError):
    status_code = 409
    code = "conflict"


class ValidationError(AppError):
    status_code = 422
    code = "validation_error"
