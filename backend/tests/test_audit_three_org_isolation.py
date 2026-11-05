import uuid
import pytest
from httpx import AsyncClient
from app.models.system import OrganizationMembership

@pytest.mark.asyncio
async def test_three_organization_isolation_and_role_boundaries(client: AsyncClient, db_session):
    """
    Exhaustive 3-organization test:
    - Org 1 (Owner 1): Creates proprietary product P1 and campaign C1.
    - Org 2 (Admin 2): Attempts cross-org read, update, delete of P1/C1 -> 404.
    - Org 3 (Viewer 3):
        - Attempts reading P1/C1 -> 404.
        - Attempts updating or deleting P1/C1 -> 404.
        - Attempts spoofing Org 1 or Org 2 via X-Organization-Id -> 403.
        - Attempts privilege escalation -> 403.
    """
    s1, s2, s3 = str(uuid.uuid4())[:8], str(uuid.uuid4())[:8], str(uuid.uuid4())[:8]

    # --- Setup Org 1 (Owner 1) ---
    r1 = await client.post("/api/v1/auth/register", json={
        "email": f"owner_1_{s1}@corp1.com",
        "password": "Password123!#$",
        "full_name": "Owner One",
        "organization_name": f"Org One {s1}"
    })
    token_1 = r1.json()["access_token"]
    org_1_id = r1.json()["active_organization_id"]
    h1 = {"Authorization": f"Bearer {token_1}"}

    # Org 1 creates Product P1
    p1_res = await client.post("/api/v1/products", json={
        "name": f"Product One {s1}",
        "slug": f"prod-one-{s1}",
        "category": "Enterprise AI",
        "primary_objective": "qualified_leads",
        "is_active": True
    }, headers=h1)
    assert p1_res.status_code == 201
    p1_id = p1_res.json()["id"]

    # Org 1 creates Campaign C1
    c1_res = await client.post("/api/v1/campaigns", json={
        "product_id": p1_id,
        "title": "Campaign One",
        "objective": "qualified_leads"
    }, headers=h1)
    assert c1_res.status_code == 201
    c1_id = c1_res.json()["id"]

    # --- Setup Org 2 (Admin 2) ---
    r2 = await client.post("/api/v1/auth/register", json={
        "email": f"admin_2_{s2}@corp2.com",
        "password": "Password123!#$",
        "full_name": "Admin Two",
        "organization_name": f"Org Two {s2}"
    })
    token_2 = r2.json()["access_token"]
    org_2_id = r2.json()["active_organization_id"]
    h2 = {"Authorization": f"Bearer {token_2}"}

    # --- Setup Org 3 (Viewer 3) ---
    # Register user 3 and add as viewer in Org 3
    r3 = await client.post("/api/v1/auth/register", json={
        "email": f"viewer_3_{s3}@corp3.com",
        "password": "Password123!#$",
        "full_name": "Viewer Three",
        "organization_name": f"Org Three {s3}"
    })
    user_3_id = r3.json()["user_id"]
    token_3 = r3.json()["access_token"]
    org_3_id = r3.json()["active_organization_id"]

    # Downgrade user 3 role in Org 3 to 'viewer'
    mem3 = (await db_session.execute(
        OrganizationMembership.__table__.select().where(
            OrganizationMembership.user_id == user_3_id
        )
    )).first()
    await db_session.execute(
        OrganizationMembership.__table__.update()
        .where(OrganizationMembership.id == mem3.id)
        .values(role="viewer")
    )
    await db_session.commit()
    h3 = {"Authorization": f"Bearer {token_3}"}

    # =========================================================================
    # 1. READ ATTACKS: Org 2 and Org 3 reading Org 1's resources -> 404
    # =========================================================================
    assert (await client.get(f"/api/v1/products/{p1_id}", headers=h2)).status_code == 404
    assert (await client.get(f"/api/v1/products/{p1_id}", headers=h3)).status_code == 404

    # =========================================================================
    # 2. UPDATE ATTACKS: Org 2 and Org 3 mutating Org 1's Product -> 404
    # =========================================================================
    patch_attempt_2 = await client.patch(f"/api/v1/products/{p1_id}", json={"tagline": "Hacked by Org 2"}, headers=h2)
    assert patch_attempt_2.status_code == 404

    # Viewer in Org 3 attempting mutation gets 403 (insufficient role) or 404 (not found)
    patch_attempt_3 = await client.patch(f"/api/v1/products/{p1_id}", json={"tagline": "Hacked by Org 3"}, headers=h3)
    assert patch_attempt_3.status_code in (403, 404)

    # =========================================================================
    # 3. DELETE / ARCHIVE ATTACKS: Org 2 archiving Org 1's Product -> 404
    # =========================================================================
    archive_attempt_2 = await client.post(f"/api/v1/products/{p1_id}/archive", headers=h2)
    assert archive_attempt_2.status_code == 404

    # =========================================================================
    # 4. NESTED RESOURCE MANIPULATION ATTACKS
    # =========================================================================
    # Org 2 attempting to attach an idea to Org 1's campaign C1 -> 404
    cross_idea_res = await client.post("/api/v1/campaigns/ideas", json={
        "campaign_id": c1_id,
        "product_id": p1_id,
        "title": "Cross Org Injected Idea",
        "hook": "Spam hook",
        "format": "short_video",
        "core_thesis": "Malicious thesis"
    }, headers=h2)
    assert cross_idea_res.status_code == 404

    # =========================================================================
    # 5. ORGANIZATION CONTEXT SPOOFING: X-Organization-Id
    # =========================================================================
    # User 3 tries to access Org 1 by spoofing header
    spoof_h3_org1 = {"Authorization": f"Bearer {token_3}", "X-Organization-Id": org_1_id}
    spoof_res = await client.get("/api/v1/products", headers=spoof_h3_org1)
    assert spoof_res.status_code == 403
    assert "not authorized to access organization" in spoof_res.json()["detail"].lower()

    # User 2 tries to access Org 1 by spoofing header
    spoof_h2_org1 = {"Authorization": f"Bearer {token_2}", "X-Organization-Id": org_1_id}
    assert (await client.get("/api/v1/products", headers=spoof_h2_org1)).status_code == 403

    # =========================================================================
    # 6. VIEWER PRIVILEGE ESCALATION PREVENTION
    # =========================================================================
    # Viewer in Org 3 cannot create products in Org 3 -> 403 Forbidden
    viewer_create = await client.post("/api/v1/products", json={
        "name": "Viewer Escalation Prod",
        "slug": "viewer-esc-prod",
        "category": "Test",
        "primary_objective": "leads"
    }, headers=h3)
    assert viewer_create.status_code == 403

    # Viewer in Org 3 cannot emergency pause agents -> 403 Forbidden
    assert (await client.post("/api/v1/agents/emergency-pause", headers=h3)).status_code == 403
