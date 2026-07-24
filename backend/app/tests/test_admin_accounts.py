"""Administrator account-management API coverage."""

from app.config import settings
from app.core.security import hash_password
from app.models.admin_user import AdminUser


def _login(client, identifier: str, password: str) -> dict[str, str]:
    response = client.post(
        "/api/admin/auth/login",
        json={"username": identifier, "password": password, "remember": False},
    )
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['accessToken']}"}


def test_super_admin_can_create_reset_and_delete_admin(client, session_factory) -> None:
    with session_factory() as db:
        db.add(
            AdminUser(
                email=settings.default_admin_email,
                username=settings.default_admin_username,
                hashed_password=hash_password(settings.default_admin_password),
                full_name="Test Super Admin",
                role="super_admin",
                is_active=True,
            )
        )
        db.commit()

    headers = _login(
        client,
        settings.default_admin_username,
        settings.default_admin_password,
    )

    created = client.post(
        "/api/admin/auth/admins",
        headers=headers,
        json={"email": "second-admin@example.com", "password": "InitialPass123!"},
    )
    assert created.status_code == 201
    admin_id = created.json()["id"]

    listed = client.get("/api/admin/auth/admins", headers=headers)
    assert listed.status_code == 200
    assert any(admin["id"] == admin_id for admin in listed.json())

    reset = client.patch(
        f"/api/admin/auth/admins/{admin_id}/password",
        headers=headers,
        json={"password": "UpdatedPass123!"},
    )
    assert reset.status_code == 200

    second_headers = _login(client, "second-admin@example.com", "UpdatedPass123!")
    forbidden = client.get("/api/admin/auth/admins", headers=second_headers)
    assert forbidden.status_code == 403

    deleted = client.delete(f"/api/admin/auth/admins/{admin_id}", headers=headers)
    assert deleted.status_code == 204

    current = client.get("/api/admin/auth/me", headers=headers).json()
    last_delete = client.delete(
        f"/api/admin/auth/admins/{current['id']}",
        headers=headers,
    )
    assert last_delete.status_code == 422
    assert "last administrator" in last_delete.json()["message"].lower()
