from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.system import AuditLog

async def log_audit_event(
    db: AsyncSession,
    actor_id: str,
    actor_type: str,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    product_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    entry = AuditLog(
        actor_id=actor_id,
        actor_type=actor_type,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        product_id=product_id,
        details=details or {},
        ip_address=ip_address
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry
