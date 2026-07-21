"""Central logging configuration."""

from __future__ import annotations

import logging
from logging.config import dictConfig

from app.config import settings


def configure_logging() -> None:
    """Configure application-wide logging in a single, idempotent place."""
    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
                    "datefmt": "%Y-%m-%d %H:%M:%S",
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "default",
                    "stream": "ext://sys.stdout",
                },
            },
            "loggers": {
                "cardwise": {
                    "handlers": ["console"],
                    "level": settings.log_level,
                    "propagate": False,
                },
                "uvicorn.error": {"level": settings.log_level},
                "uvicorn.access": {"level": settings.log_level},
            },
            "root": {
                "handlers": ["console"],
                "level": settings.log_level,
            },
        }
    )


logger = logging.getLogger("cardwise")
