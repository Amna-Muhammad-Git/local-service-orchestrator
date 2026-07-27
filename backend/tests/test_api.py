from __future__ import annotations

import sqlite3
from pathlib import Path

import httpx
import pytest


PROJECT_ROOT = Path(__file__).resolve().parents[2]


@pytest.fixture()
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture()
async def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> httpx.AsyncClient:
    database_file = tmp_path / "test.db"
    connection = sqlite3.connect(database_file)
    connection.executescript((PROJECT_ROOT / "database" / "schema.sql").read_text())
    connection.executescript((PROJECT_ROOT / "database" / "seed_data.sql").read_text())
    monkeypatch.setenv("DATABASE_PATH", str(database_file))
    monkeypatch.setenv("SECRET_KEY", "test-only-secret-key-at-least-32-bytes")

    from backend.auth import hash_password

    connection.executemany(
        "UPDATE users SET password_hash = ? WHERE user_id = ?",
        [
            (hash_password("amna-password"), 1),
            (hash_password("bilal-password"), 2),
            (hash_password("sara-password"), 3),
        ],
    )
    connection.commit()
    connection.close()

    from backend.main import app

    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as test_client:
        yield test_client


async def authenticate(client: httpx.AsyncClient, email: str, password: str) -> dict[str, str]:
    response = await client.post("/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


@pytest.mark.anyio
async def test_register_hashes_password_and_login_works(client: httpx.AsyncClient) -> None:
    response = await client.post(
        "/register",
        json={"name": "New User", "email": "new@example.com", "password": "secure-pass"},
    )
    assert response.status_code == 201
    assert "password" not in response.json()

    headers = await authenticate(client, "new@example.com", "secure-pass")
    assert headers["Authorization"].startswith("Bearer ")


@pytest.mark.anyio
async def test_duplicate_registration_and_invalid_login_are_rejected(client: httpx.AsyncClient) -> None:
    duplicate = await client.post(
        "/register",
        json={"name": "Duplicate", "email": "amna@example.com", "password": "secure-pass"},
    )
    assert duplicate.status_code == 409

    invalid = await client.post(
        "/login",
        json={"email": "amna@example.com", "password": "wrong-password"},
    )
    assert invalid.status_code == 401


@pytest.mark.anyio
async def test_booking_routes_require_authentication(client: httpx.AsyncClient) -> None:
    assert (await client.get("/bookings")).status_code == 401


@pytest.mark.anyio
async def test_user_can_only_manage_own_bookings(client: httpx.AsyncClient) -> None:
    amna_headers = await authenticate(client, "amna@example.com", "amna-password")
    bilal_headers = await authenticate(client, "bilal@example.com", "bilal-password")

    own_bookings = await client.get("/bookings", headers=amna_headers)
    assert own_bookings.status_code == 200
    assert {booking["user_id"] for booking in own_bookings.json()} == {1}

    forbidden_booking_update = await client.patch(
        "/bookings/2",
        headers=amna_headers,
        json={"status": "cancelled"},
    )
    assert forbidden_booking_update.status_code == 404

    own_booking_update = await client.patch(
        "/bookings/2",
        headers=bilal_headers,
        json={"status": "cancelled"},
    )
    assert own_booking_update.status_code == 200
    assert own_booking_update.json()["status"] == "cancelled"


@pytest.mark.anyio
async def test_user_can_create_booking_for_existing_provider(client: httpx.AsyncClient) -> None:
    headers = await authenticate(client, "sara@example.com", "sara-password")
    response = await client.post(
        "/bookings",
        headers=headers,
        json={"provider_id": 5, "booking_time": "2026-08-01T10:00:00"},
    )
    assert response.status_code == 201
    assert response.json()["user_id"] == 3
    assert response.json()["status"] == "pending"
