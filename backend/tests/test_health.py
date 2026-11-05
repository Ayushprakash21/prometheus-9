import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "operational"
    assert data["ffmpeg_available"] is True
    assert "system_metrics" in data
    assert "cpu_usage_percent" in data["system_metrics"]
    assert "ram_available_mb" in data["system_metrics"]
    assert "autonomous_scheduler" in data
    assert data["autonomous_scheduler"]["is_running"] is True

@pytest.mark.asyncio
async def test_root_metadata(client: AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["system"] == "PROMETHEUS-9"
    assert "Charcoal & Copper" in data["edition"]
    assert "operating_cycle" in data
