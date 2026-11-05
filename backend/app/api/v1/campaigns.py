from typing import List, Optional, Tuple
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.database import get_db
from app.models.campaign import Campaign, ContentIdea, Script
from app.models.organization import Product
from app.models.system import User, Organization, OrganizationMembership
from app.core.exceptions import AppException
from app.security.dependencies import get_current_user, get_current_active_org, require_roles
from app.schemas.campaign import (
    CampaignOut, CampaignCreate, ContentIdeaOut, ContentIdeaCreate,
    ScriptOut, ScriptCreate
)

router = APIRouter(prefix="/campaigns", tags=["Campaigns & Content"])

@router.get("", response_model=List[CampaignOut])
async def list_campaigns(
    product_id: Optional[str] = None,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    query = select(Campaign).where(Campaign.organization_id == org.id)
    if product_id:
        query = query.where(Campaign.product_id == product_id)
    query = query.order_by(Campaign.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("", response_model=CampaignOut, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    payload: CampaignCreate,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(require_roles(["owner", "admin", "operator"])),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    stmt = select(Product).where(and_(Product.id == payload.product_id, Product.organization_id == org.id))
    prod = (await db.execute(stmt)).scalar_one_or_none()
    if not prod:
        raise AppException(
            status_code=404,
            error_code="PRODUCT_NOT_FOUND",
            message=f"Product '{payload.product_id}' not found in organization."
        )

    campaign = Campaign(
        organization_id=org.id,
        product_id=payload.product_id,
        title=payload.title,
        objective=payload.objective,
        status=payload.status,
        target_audience_id=payload.target_audience_id,
        budget_cap_cents=payload.budget_cap_cents
    )
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)
    return campaign

@router.get("/ideas", response_model=List[ContentIdeaOut])
async def list_ideas(
    product_id: Optional[str] = None,
    campaign_id: Optional[str] = None,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    query = select(ContentIdea).where(ContentIdea.organization_id == org.id)
    if product_id:
        query = query.where(ContentIdea.product_id == product_id)
    if campaign_id:
        query = query.where(ContentIdea.campaign_id == campaign_id)
    result = await db.execute(query.order_by(ContentIdea.created_at.desc()))
    return result.scalars().all()

@router.post("/ideas", response_model=ContentIdeaOut, status_code=status.HTTP_201_CREATED)
async def create_idea(
    payload: ContentIdeaCreate,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(require_roles(["owner", "admin", "operator"])),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    # Verify campaign & product belong to org
    stmt = select(Campaign).where(and_(Campaign.id == payload.campaign_id, Campaign.organization_id == org.id))
    camp = (await db.execute(stmt)).scalar_one_or_none()
    if not camp:
        raise AppException(status_code=404, error_code="CAMPAIGN_NOT_FOUND", message="Campaign not found in organization.")

    idea = ContentIdea(
        organization_id=org.id,
        campaign_id=payload.campaign_id,
        product_id=camp.product_id,
        title=payload.title,
        hook=payload.hook,
        format=payload.format,
        core_thesis=payload.core_thesis,
        rationale=payload.rationale,
        status="generated"
    )
    db.add(idea)
    await db.commit()
    await db.refresh(idea)
    return idea

@router.get("/scripts", response_model=List[ScriptOut])
async def list_scripts(
    product_id: Optional[str] = None,
    idea_id: Optional[str] = None,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    query = select(Script).where(Script.organization_id == org.id)
    if product_id:
        query = query.where(Script.product_id == product_id)
    if idea_id:
        query = query.where(Script.idea_id == idea_id)
    result = await db.execute(query.order_by(Script.created_at.desc()))
    return result.scalars().all()

@router.post("/scripts", response_model=ScriptOut, status_code=status.HTTP_201_CREATED)
async def create_script(
    payload: ScriptCreate,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(require_roles(["owner", "admin", "operator"])),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    stmt = select(ContentIdea).where(and_(ContentIdea.id == payload.idea_id, ContentIdea.organization_id == org.id))
    idea = (await db.execute(stmt)).scalar_one_or_none()
    if not idea:
        raise AppException(status_code=404, error_code="IDEA_NOT_FOUND", message="Content idea not found in organization.")

    script = Script(
        organization_id=org.id,
        idea_id=payload.idea_id,
        product_id=idea.product_id,
        title=payload.title,
        target_duration_seconds=payload.target_duration_seconds,
        hook_segment=payload.hook_segment,
        body_segment=payload.body_segment,
        cta_segment=payload.cta_segment,
        full_text=payload.full_text,
        visual_notes=payload.visual_notes,
        status="draft"
    )
    db.add(script)
    await db.commit()
    await db.refresh(script)
    return script
