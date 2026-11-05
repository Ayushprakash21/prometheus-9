from typing import List, Optional, Tuple
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.publishing import SocialAccount, PublishingJob, PublicationRecord
from app.models.system import Organization, OrganizationMembership
from app.security.dependencies import get_current_active_org
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/publishing", tags=["Social Publishing"])

class SocialAccountOut(BaseModel):
    id: str
    organization_id: str
    product_id: str
    platform: str
    account_name: str
    account_id_on_platform: Optional[str] = None
    authorization_status: str
    channel_url: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class PublicationRecordOut(BaseModel):
    id: str
    organization_id: str
    publishing_job_id: str
    product_id: str
    platform: str
    platform_post_id: str
    platform_post_url: str
    published_at: datetime
    verified_by_api: bool
    class Config:
        from_attributes = True

@router.get("/accounts", response_model=List[SocialAccountOut])
async def list_social_accounts(
    product_id: Optional[str] = None,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    query = select(SocialAccount).where(SocialAccount.organization_id == org.id)
    if product_id:
        query = query.where(SocialAccount.product_id == product_id)
    result = await db.execute(query.order_by(SocialAccount.platform.asc()))
    return result.scalars().all()

@router.get("/publications", response_model=List[PublicationRecordOut])
async def list_publications(
    product_id: Optional[str] = None,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    query = select(PublicationRecord).where(PublicationRecord.organization_id == org.id)
    if product_id:
        query = query.where(PublicationRecord.product_id == product_id)
    result = await db.execute(query.order_by(PublicationRecord.published_at.desc()))
    return result.scalars().all()
