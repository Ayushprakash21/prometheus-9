from typing import List, Optional, Tuple
from fastapi import APIRouter, Depends, UploadFile, File, Form, status, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from app.database import get_db
from app.config import settings
from app.models.campaign import MediaAsset
from app.models.organization import Product
from app.models.system import User, Organization, OrganizationMembership
from app.core.storage import storage_engine
from app.core.exceptions import AppException
from app.security.dependencies import get_current_user, get_current_active_org, require_roles
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/assets", tags=["Media & Asset Library"])

class MediaAssetOut(BaseModel):
    id: str
    organization_id: str
    product_id: str
    filename: str
    content_hash: str
    mime_type: str
    file_size_bytes: int
    asset_type: str
    licensing_status: str
    attribution_details: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

@router.get("", response_model=List[MediaAssetOut])
async def list_assets(
    product_id: Optional[str] = None,
    asset_type: Optional[str] = None,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    query = select(MediaAsset).where(MediaAsset.organization_id == org.id)
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
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(require_roles(["owner", "admin", "operator"])),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership

    # Verify product belongs strictly to authenticated user's active organization
    stmt = select(Product).where(and_(Product.id == product_id, Product.organization_id == org.id))
    prod = (await db.execute(stmt)).scalar_one_or_none()
    if not prod:
        raise AppException(
            status_code=404,
            error_code="PRODUCT_NOT_FOUND",
            message=f"Product '{product_id}' not found in active organization."
        )

    file_bytes = await file.read()
    filename = file.filename or "uploaded_asset"

    # Store file safely with magic-byte validation and traversal protection
    relative_path, content_hash, file_size = storage_engine.store_file(
        file_bytes=file_bytes,
        original_filename=filename,
        organization_id=org.id,
        product_id=prod.id
    )
    verified_mime, detected_type, _ = storage_engine.validate_file(file_bytes, filename)

    # Check for duplicate asset within the same product (content addressing)
    dup_stmt = select(MediaAsset).where(
        and_(
            MediaAsset.organization_id == org.id,
            MediaAsset.product_id == prod.id,
            MediaAsset.content_hash == content_hash
        )
    )
    existing_asset = (await db.execute(dup_stmt)).scalar_one_or_none()
    if existing_asset:
        return existing_asset

    asset = MediaAsset(
        organization_id=org.id,
        product_id=prod.id,
        filename=filename,
        file_path=relative_path,
        content_hash=content_hash,
        mime_type=verified_mime,
        file_size_bytes=file_size,
        asset_type=detected_type,
        licensing_status=licensing_status,
        attribution_details=attribution_details
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    return asset

@router.get("/{asset_id}/download")
async def download_asset(
    asset_id: str,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    stmt = select(MediaAsset).where(and_(MediaAsset.id == asset_id, MediaAsset.organization_id == org.id))
    asset = (await db.execute(stmt)).scalar_one_or_none()
    if not asset:
        raise AppException(
            status_code=404,
            error_code="ASSET_NOT_FOUND",
            message="Media asset not found in organization."
        )

    headers = {
        "Content-Disposition": f'inline; filename="{asset.filename}"',
        "Content-Length": str(asset.file_size_bytes),
        "X-Content-Type-Options": "nosniff"
    }

    return StreamingResponse(
        storage_engine.stream_file(asset.file_path),
        media_type=asset.mime_type,
        headers=headers
    )

@router.delete("/{asset_id}", status_code=status.HTTP_200_OK)
async def delete_asset(
    asset_id: str,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(require_roles(["owner", "admin", "operator"])),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    stmt = select(MediaAsset).where(and_(MediaAsset.id == asset_id, MediaAsset.organization_id == org.id))
    asset = (await db.execute(stmt)).scalar_one_or_none()
    if not asset:
        raise AppException(
            status_code=404,
            error_code="ASSET_NOT_FOUND",
            message="Media asset not found in organization."
        )

    file_path = asset.file_path
    await db.delete(asset)
    await db.commit()

    # Check if any other asset record still references the physical file
    ref_stmt = select(func.count(MediaAsset.id)).where(MediaAsset.file_path == file_path)
    remaining_refs = (await db.execute(ref_stmt)).scalar() or 0

    if remaining_refs == 0:
        storage_engine.delete_file_if_unreferenced(file_path)

    return {"message": "Asset deleted successfully", "asset_id": asset_id}
