from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.campaign import Campaign, ContentIdea, Script
from app.models.organization import Product
from app.schemas.campaign import (
    CampaignOut, CampaignCreate, ContentIdeaOut, ContentIdeaCreate,
    ScriptOut, ScriptCreate
)

router = APIRouter(prefix="/campaigns", tags=["Campaigns & Content"])

@router.get("", response_model=List[CampaignOut])
async def list_campaigns(
    product_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Campaign)
    if product_id:
        query = query.where(Campaign.product_id == product_id)
    query = query.order_by(Campaign.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("", response_model=CampaignOut, status_code=status.HTTP_201_CREATED)
async def create_campaign(payload: CampaignCreate, db: AsyncSession = Depends(get_db)):
    prod = (await db.execute(select(Product).where(Product.id == payload.product_id))).scalar_one_or_none()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    campaign = Campaign(
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
    db: AsyncSession = Depends(get_db)
):
    query = select(ContentIdea)
    if product_id:
        query = query.where(ContentIdea.product_id == product_id)
    if campaign_id:
        query = query.where(ContentIdea.campaign_id == campaign_id)
    result = await db.execute(query.order_by(ContentIdea.created_at.desc()))
    return result.scalars().all()

@router.get("/scripts", response_model=List[ScriptOut])
async def list_scripts(
    product_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Script)
    if product_id:
        query = query.where(Script.product_id == product_id)
    result = await db.execute(query.order_by(Script.created_at.desc()))
    return result.scalars().all()
