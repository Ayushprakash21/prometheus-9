from typing import List, Optional, Tuple
from fastapi import APIRouter, Depends, Request, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.models.system import User, Organization, OrganizationMembership
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductOut, ProductDetailOut,
    ProductFeatureCreate, ProductFeatureOut,
    ProductSourceCreate, ProductSourceOut,
    BrandProfileUpdate, BrandProfileOut,
    AudiencePersonaCreate, AudiencePersonaOut
)
from app.schemas.common import PaginatedResponse
from app.services.product import ProductService
from app.security.dependencies import get_current_user, get_current_active_org, require_roles

router = APIRouter(prefix="/products", tags=["Product Registry & Management"])

@router.get("", response_model=PaginatedResponse[ProductOut])
async def list_products(
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(default="active", description="active, archived, or null for all"),
    category: Optional[str] = Query(default=None, description="Filter by category"),
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    service = ProductService(db)
    items, total = await service.list_products(
        organization_id=org.id,
        status=status,
        category=category,
        page=page,
        page_size=page_size
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    request: Request,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(require_roles(["owner", "admin"])),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    service = ProductService(db)
    return await service.create_product(
        organization_id=org.id,
        actor_id=current_user.id,
        payload=payload,
        ip_address=request.client.host if request.client else None
    )

@router.get("/{product_id}", response_model=ProductDetailOut)
async def get_product(
    product_id: str,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    service = ProductService(db)
    return await service.get_product(
        organization_id=org.id,
        identifier=product_id
    )

@router.patch("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: str,
    payload: ProductUpdate,
    request: Request,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(require_roles(["owner", "admin"])),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    service = ProductService(db)
    return await service.update_product(
        organization_id=org.id,
        identifier=product_id,
        actor_id=current_user.id,
        payload=payload,
        ip_address=request.client.host if request.client else None
    )

@router.post("/{product_id}/archive", response_model=ProductOut)
async def archive_product(
    product_id: str,
    request: Request,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(require_roles(["owner", "admin"])),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    service = ProductService(db)
    return await service.archive_product(
        organization_id=org.id,
        identifier=product_id,
        actor_id=current_user.id,
        ip_address=request.client.host if request.client else None
    )

# --- Nested Features Management ---

@router.get("/{product_id}/features", response_model=List[ProductFeatureOut])
async def list_product_features(
    product_id: str,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    service = ProductService(db)
    return await service.list_features(organization_id=org.id, product_identifier=product_id)

@router.post("/{product_id}/features", response_model=ProductFeatureOut, status_code=status.HTTP_201_CREATED)
async def add_product_feature(
    product_id: str,
    payload: ProductFeatureCreate,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(require_roles(["owner", "admin"])),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    service = ProductService(db)
    return await service.add_feature(
        organization_id=org.id,
        product_identifier=product_id,
        actor_id=current_user.id,
        payload=payload
    )

# --- Nested Sources Management ---

@router.get("/{product_id}/sources", response_model=List[ProductSourceOut])
async def list_product_sources(
    product_id: str,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    service = ProductService(db)
    return await service.list_sources(organization_id=org.id, product_identifier=product_id)

@router.post("/{product_id}/sources", response_model=ProductSourceOut, status_code=status.HTTP_201_CREATED)
async def add_product_source(
    product_id: str,
    payload: ProductSourceCreate,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(require_roles(["owner", "admin"])),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    service = ProductService(db)
    return await service.add_source(
        organization_id=org.id,
        product_identifier=product_id,
        actor_id=current_user.id,
        payload=payload
    )

# --- Nested Brand Profile ---

@router.get("/{product_id}/brand-profile", response_model=BrandProfileOut)
async def get_brand_profile(
    product_id: str,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    service = ProductService(db)
    return await service.get_brand_profile(organization_id=org.id, product_identifier=product_id)

@router.put("/{product_id}/brand-profile", response_model=BrandProfileOut)
async def update_brand_profile(
    product_id: str,
    payload: BrandProfileUpdate,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(require_roles(["owner", "admin"])),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    service = ProductService(db)
    return await service.update_brand_profile(
        organization_id=org.id,
        product_identifier=product_id,
        actor_id=current_user.id,
        payload=payload
    )

# --- Nested Audience Personas ---

@router.get("/{product_id}/audiences", response_model=List[AudiencePersonaOut])
async def list_audiences(
    product_id: str,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    service = ProductService(db)
    return await service.list_audiences(organization_id=org.id, product_identifier=product_id)

@router.post("/{product_id}/audiences", response_model=AudiencePersonaOut, status_code=status.HTTP_201_CREATED)
async def add_audience(
    product_id: str,
    payload: AudiencePersonaCreate,
    org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(require_roles(["owner", "admin"])),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    org, _ = org_and_membership
    service = ProductService(db)
    return await service.add_audience(
        organization_id=org.id,
        product_identifier=product_id,
        actor_id=current_user.id,
        payload=payload
    )
