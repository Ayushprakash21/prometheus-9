from typing import List, Optional, Tuple, Dict, Any
from fastapi import APIRouter, Depends, Request, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.system import User, Organization, OrganizationMembership
from app.security.dependencies import get_current_user, get_current_active_org, require_roles
from app.services.audit import record_audit_event
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/approvals", tags=["Approval Centre"])

class ApprovalItemSchema(BaseModel):
    id: str
    organization_id: str
    product_id: str
    item_type: str
    title: str
    summary: str
    proposed_by_agent: str
    risk_score: str
    status: str
    payload: Dict[str, Any]
    reviewer_notes: Optional[str] = None
    created_at: datetime

class ApprovalActionRequest(BaseModel):
    action: str  # approve, reject, revise
    notes: Optional[str] = None

# In-memory approval ledger with deterministic seeding
MOCK_APPROVAL_ITEMS: List[Dict[str, Any]] = [
    {
        "id": "app-001",
        "organization_id": "org-main",
        "product_id": "prod-01",
        "item_type": "marketing_strategy",
        "title": "Q4 Autonomous Growth Blueprint: Asymmetric Search Dominance",
        "summary": "Targeting 25 high-intent long-tail keywords around AI agent observability with 12 organic video shorts and 4 LinkedIn deep-dives.",
        "proposed_by_agent": "Strategy Director",
        "risk_score": "low",
        "status": "pending",
        "payload": {
            "channels": ["LinkedIn", "YouTube Shorts"],
            "duration_weeks": 6,
            "projected_reach": "150,000 Impressions",
            "verified_claims_checked": True
        },
        "created_at": datetime.utcnow()
    },
    {
        "id": "app-002",
        "organization_id": "org-main",
        "product_id": "prod-01",
        "item_type": "creative_script",
        "title": "Short-Form Video Script: 'The Death of Brittle RPA Scripts'",
        "summary": "60-second vertical teleprompter script for YouTube Shorts contrasting fragile legacy scrapers against autonomous semantic graphs.",
        "proposed_by_agent": "Script Supervisor",
        "risk_score": "low",
        "status": "pending",
        "payload": {
            "hook": "90% of RPA automations fail when a website changes a single CSS class.",
            "duration_seconds": 58,
            "tone": "Provocative & Direct",
            "target_persona": "VP of Engineering"
        },
        "created_at": datetime.utcnow()
    }
]

@router.get("", response_model=List[ApprovalItemSchema])
async def list_approval_items(
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org)
):
    org, _ = org_and_membership
    return [item for item in MOCK_APPROVAL_ITEMS if item["organization_id"] == org.id or item["organization_id"] == "org-main"]

@router.post("/{item_id}/action")
async def take_approval_action(
    item_id: str,
    action_req: ApprovalActionRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user_and_membership: Tuple[User, OrganizationMembership] = Depends(require_roles(["owner", "admin", "operator"])),
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org)
):
    user, _ = user_and_membership
    org, _ = org_and_membership

    matched = next((item for item in MOCK_APPROVAL_ITEMS if item["id"] == item_id), None)
    if not matched:
        raise HTTPException(status_code=404, detail="Approval item not found")

    if action_req.action == "approve":
        matched["status"] = "approved"
    elif action_req.action == "reject":
        matched["status"] = "rejected"
    elif action_req.action == "revise":
        matched["status"] = "revising"
        matched["reviewer_notes"] = action_req.notes

    await record_audit_event(
        db,
        organization_id=org.id,
        user_id=user.id,
        action=f"APPROVAL_{action_req.action.upper()}",
        resource_type="approval_item",
        resource_id=item_id,
        details={"title": matched["title"], "notes": action_req.notes},
        request=request
    )

    return {
        "status": "success",
        "item_id": item_id,
        "new_status": matched["status"]
    }
