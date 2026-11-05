from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.publishing import SocialAccount, PublishingJob, PublicationRecord
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/publishing", tags=["Social Publishing"])

class SocialAccountOut(BaseModel):
    id: str
    product_id: str
    platform: str
    account_name: str
    account_id_on_platform: Optional[str]
    authorization_status: str
    channel_url: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class PublicationRecordOut(BaseModel):
    id: str
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
    db: AsyncSession = Depends(get_db)
):
    query = select(SocialAccount)
    if product_id:
        query = query.where(SocialAccount.product_id == product_id)
    result = await db.execute(query.order_by(SocialAccount.platform.asc()))
    return result.scalars().all()

@router.get("/publications", response_model=List[PublicationRecordOut])
async def list_publications(
    product_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(PublicationRecord)
    if product_id:
        query = query.where(PublicationRecord.product_id == product_id)
    result = await db.execute(query.order_by(PublicationRecord.published_at.desc()))
    return result.scalars().all()
