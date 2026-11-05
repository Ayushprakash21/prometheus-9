from typing import List, Optional, Tuple, Dict, Any
from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.system import User, Organization, OrganizationMembership
from app.security.dependencies import get_current_user, get_current_active_org, require_roles
from pydantic import BaseModel
from datetime import datetime
import time

router = APIRouter(prefix="/providers", tags=["AI Model Providers"])

class AIProviderSchema(BaseModel):
    id: str
    provider_name: str
    model_id: str
    is_enabled: bool
    is_default: bool
    status: str
    latency_ms: Optional[int] = None
    masked_key: str
    updated_at: datetime

DEFAULT_PROVIDERS = [
    {
        "id": "prov-gemini",
        "provider_name": "gemini",
        "model_id": "gemini-1.5-pro",
        "is_enabled": True,
        "is_default": True,
        "status": "connected",
        "latency_ms": 310,
        "masked_key": "AIzaSy********************kX9Q",
        "updated_at": datetime.utcnow()
    },
    {
        "id": "prov-gemini-flash",
        "provider_name": "gemini",
        "model_id": "gemini-1.5-flash",
        "is_enabled": True,
        "is_default": False,
        "status": "connected",
        "latency_ms": 140,
        "masked_key": "AIzaSy********************kX9Q",
        "updated_at": datetime.utcnow()
    },
    {
        "id": "prov-openai",
        "provider_name": "openai",
        "model_id": "gpt-4o",
        "is_enabled": True,
        "is_default": False,
        "status": "connected",
        "latency_ms": 395,
        "masked_key": "sk-proj-********************aA91",
        "updated_at": datetime.utcnow()
    },
    {
        "id": "prov-anthropic",
        "provider_name": "anthropic",
        "model_id": "claude-3-5-sonnet",
        "is_enabled": True,
        "is_default": False,
        "status": "connected",
        "latency_ms": 460,
        "masked_key": "sk-ant-********************zz12",
        "updated_at": datetime.utcnow()
    }
]

@router.get("", response_model=List[AIProviderSchema])
async def list_providers(
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org)
):
    return DEFAULT_PROVIDERS

@router.post("/{provider_id}/test")
async def test_provider_latency(
    provider_id: str,
    user_and_membership: Tuple[User, OrganizationMembership] = Depends(require_roles(["owner", "admin"]))
):
    matched = next((p for p in DEFAULT_PROVIDERS if p["id"] == provider_id), None)
    if not matched:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    # Measure simulated fast ping
    simulated_latency = 120 + (len(provider_id) * 15) % 80
    matched["latency_ms"] = simulated_latency
    matched["status"] = "connected"

    return {
        "status": "success",
        "provider_id": provider_id,
        "latency_ms": simulated_latency,
        "health": "healthy"
    }
