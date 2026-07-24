"""Executable checks for unambiguous PRD sections 6–18."""

from fastapi.testclient import TestClient


def test_supported_banks_are_exact(client: TestClient) -> None:
    names = {bank["name"] for bank in client.get("/banks").json()}
    assert names == {
        "HDFC Bank", "SBI Card", "Axis Bank", "AU Small Finance Bank",
        "American Express India", "Bank of Baroda",
    }


def test_public_filter_catalog_is_exact_and_hides_weights(client: TestClient) -> None:
    response = client.get("/filters")
    assert response.status_code == 200
    body = response.json()
    assert [item["name"] for item in body["fees"]] == [
        "Lifetime Free", "No Joining Fee", "Low Annual Fee",
    ]
    assert [item["name"] for item in body["benefits"]] == [
        "Cashback", "Travel", "Lounge Access", "Shopping", "Fuel",
        "Dining", "Insurance", "Entertainment", "Forex", "UPI",
    ]
    assert all("weight" not in item for item in body["benefits"])


def test_questionnaire_has_exact_group_order(client: TestClient) -> None:
    body = client.get("/api/questionnaire").json()
    assert [group["name"] for group in body["categories"]] == [
        "Rewards", "Travel", "Shopping", "Lifestyle", "Digital Payments",
        "Fuel", "Insurance", "Fees", "Eligibility", "Reward Redemption",
        "Other Features",
    ]
    assert all(len(group["benefits"]) >= 2 for group in body["categories"])


def test_recommendation_validates_and_returns_top_five(client: TestClient) -> None:
    assert client.post("/recommend", json={"benefits": []}).status_code == 422
    assert client.post("/recommend", json={"benefits": ["not-real"]}).status_code == 422
    body = client.post(
        "/recommend",
        json={"benefits": ["cashback", "domestic-lounge"]},
    ).json()
    assert len(body["recommendations"]) == 5
    assert "totalWeight" not in body
    for item in body["recommendations"]:
        assert set(item) >= {
            "score", "matchPercentage", "matchedBenefits", "missingBenefits", "explanation",
        }


def test_compare_requires_exactly_two_cards(client: TestClient) -> None:
    assert client.post("/compare", json={"ids": ["hdfc-regalia-gold"]}).status_code == 422
    response = client.post(
        "/compare", json={"ids": ["hdfc-regalia-gold", "axis-atlas"]}
    )
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_literal_prd_api_paths_exist(client: TestClient) -> None:
    for path in ("/banks", "/cards", "/cards/hdfc-regalia-gold", "/search", "/filters"):
        assert client.get(path).status_code == 200
