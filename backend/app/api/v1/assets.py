from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.config import settings
from app.models.campaign import MediaAsset
from app.models.organization import Product
from app.core.storage import storage_engine
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/assets", tags=["Media & Asset Library"])

class MediaAssetOut(BaseModel):
    id: str
    product_id: str
    filename: str
    content_hash: str
    mime_type: str
    file_size_bytes: int
    asset_type: str
    licensing_status: str
    attribution_details: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

@router.get("", response_model=List[MediaAssetOut])
async def list_assets(
    product_id: Optional[str] = None,
    asset_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(MediaAsset)
    if product_id:
        query = query.where(MediaAsset.product_id == product_id)
    if asset_type:
        query = query.where(MediaAsset.asset_type == asset_type)
    result = await db.execute(query.order_by(MediaAsset.created_at.desc()))
    return result.scalars().all()

@router.post("/upload", response_model=MediaAssetOut, status_code=status.HTTP_201_CREATED)
async def upload_asset(
    product_id: str = Form(...),
    asset_type: str = Form("image"),
    licensing_status: str = Form("proprietary_product_asset"),
    attribution_details: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    prod = (await db.execute(select(Product).where(Product.id == product_id))).scalar_one_or_none()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    file_bytes = await file.read()
    if len(file_bytes) > settings.MAX_FILE_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds maximum allowed upload size")

    relative_path, content_hash, file_size = storage_engine.store_file(
        file_bytes=file_bytes,
        original_filename=file.filename or "uploaded_asset",
        product_slug=prod.slug
    )

    asset = MediaAsset(
        product_id=prod.id,
        filename=file.filename or "asset",
        file_path=relative_path,
        content_hash=content_hash,
        mime_type=file.content_type or "application/octet-stream",
        file_size_bytes=file_size,
        asset_type=asset_type,
        licensing_status=licensing_status,
        attribution_details=attribution_details
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    return asset

@router.get("/{asset_id}/download")
async def download_asset(asset_id: str, db: AsyncSession = Depends(get_db)):
    asset = (await db.execute(select(MediaAsset).where(MediaAsset.id == asset_id))).scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    file_path = settings.BASE_DIR / asset.file_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Physical file missing from storage")
    
    return FileResponse(
        path=str(file_path),
        filename=asset.filename,
        media_type=asset.mime_type
    )
