import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app, lifespan
from app.database import AsyncSessionLocal

@pytest_asyncio.fixture
async def client():
    async with lifespan(app):
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://testserver"
        ) as ac:
            yield ac

@pytest_asyncio.fixture
async def db_session():
    async with AsyncSessionLocal() as session:
        yield session
