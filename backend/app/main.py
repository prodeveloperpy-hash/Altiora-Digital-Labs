"""FastAPI application factory and entrypoint."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.config import settings
from app.error_handlers import register_error_handlers
from app.logging_config import configure_logging
from app.middleware.logging import RequestLoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware

logger = logging.getLogger("cardwise")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Application startup/shutdown lifecycle."""
    configure_logging()
    logger.info(
        "Starting %s v%s (%s)", settings.app_name, settings.app_version, settings.environment
    )

    if settings.auto_create_tables:
        from app.database import Base, engine

        Base.metadata.create_all(bind=engine)
        logger.info("Ensured database schema exists")

    if settings.auto_seed:
        from app.database.seed import ensure_admin_seed, seed_if_empty

        seeded = seed_if_empty()
        if seeded:
            logger.info("Seeded reference data")

        # Provision the default administrator, settings, and starter
        # questionnaire. Idempotent and independent of reference-data seeding so
        # existing databases gain the admin module without a reset.
        if ensure_admin_seed():
            logger.info("Provisioned admin module data (admin user / settings / questions)")

    yield
    logger.info("Shutting down %s", settings.app_name)


def create_app() -> FastAPI:
    configure_logging()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "CardWise API — a database-driven credit card recommendation service. "
            "All recommendation scoring is derived from database rule tables; there is "
            "no hardcoded scoring logic."
        ),
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # --- Middleware (added outermost-first) ------------------------------
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(
        RateLimitMiddleware,
        limit=settings.rate_limit_requests,
        window_seconds=settings.rate_limit_window_seconds,
        enabled=settings.rate_limit_enabled,
        trust_proxy_headers=settings.trust_proxy_headers,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=[
            "Accept",
            "Authorization",
            "Content-Type",
            "X-API-Key",
            "X-Request-ID",
        ],
        expose_headers=["X-Request-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
    )

    # --- Error handlers --------------------------------------------------
    register_error_handlers(app)

    # --- Routes ----------------------------------------------------------
    # API routes live under the configured prefix (default "/api").
    app.include_router(api_router, prefix=settings.api_prefix)

    # Serve uploaded admin assets (card art, bank logos) as static files.
    upload_path = Path(settings.upload_dir)
    upload_path.mkdir(parents=True, exist_ok=True)
    app.mount(
        settings.upload_url_prefix,
        StaticFiles(directory=str(upload_path)),
        name="uploads",
    )

    @app.middleware("http")
    async def security_headers(request, call_next):  # noqa: ANN001
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault(
            "Permissions-Policy", "camera=(), microphone=(), geolocation=()"
        )
        return response

    @app.get("/", include_in_schema=False)
    async def root() -> RedirectResponse:
        return RedirectResponse(url="/docs")

    @app.get("/health", tags=["Health"], summary="Liveness probe")
    async def liveness() -> dict[str, str]:
        """Lightweight liveness probe (no database dependency)."""
        return {"status": "ok", "service": settings.app_name}

    return app


app = create_app()
