"""Exception handlers producing a consistent error body.

The response shape matches what the frontend's error normalizer expects:
``{ "message": str, "code": str, "errors"?: { field: message } }``.
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.exceptions import AppError

logger = logging.getLogger("cardwise.error")


def _body(message: str, code: str, errors: dict[str, str] | None = None) -> dict[str, object]:
    payload: dict[str, object] = {"message": message, "code": code}
    if errors:
        payload["errors"] = errors
    return payload


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(_request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=_body(exc.message, exc.code, exc.errors),
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        _request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        field_errors: dict[str, str] = {}
        for error in exc.errors():
            location = [str(part) for part in error.get("loc", []) if part not in ("body",)]
            field = location[-1] if location else "request"
            field_errors.setdefault(field, error.get("msg", "Invalid value"))
        return JSONResponse(
            status_code=422,
            content=_body(
                "Some of the information provided was invalid.",
                "validation_error",
                field_errors,
            ),
        )

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(
        _request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        message = exc.detail if isinstance(exc.detail, str) else "Request failed."
        return JSONResponse(
            status_code=exc.status_code,
            content=_body(message, f"http_{exc.status_code}"),
            headers=getattr(exc, "headers", None),
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(_request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled server error: %s", exc)
        return JSONResponse(
            status_code=500,
            content=_body(
                "The server ran into a problem. Please try again shortly.",
                "internal_error",
            ),
        )
