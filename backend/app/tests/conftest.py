"""Shared pytest fixtures.

Tests run against an isolated in-memory SQLite database, seeded once per session
with the same reference data used in production. The `get_db` dependency is
overridden so the API uses the test session instead of the configured database.
"""

from __future__ import annotations

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401 - register models on Base.metadata
from app.config import settings
from app.database.base import Base
from app.database.seed import seed
from app.database.session import get_db
from app.main import create_app


@pytest.fixture(scope="session")
def engine():
    # A shared in-memory database (StaticPool keeps a single connection alive).
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=test_engine)
    return test_engine


@pytest.fixture(scope="session")
def session_factory(engine):
    return sessionmaker(
        bind=engine, autoflush=False, autocommit=False, expire_on_commit=False
    )


@pytest.fixture(scope="session", autouse=True)
def _seed_data(session_factory) -> None:
    db: Session = session_factory()
    try:
        seed(db)
    finally:
        db.close()


def _build_client(session_factory, *, rate_limit: bool) -> TestClient:
    # Disable app-managed schema/seed side effects during tests.
    settings.auto_create_tables = False
    settings.auto_seed = False
    settings.rate_limit_enabled = rate_limit

    application = create_app()

    def override_get_db() -> Iterator[Session]:
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    application.dependency_overrides[get_db] = override_get_db
    return TestClient(application)


@pytest.fixture
def client(session_factory) -> Iterator[TestClient]:
    with _build_client(session_factory, rate_limit=False) as test_client:
        yield test_client


@pytest.fixture
def rate_limited_client(session_factory) -> Iterator[TestClient]:
    settings.rate_limit_requests = 5
    settings.rate_limit_window_seconds = 60
    with _build_client(session_factory, rate_limit=True) as test_client:
        yield test_client
    # Restore defaults for any later tests.
    settings.rate_limit_requests = 100
    settings.rate_limit_enabled = False
