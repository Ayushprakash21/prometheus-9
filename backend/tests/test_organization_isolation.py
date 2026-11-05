import uuid
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_cross_organization_data_isolation(client: AsyncClient, auth_headers: dict):
    """
    Strict multi-tenant security verification:
    Ensure that an authenticated user belonging to Organization A cannot access,
    mutate, or view any resources created by Organization B.
    """
    # 1. Organization A creates a proprietary product
    org_a_suffix = str(uuid.uuid4())[:8]
    org_a_product_res = await client.post("/api/v1/products", json={
        "name": f"Org A Secret Tech {org_a_suffix}",
        "slug": f"org-a-secret-{org_a_suffix}",
        "category": "Confidential AI",
        "tagline": "Top secret product",
        "website_url": "https://orga.internal",
        "primary_objective": "qualified_leads",
        "is_active": True
    }, headers=auth_headers)
    assert org_a_product_res.status_code == 201
    org_a_product_id = org_a_product_res.json()["id"]

    # 2. Register User B with an entirely separate Organization B
    org_b_suffix = str(uuid.uuid4())[:8]
    reg_b_res = await client.post("/api/v1/auth/register", json={
        "email": f"user_b_{org_b_suffix}@competitor.com",
        "password": "CompetitorPassword2026!@",
        "full_name": "Competitor User",
        "organization_name": f"Competitor Org {org_b_suffix}"
    })
    assert reg_b_res.status_code == 201
    user_b_token = reg_b_res.json()["access_token"]
    user_b_org_id = reg_b_res.json()["active_organization_id"]
    headers_b = {"Authorization": f"Bearer {user_b_token}"}

    # 3. User B attempts to access Org A's product directly -> Must be 404 Not Found (isolated)
    access_attempt = await client.get(f"/api/v1/products/{org_a_product_id}", headers=headers_b)
    assert access_attempt.status_code == 404
    assert "not found" in access_attempt.json()["detail"].lower()

    # 4. User B attempts to update Org A's product -> Must be 404 Not Found
    update_attempt = await client.patch(f"/api/v1/products/{org_a_product_id}", json={
        "tagline": "Tampered by competitor!"
    }, headers=headers_b)
    assert update_attempt.status_code == 404

    # 5. User B attempts to spoof Organization A by sending Org A's organization_id in X-Organization-Id header
    # First get Org A id
    me_res = await client.get("/api/v1/auth/me", headers=auth_headers)
    org_a_id = me_res.json()["memberships"][0]["organization_id"]
    
    spoof_headers = {
        "Authorization": f"Bearer {user_b_token}",
        "X-Organization-Id": org_a_id
    }
    spoof_res = await client.get("/api/v1/products", headers=spoof_headers)
    assert spoof_res.status_code == 403
    assert "not authorized to access organization" in spoof_res.json()["detail"].lower()

    # 6. Verify User B can manage their own products in Org B with zero interference
    b_product_res = await client.post("/api/v1/products", json={
        "name": f"Org B Product {org_b_suffix}",
        "slug": f"org-b-product-{org_b_suffix}",
        "category": "Competitor Platform",
        "tagline": "Independent product",
        "website_url": "https://orgb.internal",
        "primary_objective": "registrations",
        "is_active": True
    }, headers=headers_b)
    assert b_product_res.status_code == 201
