import logging
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.system import AuditLog

logger = logging.getLogger("prometheus9.audit")

# Sensitive keys that must NEVER be written to audit logs
REDACTED_KEYS = {"password", "hashed_password", "token", "access_token", "refresh_token", "secret", "client_secret"}

def sanitize_details(details: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not details:
        return {}
    sanitized: Dict[str, Any] = {}
    for k, v in details.items():
        if any(sensitive in k.lower() for sensitive in REDACTED_KEYS):
            sanitized[k] = "[REDACTED]"
        elif isinstance(v, dict):
            sanitized[k] = sanitize_details(v)
        else:
            sanitized[k] = v
    return sanitized

async def record_audit_event(
    db: AsyncSession,
    actor_id: str,
    actor_type: str,
    action: str,
    resource_type: str,
    organization_id: Optional[str] = None,
    resource_id: Optional[str] = None,
    product_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    clean_details = sanitize_details(details)
    
    log_entry = AuditLog(
        organization_id=organization_id,
        actor_id=actor_id,
        actor_type=actor_type,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        product_id=product_id,
        details=clean_details,
        ip_address=ip_address
    )
    db.add(log_entry)
    await db.commit()
    await db.refresh(log_entry)
    
    logger.info(
        f"[AUDIT] action={action} actor={actor_id} resource={resource_type}:{resource_id} org={organization_id}"
    )
    return log_entry
