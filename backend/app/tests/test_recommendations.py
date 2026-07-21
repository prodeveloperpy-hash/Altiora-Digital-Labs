"""Recommendation engine tests (database-driven scoring)."""

from __future__ import annotations

from fastapi.testclient import TestClient

BASE_ANSWERS = {
    "primaryGoal": "travel",
    "creditScore": "excellent",
    "monthlySpend": 2500,
    "spendingCategories": ["travel", "dining"],
    "maxAnnualFee": 200,
    "travelsInternationally": True,
    "carriesBalance": False,
    "rewardPreference": "miles",
}


def test_recommendations_shape_and_scoring(client: TestClient) -> None:
    response = client.post("/api/recommendations", json=BASE_ANSWERS)
    assert response.status_code == 200
    body = response.json()

    assert set(body) >= {"recommendations", "evaluatedCount", "sessionId"}
    assert body["evaluatedCount"] >= 12
    recommendations = body["recommendations"]
    assert len(recommendations) > 0

    top = recommendations[0]
    # Normalized so the best match scores 100.
    assert top["matchScore"] == 100
    assert top["overallScore"] == 100
    assert top["ranking"] == 1
    assert top["highlight"] == "Best overall match"
    assert isinstance(top["reasons"], list) and len(top["reasons"]) > 0
    assert "card" in top and "name" in top["card"]

    # The rich, explained output required of the engine.
    assert isinstance(top["matchedBenefits"], list) and len(top["matchedBenefits"]) > 0
    assert {"code", "name", "detail"} <= set(top["matchedBenefits"][0])
    assert isinstance(top["pros"], list) and len(top["pros"]) > 0
    assert isinstance(top["cons"], list)
    assert set(top["eligibility"]) >= {"eligible", "passed", "failed"}

    # Scores are bounded and monotonically non-increasing (results are ranked).
    scores = [rec["overallScore"] for rec in recommendations]
    assert all(0 <= s <= 100 for s in scores)
    assert scores == sorted(scores, reverse=True)
    # Ranking is dense and 1-based.
    assert [rec["ranking"] for rec in recommendations] == list(range(1, len(recommendations) + 1))


def test_recommendations_report_eligibility(client: TestClient) -> None:
    # A building-credit applicant is ineligible for excellent-credit cards; those
    # cards must be reported as ineligible and ranked below eligible ones.
    answers = {**BASE_ANSWERS, "primaryGoal": "secured", "creditScore": "building"}
    body = client.post("/api/recommendations", json=answers).json()
    eligible_flags = [rec["eligibility"]["eligible"] for rec in body["recommendations"]]
    # Eligible cards come first (sorted eligible-first).
    assert eligible_flags == sorted(eligible_flags, reverse=True)
    assert body["recommendations"][0]["eligibility"]["eligible"] is True


def test_recommendations_reflect_goal(client: TestClient) -> None:
    response = client.post("/api/recommendations", json=BASE_ANSWERS)
    recommendations = response.json()["recommendations"]
    # The database rules weight the primary goal heavily, so a travel card
    # should surface at the very top for a travel-focused profile.
    assert "travel" in recommendations[0]["card"]["categories"]


def test_recommendations_change_with_answers(client: TestClient) -> None:
    """Different answers must yield different top matches — proving the engine
    is data-driven rather than returning a fixed order."""
    travel = client.post("/api/recommendations", json=BASE_ANSWERS).json()
    student_answers = {
        **BASE_ANSWERS,
        "primaryGoal": "student",
        "creditScore": "fair",
        "rewardPreference": "cashback",
        "travelsInternationally": False,
    }
    student = client.post("/api/recommendations", json=student_answers).json()

    assert travel["recommendations"][0]["card"]["slug"] != student["recommendations"][0][
        "card"
    ]["slug"]


def test_recommendations_reasons_have_labels(client: TestClient) -> None:
    response = client.post("/api/recommendations", json=BASE_ANSWERS)
    for reason in response.json()["recommendations"][0]["reasons"]:
        assert reason["label"]
        assert reason["detail"]


def test_recommendations_validation_error(client: TestClient) -> None:
    bad = {**BASE_ANSWERS, "primaryGoal": "not-a-real-goal"}
    response = client.post("/api/recommendations", json=bad)
    assert response.status_code == 422
    body = response.json()
    assert body["code"] == "validation_error"
    assert "errors" in body
