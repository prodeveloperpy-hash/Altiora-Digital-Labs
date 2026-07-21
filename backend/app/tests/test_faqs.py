"""FAQ endpoint tests."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_list_faqs(client: TestClient) -> None:
    response = client.get("/api/faqs")
    assert response.status_code == 200
    faqs = response.json()
    assert len(faqs) >= 1
    for faq in faqs:
        assert set(faq) >= {"id", "question", "answer", "category"}


def test_faq_crud(client: TestClient) -> None:
    created = client.post(
        "/api/faqs",
        json={"question": "Is this a test?", "answer": "Yes.", "category": "Testing"},
    )
    assert created.status_code == 201
    faq_id = created.json()["id"]

    updated = client.patch(f"/api/faqs/{faq_id}", json={"answer": "Absolutely."})
    assert updated.status_code == 200
    assert updated.json()["answer"] == "Absolutely."

    deleted = client.delete(f"/api/faqs/{faq_id}")
    assert deleted.status_code == 204

    assert client.patch(f"/api/faqs/{faq_id}", json={"answer": "x"}).status_code == 404
