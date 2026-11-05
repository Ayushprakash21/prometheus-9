import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.system import AuditLog

@pytest.mark.asyncio
async def test_audit_logs_recorded_for_critical_operations(client: AsyncClient, auth_headers: dict, db_session: AsyncSession):
    # 1. Trigger successful product creation
    unique = str(uuid.uuid4())[:8]
    create_res = await client.post("/api/v1/products", json={
        "name": f"Audit Tracked {unique}",
        "slug": f"audit-tracked-{unique}",
        "category": "Testing",
        "tagline": "Audited product",
        "website_url": "https://audited.ai",
        "primary_objective": "qualified_leads",
        "is_active": True
    }, headers=auth_headers)
    assert create_res.status_code == 201
    product_id = create_res.json()["id"]

    # 2. Trigger product update
    update_res = await client.patch(f"/api/v1/products/{product_id}", json={
        "tagline": "Updated audited tagline"
    }, headers=auth_headers)
    assert update_res.status_code == 200

    # 3. Trigger product archival
    archive_res = await client.post(f"/api/v1/products/{product_id}/archive", headers=auth_headers)
    assert archive_res.status_code == 200

    # 4. Query audit logs from database
    stmt = (
        select(AuditLog)
        .where(AuditLog.resource_id == product_id)
        .order_by(AuditLog.timestamp.asc())
    )
    result = await db_session.execute(stmt)
    logs = result.scalars().all()
    
    actions = [log.action for log in logs]
    assert "PRODUCT_CREATED" in actions
    assert "PRODUCT_UPDATED" in actions
    assert "PRODUCT_ARCHIVED" in actions

    # 5. Verify no sensitive tokens or raw secrets exist in audit log details
    for log in logs:
        log_str = str(log.details).lower()
        assert "password" not in log_str
        assert "token" not in log_str
        assert "secret" not in log_str
