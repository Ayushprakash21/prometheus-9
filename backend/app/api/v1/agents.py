from typing import List, Optional, Tuple, Dict, Any
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.database import get_db
from app.models.agent import AgentRun, QualityReport, ComplianceReport
from app.models.organization import Product
from app.models.system import User, Organization, OrganizationMembership
from app.core.scheduler import task_queue
from app.security.dependencies import get_current_user, get_current_active_org, require_roles
from app.services.audit import record_audit_event
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/agents", tags=["AI Agent Workforce"])

SPECIALIST_AGENT_ROSTER = [
    {"name": "Marketing Intelligence Agent", "category": "Intelligence", "description": "Scans product websites, documentation, and extract ground-truth product facts.", "status": "idle"},
    {"name": "Trend Intelligence Agent", "category": "Intelligence", "description": "Monitors market trends, keywords, and industry news.", "status": "idle"},
    {"name": "Marketing Strategist Agent", "category": "Strategy", "description": "Develops objective-aligned campaign architectures and target audience roadmaps.", "status": "idle"},
    {"name": "Scriptwriter Agent", "category": "Creative", "description": "Crafts compelling video scripts adhering strictly to verified product capabilities.", "status": "idle"},
    {"name": "Storyboard Agent", "category": "Creative", "description": "Breaks scripts into timed visual scenes and shot prompts.", "status": "idle"},
    {"name": "Voice Production Agent", "category": "Audio", "description": "Generates natural speech voiceovers with local or cloud TTS engines.", "status": "idle"},
    {"name": "Video Production Agent", "category": "Video", "description": "Coordinates FFmpeg video rendering, aspect ratios, overlays, and transitions.", "status": "idle"},
    {"name": "Graphics & Thumbnail Agent", "category": "Creative", "description": "Generates high-contrast, brand-compliant social thumbnails and banners.", "status": "idle"},
    {"name": "Subtitle Agent", "category": "Audio", "description": "Transcribes speech and aligns timed SRT/VTT captions.", "status": "idle"},
    {"name": "SEO & Metadata Agent", "category": "Optimization", "description": "Generates search-optimized titles, descriptions, and tag sets.", "status": "idle"},
    {"name": "Quality Assurance Agent", "category": "Governance", "description": "Validates factual fidelity and ensures zero-hallucination standards.", "status": "idle"},
    {"name": "Publishing Agent", "category": "Distribution", "description": "Handles authorized OAuth social API publishing and captures post IDs.", "status": "idle"},
    {"name": "Analytics Agent", "category": "Measurement", "description": "Retrieves real performance telemetry from platform APIs.", "status": "idle"},
    {"name": "Growth Optimization Agent", "category": "Optimization", "description": "Analyzes conversion attribution and recommends campaign iterations.", "status": "idle"},
    {"name": "Brand & Compliance Agent", "category": "Governance", "description": "Enforces Charcoal & Copper palette, prohibited claim filtering, and disclaimers.", "status": "idle"}
]

class AgentRunOut(BaseModel):
    id: str
    organization_id: str
    agent_role: str
    product_id: str
    status: str
    duration_ms: int
    started_at: datetime
    class Config:
        from_attributes = True

@router.get("/roster")
async def get_agent_roster(
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org)
):
    return {
        "is_autonomous_paused": task_queue.is_paused,
        "scheduler_status": task_queue.get_status(),
        "agents": SPECIALIST_AGENT_ROSTER
    }

@router.get("/runs", response_model=List[AgentRunOut])
async def list_agent_runs(
    product_id: Optional[str] = None,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    query = select(AgentRun).where(AgentRun.organization_id == org.id)
    if product_id:
        query = query.where(AgentRun.product_id == product_id)
    result = await db.execute(query.order_by(AgentRun.started_at.desc()).limit(50))
    return result.scalars().all()

@router.post("/emergency-pause")
async def emergency_pause(
    request: Request,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(require_roles(["owner", "admin"])),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    org, membership = org_and_membership
    task_queue.pause_all()
    
    await record_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_type="user",
        action="AUTONOMOUS_OPERATIONS_PAUSED",
        resource_type="system",
        organization_id=org.id,
        details={"reason": "Emergency pause triggered by authorized operator"},
        ip_address=request.client.host if request.client else None
    )
    
    return {
        "message": "Autonomous marketing engine paused immediately.",
        "is_paused": True,
        "operator": current_user.email,
        "role": membership.role
    }

@router.post("/resume")
async def resume_autonomous(
    request: Request,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(require_roles(["owner", "admin"])),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    org, membership = org_and_membership
    task_queue.resume_all()

    await record_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_type="user",
        action="AUTONOMOUS_OPERATIONS_RESUMED",
        resource_type="system",
        organization_id=org.id,
        details={"reason": "Autonomous operations resumed by authorized operator"},
        ip_address=request.client.host if request.client else None
    )

    return {
        "message": "Autonomous marketing engine resumed.",
        "is_paused": False,
        "operator": current_user.email,
        "role": membership.role
    }
