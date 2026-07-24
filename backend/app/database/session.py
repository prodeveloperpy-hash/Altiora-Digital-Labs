"""Database engine and session management."""

from __future__ import annotations

from collections.abc import Iterator

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool

from app.config import settings


def _make_engine() -> Engine:
    connect_args: dict[str, object] = {}
    pool_options: dict[str, object] = {}
    if settings.is_sqlite:
        # Required for SQLite when used across threads (FastAPI worker threads).
        connect_args["check_same_thread"] = False
        # File SQLite connections are cheap, and per-request connections avoid
        # pool starvation under FastAPI's sync dependency/threadpool lifecycle.
        if ":memory:" not in settings.database_url:
            pool_options = {"poolclass": NullPool}

    engine = create_engine(
        settings.database_url,
        connect_args=connect_args,
        pool_pre_ping=True,
        future=True,
        **pool_options,
    )

    if settings.is_sqlite:

        @event.listens_for(engine, "first_connect")
        def _set_sqlite_wal(dbapi_connection, _connection_record):  # noqa: ANN001
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.close()

        @event.listens_for(engine, "connect")
        def _set_sqlite_pragma(dbapi_connection, _connection_record):  # noqa: ANN001
            # Enforce foreign keys, which SQLite disables by default.
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA busy_timeout=5000")
            cursor.close()

    return engine


engine: Engine = _make_engine()

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
    future=True,
    class_=Session,
)


def get_db() -> Iterator[Session]:
    """FastAPI dependency that yields a scoped database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
