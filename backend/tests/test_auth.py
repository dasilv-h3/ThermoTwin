"""Tests for auth endpoints: register, login, refresh, me."""

from unittest.mock import AsyncMock, MagicMock

import pytest

from app.core.security import create_access_token, create_refresh_token, hash_password

# ---------------------------------------------------------------------------
# POST /api/auth/register
# ---------------------------------------------------------------------------


@pytest.mark.anyio
async def test_register_success(client):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None  # no existing user

    mock_session = AsyncMock()
    mock_session.execute.return_value = mock_result
    mock_session.commit = AsyncMock()
    mock_session.refresh = AsyncMock(side_effect=lambda u: setattr(u, "id", 1))

    async def override_get_session():
        yield mock_session

    from app.db.postgresql import get_session
    from app.main import app

    app.dependency_overrides[get_session] = override_get_session

    response = await client.post(
        "/api/auth/register",
        json={
            "email": "new@test.com",
            "password": "Str0ngP@ss!",
            "first_name": "John",
            "last_name": "Doe",
        },
    )

    app.dependency_overrides.clear()

    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.anyio
async def test_register_duplicate_email(client):
    existing_user = MagicMock()

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = existing_user  # already exists

    mock_session = AsyncMock()
    mock_session.execute.return_value = mock_result

    async def override_get_session():
        yield mock_session

    from app.db.postgresql import get_session
    from app.main import app

    app.dependency_overrides[get_session] = override_get_session

    response = await client.post(
        "/api/auth/register",
        json={
            "email": "existing@test.com",
            "password": "Str0ngP@ss!",
            "first_name": "Jane",
            "last_name": "Doe",
        },
    )

    app.dependency_overrides.clear()

    assert response.status_code == 409
    assert "already registered" in response.json()["detail"]


@pytest.mark.anyio
async def test_register_invalid_email(client):
    response = await client.post(
        "/api/auth/register",
        json={
            "email": "not-an-email",
            "password": "Str0ngP@ss!",
            "first_name": "John",
            "last_name": "Doe",
        },
    )
    assert response.status_code == 422


@pytest.mark.anyio
async def test_register_missing_fields(client):
    response = await client.post(
        "/api/auth/register",
        json={
            "email": "test@test.com",
        },
    )
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# POST /api/auth/login
# ---------------------------------------------------------------------------


@pytest.mark.anyio
async def test_login_success(client):
    password = "Str0ngP@ss!"
    fake_user = MagicMock(
        id=1,
        email="user@test.com",
        password_hash=hash_password(password),
    )

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_user

    mock_session = AsyncMock()
    mock_session.execute.return_value = mock_result

    async def override_get_session():
        yield mock_session

    from app.db.postgresql import get_session
    from app.main import app

    app.dependency_overrides[get_session] = override_get_session

    response = await client.post(
        "/api/auth/login",
        json={
            "email": "user@test.com",
            "password": password,
        },
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.anyio
async def test_login_wrong_password(client):
    fake_user = MagicMock(
        id=1,
        email="user@test.com",
        password_hash=hash_password("CorrectPassword"),
    )

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_user

    mock_session = AsyncMock()
    mock_session.execute.return_value = mock_result

    async def override_get_session():
        yield mock_session

    from app.db.postgresql import get_session
    from app.main import app

    app.dependency_overrides[get_session] = override_get_session

    response = await client.post(
        "/api/auth/login",
        json={
            "email": "user@test.com",
            "password": "WrongPassword",
        },
    )

    app.dependency_overrides.clear()

    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


@pytest.mark.anyio
async def test_login_nonexistent_user(client):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None

    mock_session = AsyncMock()
    mock_session.execute.return_value = mock_result

    async def override_get_session():
        yield mock_session

    from app.db.postgresql import get_session
    from app.main import app

    app.dependency_overrides[get_session] = override_get_session

    response = await client.post(
        "/api/auth/login",
        json={
            "email": "ghost@test.com",
            "password": "whatever",
        },
    )

    app.dependency_overrides.clear()

    assert response.status_code == 401


# ---------------------------------------------------------------------------
# POST /api/auth/refresh
# ---------------------------------------------------------------------------


@pytest.mark.anyio
async def test_refresh_success(client):
    refresh_token = create_refresh_token(user_id=1)

    response = await client.post(
        "/api/auth/refresh",
        json={
            "refresh_token": refresh_token,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.anyio
async def test_refresh_with_access_token_rejected(client):
    access_token = create_access_token(user_id=1)

    response = await client.post(
        "/api/auth/refresh",
        json={
            "refresh_token": access_token,
        },
    )

    assert response.status_code == 401
    assert "Invalid token type" in response.json()["detail"]


@pytest.mark.anyio
async def test_refresh_with_invalid_token(client):
    response = await client.post(
        "/api/auth/refresh",
        json={
            "refresh_token": "not.a.valid.jwt",
        },
    )

    assert response.status_code == 401


@pytest.mark.anyio
async def test_refresh_with_expired_token(client):
    from datetime import UTC, datetime, timedelta

    import jwt as pyjwt

    from app.core.config import settings

    expired_payload = {
        "sub": "1",
        "type": "refresh",
        "exp": datetime.now(UTC) - timedelta(days=1),
        "iat": datetime.now(UTC) - timedelta(days=8),
    }
    expired_token = pyjwt.encode(expired_payload, settings.JWT_SECRET, algorithm="HS256")

    response = await client.post(
        "/api/auth/refresh",
        json={
            "refresh_token": expired_token,
        },
    )

    assert response.status_code == 401
    assert "expired" in response.json()["detail"].lower()


# ---------------------------------------------------------------------------
# GET /api/auth/me
# ---------------------------------------------------------------------------


@pytest.mark.anyio
async def test_me_success(client):
    fake_user = MagicMock(
        id=1,
        email="user@test.com",
        first_name="John",
        last_name="Doe",
    )

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = fake_user

    mock_session = AsyncMock()
    mock_session.execute.return_value = mock_result

    async def override_get_session():
        yield mock_session

    from app.db.postgresql import get_session
    from app.main import app

    app.dependency_overrides[get_session] = override_get_session

    token = create_access_token(user_id=1)
    response = await client.get(
        "/api/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "user@test.com"
    assert data["first_name"] == "John"
    assert data["last_name"] == "Doe"


@pytest.mark.anyio
async def test_me_no_token(client):
    response = await client.get("/api/auth/me")
    assert response.status_code == 403


@pytest.mark.anyio
async def test_me_invalid_token(client):
    response = await client.get(
        "/api/auth/me",
        headers={
            "Authorization": "Bearer invalid.jwt.token",
        },
    )
    assert response.status_code == 401


@pytest.mark.anyio
async def test_me_with_refresh_token_rejected(client):
    refresh_token = create_refresh_token(user_id=1)
    response = await client.get(
        "/api/auth/me",
        headers={
            "Authorization": f"Bearer {refresh_token}",
        },
    )
    assert response.status_code == 401
    assert "Invalid token type" in response.json()["detail"]
