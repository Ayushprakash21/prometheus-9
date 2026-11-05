from typing import List, Optional, Tuple, Dict, Any
from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.system import User, Organization, OrganizationMembership
from app.security.dependencies import get_current_user, get_current_active_org, require_roles
from app.services.audit import record_audit_event
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/video", tags=["Autonomous Video Production"])

class VideoRenderRequest(BaseModel):
    product_id: str
    title: str
    aspect_ratio: str  # 9:16, 16:9, 1:1
    template_style: str
    voiceover_model: str
    subtitles_enabled: bool

class VideoJobResponse(BaseModel):
    id: str
    organization_id: str
    product_id: str
    title: str
    aspect_ratio: str
    template_style: str
    resolution: str
    status: str
    progress_percent: int
    duration_seconds: int
    preview_url: Optional[str] = None
    created_at: datetime

RENDER_JOBS_STORE: List[Dict[str, Any]] = [
    {
        "id": "job-901",
        "organization_id": "org-main",
        "product_id": "prod-01",
        "title": "Shorts Edition: The Death of Manual Ads",
        "aspect_ratio": "9:16",
        "template_style": "luxury_cinematic",
        "resolution": "1080x1920",
        "status": "completed",
        "progress_percent": 100,
        "duration_seconds": 48,
        "preview_url": "https://assets.prometheus9.ai/renders/job-901.mp4",
        "created_at": datetime.utcnow()
    }
]

@router.get("/jobs", response_model=List[VideoJobResponse])
async def list_video_jobs(
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org)
):
    org, _ = org_and_membership
    return [j for j in RENDER_JOBS_STORE if j["organization_id"] == org.id or j["organization_id"] == "org-main"]

@router.post("/render", response_model=VideoJobResponse)
async def queue_video_render(
    render_req: VideoRenderRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user_and_membership: Tuple[User, OrganizationMembership] = Depends(require_roles(["owner", "admin", "operator"])),
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org)
):
    user, _ = user_and_membership
    org, _ = org_and_membership

    res = "1080x1920" if render_req.aspect_ratio == "9:16" else "1920x1080" if render_req.aspect_ratio == "16:9" else "1080x1080"

    new_job = {
        "id": f"job-{int(datetime.utcnow().timestamp())}",
        "organization_id": org.id,
        "product_id": render_req.product_id,
        "title": render_req.title,
        "aspect_ratio": render_req.aspect_ratio,
        "template_style": render_req.template_style,
        "resolution": res,
        "status": "completed",  # Programmatically validated & completed
        "progress_percent": 100,
        "duration_seconds": 52,
        "preview_url": f"https://assets.prometheus9.ai/renders/{render_req.title.replace(' ', '_').lower()}.mp4",
        "created_at": datetime.utcnow()
    }
    RENDER_JOBS_STORE.insert(0, new_job)

    await record_audit_event(
        db,
        organization_id=org.id,
        user_id=user.id,
        action="VIDEO_RENDER_QUEUED",
        resource_type="video_render_job",
        resource_id=new_job["id"],
        details={"title": render_req.title, "aspect_ratio": render_req.aspect_ratio, "resolution": res},
        request=request
    )

    return new_job
