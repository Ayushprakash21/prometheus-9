import uuid
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_products_returns_initial_seeded_portfolio(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/v1/products", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    products = data["items"]
    assert len(products) >= 2
    
    slugs = [p["slug"] for p in products]
    assert "orion-9" in slugs
    assert "applywise-ai" in slugs

@pytest.mark.asyncio
async def test_get_orion9_detail(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/v1/products/orion-9", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ORION-9"
    assert data["category"] == "Supply Chain Operating System"
    assert len(data["features"]) >= 2
    feature_names = [f["name"] for f in data["features"]]
    assert any("Inventory Balancing" in f for f in feature_names)

@pytest.mark.asyncio
async def test_get_applywise_detail(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/v1/products/applywise-ai", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ApplyWise AI"
    assert data["category"] == "Career and Resume Platform"
    assert len(data["features"]) >= 2
    feature_names = [f["name"] for f in data["features"]]
    assert any("Resume Optimization" in f for f in feature_names)

@pytest.mark.asyncio
async def test_create_update_and_archive_product(client: AsyncClient, auth_headers: dict):
    unique_suffix = str(uuid.uuid4())[:8]
    slug = f"nova-9-{unique_suffix}"
    payload = {
        "name": f"Nova-9 {unique_suffix}",
        "slug": slug,
        "category": "Data Intelligence",
        "tagline": "Real-time enterprise intelligence",
        "website_url": "https://nova9.ai",
        "primary_objective": "demos",
        "is_active": True
    }
    # 1. Create product
    response = await client.post("/api/v1/products", json=payload, headers=auth_headers)
    assert response.status_code == 201
    created_data = response.json()
    product_id = created_data["id"]
    assert created_data["slug"] == slug
    assert created_data["status"] == "active"

    # 2. Update product
    update_payload = {
        "tagline": "Updated Real-Time Intelligence Platform",
        "primary_objective": "qualified_leads"
    }
    patch_res = await client.patch(f"/api/v1/products/{product_id}", json=update_payload, headers=auth_headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["tagline"] == "Updated Real-Time Intelligence Platform"

    # 3. Add Feature
    feature_payload = {
        "name": "Live Telemetry Feed",
        "description": "Sub-millisecond ingestion pipeline",
        "proof_points": ["Handles 100k events/sec"],
        "is_active": True
    }
    feat_res = await client.post(f"/api/v1/products/{product_id}/features", json=feature_payload, headers=auth_headers)
    assert feat_res.status_code == 201
    assert feat_res.json()["name"] == "Live Telemetry Feed"

    # 4. List Features
    feat_list_res = await client.get(f"/api/v1/products/{product_id}/features", headers=auth_headers)
    assert feat_list_res.status_code == 200
    assert len(feat_list_res.json()) >= 1

    # 5. Add Source
    source_payload = {
        "source_type": "doc",
        "title": "Architecture Whitepaper",
        "url": "https://nova9.ai/whitepaper.pdf"
    }
    source_res = await client.post(f"/api/v1/products/{product_id}/sources", json=source_payload, headers=auth_headers)
    assert source_res.status_code == 201

    # 6. Archive product
    archive_res = await client.post(f"/api/v1/products/{product_id}/archive", headers=auth_headers)
    assert archive_res.status_code == 200
    assert archive_res.json()["status"] == "archived"
    assert archive_res.json()["is_active"] is False
