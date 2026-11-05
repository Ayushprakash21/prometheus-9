import uuid
from datetime import datetime, timezone, timedelta
import pytest
from httpx import AsyncClient
from jose import jwt
from app.config import settings
from app.models.system import OrganizationMembership
from app.services.seeder import FOUNDER_EMAIL

@pytest.mark.asyncio
async def test_missing_auth_token_rejected(client: AsyncClient):
    """Missing Authorization header must return 401 Unauthorized."""
    res = await client.get("/api/v1/products")
    assert res.status_code == 401
    assert "Missing authentication token" in res.json()["detail"]

@pytest.mark.asyncio
async def test_invalid_auth_token_rejected(client: AsyncClient):
    """Corrupted or invalid JWT must return 401 Unauthorized."""
    headers = {"Authorization": "Bearer invalid.garbage.token.string"}
    res = await client.get("/api/v1/products", headers=headers)
    assert res.status_code == 401
    assert "Invalid or expired authentication token" in res.json()["detail"]

@pytest.mark.asyncio
async def test_expired_auth_token_rejected(client: AsyncClient):
    """Expired JWT must be rejected with 401 Unauthorized."""
    expired_time = datetime.now(timezone.utc) - timedelta(hours=1)
    expired_payload = {
        "sub": str(uuid.uuid4()),
        "exp": expired_time
    }
    expired_token = jwt.encode(expired_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    headers = {"Authorization": f"Bearer {expired_token}"}
    
    res = await client.get("/api/v1/products", headers=headers)
    assert res.status_code == 401
    assert "Invalid or expired authentication token" in res.json()["detail"]

@pytest.mark.asyncio
async def test_role_based_access_control_hierarchy(client: AsyncClient, db_session):
    """
    Verify RBAC role hierarchy:
    - Viewer: read-only access (403 on mutative/admin actions).
    - Operator: can create campaigns/assets, cannot trigger emergency pause (403).
    - Admin/Owner: authorized for all operations including emergency pause.
    """
    unique = str(uuid.uuid4())[:8]
    org_name = f"RBAC Org {unique}"
    
    # 1. Register Owner
    owner_res = await client.post("/api/v1/auth/register", json={
        "email": f"owner_{unique}@rbactest.com",
        "password": "Password123!#$",
        "full_name": "Test Owner",
        "organization_name": org_name
    })
    assert owner_res.status_code == 201
    owner_token = owner_res.json()["access_token"]
    org_id = owner_res.json()["active_organization_id"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    # Create product under this org
    prod_res = await client.post("/api/v1/products", json={
        "name": f"RBAC Product {unique}",
        "slug": f"rbac-prod-{unique}",
        "category": "Testing",
        "primary_objective": "qualified_leads",
        "is_active": True
    }, headers=owner_headers)
    assert prod_res.status_code == 201
    product_id = prod_res.json()["id"]

    # 2. Register Viewer user under the same organization
    viewer_email = f"viewer_{unique}@rbactest.com"
    viewer_reg = await client.post("/api/v1/auth/register", json={
        "email": viewer_email,
        "password": "Password123!#$",
        "full_name": "Test Viewer",
        "organization_name": f"Temp Org {unique}"
    })
    viewer_id = viewer_reg.json()["user_id"]
    viewer_token = viewer_reg.json()["access_token"]

    # Add Viewer membership into org_id
    viewer_membership = OrganizationMembership(
        organization_id=org_id,
        user_id=viewer_id,
        role="viewer"
    )
    db_session.add(viewer_membership)
    await db_session.commit()

    viewer_headers = {
        "Authorization": f"Bearer {viewer_token}",
        "X-Organization-Id": org_id
    }

    # Viewer can read products
    viewer_read = await client.get("/api/v1/products", headers=viewer_headers)
    assert viewer_read.status_code == 200

    # Viewer CANNOT create products (requires owner/admin) -> 403 Forbidden
    viewer_create_prod = await client.post("/api/v1/products", json={
        "name": "Unauthorized Prod",
        "slug": "unauth-prod",
        "category": "Test",
        "primary_objective": "leads"
    }, headers=viewer_headers)
    assert viewer_create_prod.status_code == 403

    # Viewer CANNOT emergency pause agents -> 403 Forbidden
    viewer_pause = await client.post("/api/v1/agents/emergency-pause", headers=viewer_headers)
    assert viewer_pause.status_code == 403

    # 3. Register Operator user and test permissions
    operator_email = f"operator_{unique}@rbactest.com"
    op_reg = await client.post("/api/v1/auth/register", json={
        "email": operator_email,
        "password": "Password123!#$",
        "full_name": "Test Operator",
        "organization_name": f"Temp Org Op {unique}"
    })
    op_id = op_reg.json()["user_id"]
    op_token = op_reg.json()["access_token"]

    op_membership = OrganizationMembership(
        organization_id=org_id,
        user_id=op_id,
        role="operator"
    )
    db_session.add(op_membership)
    await db_session.commit()

    op_headers = {
        "Authorization": f"Bearer {op_token}",
        "X-Organization-Id": org_id
    }

    # Operator CAN create campaign -> 201 Created
    op_camp_res = await client.post("/api/v1/campaigns", json={
        "product_id": product_id,
        "title": "Operator Campaign",
        "objective": "qualified_leads",
        "status": "active"
    }, headers=op_headers)
    assert op_camp_res.status_code == 201

    # Operator CANNOT emergency pause (requires owner or admin) -> 403 Forbidden
    op_pause_res = await client.post("/api/v1/agents/emergency-pause", headers=op_headers)
    assert op_pause_res.status_code == 403

    # 4. Owner CAN emergency pause and resume -> 200 OK
    owner_pause_res = await client.post("/api/v1/agents/emergency-pause", headers=owner_headers)
    assert owner_pause_res.status_code == 200
    assert owner_pause_res.json()["is_paused"] is True

    owner_resume_res = await client.post("/api/v1/agents/resume", headers=owner_headers)
    assert owner_resume_res.status_code == 200
    assert owner_resume_res.json()["is_paused"] is False
