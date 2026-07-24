"""Credit card endpoint tests: listing, search, filter, sort, pagination, CRUD."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.config import settings


def test_list_cards_returns_paginated_camel_case(client: TestClient) -> None:
    response = client.get("/api/cards")
    assert response.status_code == 200
    body = response.json()

    assert set(body) >= {"items", "page", "pageSize", "total", "totalPages"}
    assert body["total"] >= 6
    assert len(body["items"]) > 0

    card = body["items"][0]
    # Contract fields (camelCase) the frontend depends on.
    for field in (
        "id",
        "slug",
        "name",
        "issuer",
        "network",
        "categories",
        "annualFee",
        "aprMin",
        "aprMax",
        "foreignTransactionFee",
        "recommendedCreditScore",
        "rewardsSummary",
        "rewardRates",
        "rating",
        "reviewCount",
        "applyUrl",
        "updatedAt",
    ):
        assert field in card, f"missing field: {field}"


def test_pagination(client: TestClient) -> None:
    response = client.get("/api/cards", params={"pageSize": 5, "page": 1})
    body = response.json()
    assert response.status_code == 200
    assert len(body["items"]) == 5
    assert body["page"] == 1
    assert body["pageSize"] == 5
    assert body["totalPages"] >= 2


def test_search_filters_results(client: TestClient) -> None:
    response = client.get("/api/cards", params={"search": "travel"})
    assert response.status_code == 200
    assert response.json()["total"] >= 1


def test_category_filter(client: TestClient) -> None:
    response = client.get("/api/cards", params={"category": "cashback"})
    assert response.status_code == 200
    items = response.json()["items"]
    assert items
    assert all("cashback" in card["categories"] for card in items)


def test_no_annual_fee_filter(client: TestClient) -> None:
    response = client.get("/api/cards", params={"noAnnualFee": "true"})
    assert response.status_code == 200
    assert all(card["annualFee"] == 0 for card in response.json()["items"])


def test_sort_by_annual_fee_ascending(client: TestClient) -> None:
    response = client.get(
        "/api/cards", params={"sort": "annualFee", "direction": "asc", "pageSize": 50}
    )
    fees = [card["annualFee"] for card in response.json()["items"]]
    assert fees == sorted(fees)


def test_featured_cards(client: TestClient) -> None:
    response = client.get("/api/cards/featured")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1


def test_get_card_by_slug(client: TestClient) -> None:
    response = client.get("/api/cards/hdfc-regalia-gold")
    assert response.status_code == 200
    assert response.json()["slug"] == "hdfc-regalia-gold"


def test_get_card_not_found_returns_error_body(client: TestClient) -> None:
    response = client.get("/api/cards/does-not-exist")
    assert response.status_code == 404
    body = response.json()
    assert "message" in body
    assert body["code"] == "not_found"


def test_compare_preserves_order(client: TestClient) -> None:
    ids = "axis-atlas,hdfc-regalia-gold"
    response = client.get("/api/cards/compare", params={"ids": ids})
    assert response.status_code == 200
    slugs = [card["slug"] for card in response.json()]
    assert slugs == ["axis-atlas", "hdfc-regalia-gold"]


def test_compare_requires_ids(client: TestClient) -> None:
    response = client.get("/api/cards/compare", params={"ids": ""})
    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"


def test_compare_rejects_unbounded_id_list(client: TestClient) -> None:
    response = client.get("/api/cards/compare", params={"ids": ",".join(str(i) for i in range(11))})
    assert response.status_code == 422


def test_search_treats_wildcards_as_literal_text(client: TestClient) -> None:
    response = client.get("/api/cards", params={"search": "%"})
    unfiltered = client.get("/api/cards")
    assert response.status_code == 200
    assert response.json()["total"] < unfiltered.json()["total"]


def test_card_crud_lifecycle(client: TestClient) -> None:
    payload = {
        "slug": "test-crud-card",
        "name": "Test CRUD Card",
        "issuer": "Test Bank",
        "network": "visa",
        "categories": ["cashback"],
        "summary": "A test card.",
        "annualFee": 0,
        "aprMin": 15.0,
        "aprMax": 25.0,
        "foreignTransactionFee": 0,
        "recommendedCreditScore": "good",
        "rewardsSummary": "1% cash back",
        "rewardRates": [{"category": "all purchases", "rate": 1.0, "unit": "percent"}],
        "rating": 4.0,
        "reviewCount": 10,
        "applyUrl": "https://example.com/apply",
    }

    created = client.post("/api/cards", json=payload)
    assert created.status_code == 201
    card = created.json()
    assert card["slug"] == "test-crud-card"
    assert card["categories"] == ["cashback"]
    card_id = card["id"]

    # Duplicate slug -> conflict.
    conflict = client.post("/api/cards", json=payload)
    assert conflict.status_code == 409

    # Read back.
    fetched = client.get(f"/api/cards/{card_id}")
    assert fetched.status_code == 200

    # Update.
    updated = client.patch(f"/api/cards/{card_id}", json={"name": "Renamed Card"})
    assert updated.status_code == 200
    assert updated.json()["name"] == "Renamed Card"

    # Delete.
    deleted = client.delete(f"/api/cards/{card_id}")
    assert deleted.status_code == 204

    # Gone.
    assert client.get(f"/api/cards/{card_id}").status_code == 404


def test_list_categories_with_counts(client: TestClient) -> None:
    response = client.get("/api/categories")
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) >= 1
    cashback = next(c for c in categories if c["slug"] == "cashback")
    assert cashback["cardCount"] >= 1


def test_unknown_category_is_rejected(client: TestClient) -> None:
    payload = {
        "slug": "invalid-category-card",
        "name": "Invalid Category Card",
        "issuer": "Test Bank",
        "network": "visa",
        "categories": ["does-not-exist"],
    }
    response = client.post("/api/cards", json=payload)
    assert response.status_code == 422
    assert "categories" in response.json()["errors"]


def test_mutations_require_configured_admin_key(client: TestClient) -> None:
    previous = settings.admin_api_key
    settings.admin_api_key = "test-secret"
    try:
        denied = client.post(
            "/api/categories", json={"slug": "protected", "name": "Protected"}
        )
        allowed = client.post(
            "/api/categories",
            json={"slug": "protected", "name": "Protected"},
            headers={"X-API-Key": "test-secret"},
        )
    finally:
        settings.admin_api_key = previous

    assert denied.status_code == 401
    assert denied.json()["code"] == "unauthorized"
    assert allowed.status_code == 201
