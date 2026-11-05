import uuid
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_product_registry_crud_and_nested_resources(client: AsyncClient, auth_headers: dict):
    suffix = str(uuid.uuid4())[:8]
    slug = f"agentic-mesh-{suffix}"

    # 1. POST /api/v1/products - Create product
    create_payload = {
        "name": f"Agentic Mesh {suffix}",
        "slug": slug,
        "category": "Autonomous Systems",
        "tagline": "Decentralized autonomous AI agent orchestration",
        "description": "Enterprise framework for multi-agent coordination.",
        "website_url": "https://agenticmesh.io",
        "primary_objective": "qualified_leads",
        "is_active": True
    }
    create_res = await client.post("/api/v1/products", json=create_payload, headers=auth_headers)
    assert create_res.status_code == 201
    product = create_res.json()
    product_id = product["id"]
    assert product["name"] == create_payload["name"]
    assert product["slug"] == slug
    assert product["status"] == "active"

    # 2. Duplicate slug attempt -> 409 Conflict
    dup_res = await client.post("/api/v1/products", json=create_payload, headers=auth_headers)
    assert dup_res.status_code == 409
    assert "already exists" in dup_res.json()["detail"].lower()

    # 3. GET /api/v1/products - List products with pagination & filters
    list_res = await client.get("/api/v1/products?page=1&page_size=10&category=Autonomous Systems", headers=auth_headers)
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] >= 1
    found_slugs = [p["slug"] for p in list_data["items"]]
    assert slug in found_slugs

    # 4. GET /api/v1/products/{product_id}
    detail_res = await client.get(f"/api/v1/products/{product_id}", headers=auth_headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == product_id
    assert "brand_profile" in detail
    assert "features" in detail
    assert "audiences" in detail

    # 5. PATCH /api/v1/products/{product_id}
    patch_res = await client.patch(f"/api/v1/products/{product_id}", json={
        "tagline": "Updated Mesh Orchestration Engine",
        "primary_objective": "demos"
    }, headers=auth_headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["tagline"] == "Updated Mesh Orchestration Engine"
    assert patch_res.json()["primary_objective"] == "demos"

    # 6. Nested Brand Profile: PUT & GET
    brand_update_payload = {
        "tone_of_voice": "Technical, Visionary, Crisp",
        "primary_color": "#2D3748",
        "accent_color": "#E2E8F0",
        "do_not_mention_claims": ["No human oversight required"],
        "mandatory_disclaimers": ["Autonomous execution subject to organization policy constraints"]
    }
    put_brand_res = await client.put(f"/api/v1/products/{product_id}/brand-profile", json=brand_update_payload, headers=auth_headers)
    assert put_brand_res.status_code == 200
    assert put_brand_res.json()["tone_of_voice"] == "Technical, Visionary, Crisp"

    get_brand_res = await client.get(f"/api/v1/products/{product_id}/brand-profile", headers=auth_headers)
    assert get_brand_res.status_code == 200
    assert get_brand_res.json()["primary_color"] == "#2D3748"

    # 7. Nested Audience Persona: POST & GET
    audience_payload = {
        "title": "VP of Autonomous Infrastructure",
        "role_description": "Enterprise Engineering Leader",
        "pain_points": ["Agent latency", "Protocol drift"],
        "desired_outcomes": ["Deterministic pipeline completion"],
        "preferred_channels": ["LinkedIn", "Twitter/X"]
    }
    add_aud_res = await client.post(f"/api/v1/products/{product_id}/audiences", json=audience_payload, headers=auth_headers)
    assert add_aud_res.status_code == 201
    assert add_aud_res.json()["title"] == "VP of Autonomous Infrastructure"

    list_aud_res = await client.get(f"/api/v1/products/{product_id}/audiences", headers=auth_headers)
    assert list_aud_res.status_code == 200
    assert len(list_aud_res.json()) >= 1
    assert list_aud_res.json()[0]["title"] == "VP of Autonomous Infrastructure"

    # 8. POST /api/v1/products/{product_id}/archive
    archive_res = await client.post(f"/api/v1/products/{product_id}/archive", headers=auth_headers)
    assert archive_res.status_code == 200
    assert archive_res.json()["status"] == "archived"
    assert archive_res.json()["is_active"] is False
