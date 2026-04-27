"""Shared fixtures for ThermoTwin backend tests."""

from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app

# Force asyncio backend (Starlette BaseHTTPMiddleware is incompatible with trio)
pytest_plugins = ("anyio",)


@pytest.fixture(params=["asyncio"])
def anyio_backend(request):
    return request.param


@pytest.fixture
def db_mocks():
    """Mock all database connections for unit tests."""
    with (
        patch("app.db.mongodb.connect_mongo", new_callable=AsyncMock),
        patch("app.db.mongodb.close_mongo", new_callable=AsyncMock),
    ):
        yield


@pytest.fixture
async def client(db_mocks):
    """Async HTTP client wired to the FastAPI app."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as c:
        yield c
