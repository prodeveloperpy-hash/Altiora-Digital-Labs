"""Rate limiting middleware tests."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_rate_limit_headers_present(rate_limited_client: TestClient) -> None:
    response = rate_limited_client.get("/api/cards")
    assert response.status_code == 200
    assert response.headers["X-RateLimit-Limit"] == "5"
    assert "X-RateLimit-Remaining" in response.headers


def test_rate_limit_blocks_after_limit(rate_limited_client: TestClient) -> None:
    statuses = [rate_limited_client.get("/api/cards").status_code for _ in range(8)]
    # First 5 allowed, subsequent requests blocked within the window.
    assert statuses[:5] == [200, 200, 200, 200, 200]
    assert 429 in statuses

    blocked = rate_limited_client.get("/api/cards")
    assert blocked.status_code == 429
    assert blocked.json()["code"] == "rate_limited"
    assert "Retry-After" in blocked.headers


def test_health_is_not_rate_limited(rate_limited_client: TestClient) -> None:
    # Exceed the limit, then confirm health still responds.
    for _ in range(8):
        rate_limited_client.get("/api/cards")
    assert rate_limited_client.get("/health").status_code == 200
