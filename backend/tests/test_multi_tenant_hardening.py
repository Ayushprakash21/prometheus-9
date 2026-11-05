import uuid
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_end_to_end_tenant_isolation(client: AsyncClient):
    """
    Verify strict multi-tenant boundaries:
    User B from Org B cannot view, download, mutate, or delete
    products, campaigns, features, or media assets belonging to Org A.
    """
    suffix_a = str(uuid.uuid4())[:8]
    suffix_b = str(uuid.uuid4())[:8]

    # 1. Register User A (Org A)
    res_a = await client.post("/api/v1/auth/register", json={
        "email": f"corp_a_{suffix_a}@tenant-a.com",
        "password": "Password123!#$",
        "full_name": "Tenant A Admin",
        "organization_name": f"Organization Alpha {suffix_a}"
    })
    token_a = res_a.json()["access_token"]
    org_a_id = res_a.json()["active_organization_id"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register User B (Org B)
    res_b = await client.post("/api/v1/auth/register", json={
        "email": f"corp_b_{suffix_b}@tenant-b.com",
        "password": "Password123!#$",
        "full_name": "Tenant B Admin",
        "organization_name": f"Organization Beta {suffix_b}"
    })
    token_b = res_b.json()["access_token"]
    org_b_id = res_b.json()["active_organization_id"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Org A creates a Product
    prod_a_res = await client.post("/api/v1/products", json={
        "name": f"Alpha Sovereign AI {suffix_a}",
        "slug": f"alpha-sovereign-{suffix_a}",
        "category": "Enterprise AI",
        "primary_objective": "qualified_leads",
        "is_active": True
    }, headers=headers_a)
    assert prod_a_res.status_code == 201
    prod_a_id = prod_a_res.json()["id"]

    # 4. Org A creates a Campaign
    camp_a_res = await client.post("/api/v1/campaigns", json={
        "product_id": prod_a_id,
        "title": "Alpha Q4 Enterprise Push",
        "objective": "qualified_leads",
        "status": "active"
    }, headers=headers_a)
    assert camp_a_res.status_code == 201
    camp_a_id = camp_a_res.json()["id"]

    # 5. Org A uploads a proprietary Media Asset (Valid 1x1 PNG)
    png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    asset_res = await client.post(
        "/api/v1/assets/upload",
        data={"product_id": prod_a_id, "asset_type": "image"},
        files={"file": ("alpha_logo.png", png_bytes, "image/png")},
        headers=headers_a
    )
    assert asset_res.status_code == 201
    asset_a_id = asset_res.json()["id"]

    # --- VERIFY USER B FROM ORG B IS STRICTLY ISOLATED ---

    # A) User B listing products does NOT see Org A's product
    b_prods = (await client.get("/api/v1/products", headers=headers_b)).json()
    b_slugs = [p["slug"] for p in b_prods["items"]]
    assert f"alpha-sovereign-{suffix_a}" not in b_slugs

    # B) User B directly querying Org A's product gets 404 Not Found
    b_prod_detail = await client.get(f"/api/v1/products/{prod_a_id}", headers=headers_b)
    assert b_prod_detail.status_code == 404

    # C) User B attempting to add a feature to Org A's product gets 404 Not Found
    b_feat_res = await client.post(f"/api/v1/products/{prod_a_id}/features", json={
        "name": "Malicious Feature Injection",
        "description": "Injected by competitor"
    }, headers=headers_b)
    assert b_feat_res.status_code == 404

    # D) User B listing campaigns does NOT see Org A's campaign
    b_camps = (await client.get("/api/v1/campaigns", headers=headers_b)).json()
    b_camp_ids = [c["id"] for c in b_camps]
    assert camp_a_id not in b_camp_ids

    # E) User B creating campaign for Org A's product gets 404 Not Found
    b_camp_create = await client.post("/api/v1/campaigns", json={
        "product_id": prod_a_id,
        "title": "Cross Org Exploit",
        "objective": "leads"
    }, headers=headers_b)
    assert b_camp_create.status_code == 404

    # F) User B listing assets does NOT see Org A's asset
    b_assets = (await client.get("/api/v1/assets", headers=headers_b)).json()
    b_asset_ids = [a["id"] for a in b_assets]
    assert asset_a_id not in b_asset_ids

    # G) User B downloading Org A's asset gets 404 Not Found
    b_download = await client.get(f"/api/v1/assets/{asset_a_id}/download", headers=headers_b)
    assert b_download.status_code == 404

    # H) User B deleting Org A's asset gets 404 Not Found
    b_delete = await client.delete(f"/api/v1/assets/{asset_a_id}", headers=headers_b)
    assert b_delete.status_code == 404
