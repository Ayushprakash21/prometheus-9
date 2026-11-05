import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app, lifespan
from app.database import AsyncSessionLocal
from app.services.seeder import FOUNDER_EMAIL

@pytest_asyncio.fixture
async def client():
    async with lifespan(app):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://testserver"
        ) as ac:
            yield ac

@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient):
    login_payload = {
        "email": FOUNDER_EMAIL,
        "password": "Prometheus9_MasterSecurePassword2026!"
    }
    res = await client.post("/api/v1/auth/login", json=login_payload)
    assert res.status_code == 200, f"Login failed: {res.text}"
    token = res.json()["access_token"]
    return {
        "Authorization": f"Bearer {token}"
    }

@pytest_asyncio.fixture
async def db_session():
    async with AsyncSessionLocal() as session:
        yield session
