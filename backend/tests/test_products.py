import uuid
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_products_returns_initial_seeded_portfolio(client: AsyncClient):
    response = await client.get("/api/v1/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) >= 2
    
    slugs = [p["slug"] for p in products]
    assert "orion-9" in slugs
    assert "applywise-ai" in slugs

@pytest.mark.asyncio
async def test_get_orion9_detail(client: AsyncClient):
    response = await client.get("/api/v1/products/orion-9")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ORION-9"
    assert data["category"] == "Enterprise Supply Chain"
    assert len(data["features"]) >= 2
    feature_names = [f["name"] for f in data["features"]]
    assert any("Inventory Balancing" in f for f in feature_names)

@pytest.mark.asyncio
async def test_get_applywise_detail(client: AsyncClient):
    response = await client.get("/api/v1/products/applywise-ai")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ApplyWise AI"
    assert data["category"] == "Career & HR Technology"
    assert len(data["features"]) >= 2
    feature_names = [f["name"] for f in data["features"]]
    assert any("Resume Optimization" in f for f in feature_names)

@pytest.mark.asyncio
async def test_create_new_product(client: AsyncClient):
    unique_suffix = str(uuid.uuid4())[:8]
    payload = {
        "name": f"Nova-9 {unique_suffix}",
        "slug": f"nova-9-{unique_suffix}",
        "category": "Data Intelligence",
        "tagline": "Real-time enterprise intelligence",
        "website_url": "https://nova9.ai",
        "primary_objective": "demos",
        "is_active": True
    }
    response = await client.post("/api/v1/products", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["slug"] == payload["slug"]
