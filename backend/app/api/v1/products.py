from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.organization import (
    Organization, Product, ProductFeature, BrandProfile,
    AudiencePersona, Competitor, ProductSource
)
from app.models.campaign import Campaign
from app.schemas.product import (
    ProductOut, ProductDetailOut, ProductCreate,
    ProductFeatureCreate, ProductFeatureOut
)

router = APIRouter(prefix="/products", tags=["Products & Registry"])

@router.get("", response_model=List[ProductOut])
async def list_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product).order_by(Product.name.asc())
    )
    products = result.scalars().all()
    
    # Enrich counts
    enriched = []
    for prod in products:
        feat_res = await db.execute(select(func.count(ProductFeature.id)).where(ProductFeature.product_id == prod.id))
        src_res = await db.execute(select(func.count(ProductSource.id)).where(ProductSource.product_id == prod.id))
        camp_res = await db.execute(select(func.count(Campaign.id)).where(Campaign.product_id == prod.id))
        
        prod_dict = {
            "id": prod.id,
            "organization_id": prod.organization_id,
            "name": prod.name,
            "slug": prod.slug,
            "category": prod.category,
            "tagline": prod.tagline,
            "description": prod.description,
            "website_url": prod.website_url,
            "primary_objective": prod.primary_objective,
            "is_active": prod.is_active,
            "created_at": prod.created_at,
            "updated_at": prod.updated_at,
            "features_count": feat_res.scalar() or 0,
            "sources_count": src_res.scalar() or 0,
            "campaigns_count": camp_res.scalar() or 0,
        }
        enriched.append(ProductOut(**prod_dict))
    return enriched

@router.get("/{product_id}", response_model=ProductDetailOut)
async def get_product_detail(product_id: str, db: AsyncSession = Depends(get_db)):
    query = (
        select(Product)
        .where((Product.id == product_id) | (Product.slug == product_id))
        .options(
            selectinload(Product.features),
            selectinload(Product.brand_profile),
            selectinload(Product.audiences),
            selectinload(Product.competitors)
        )
    )
    result = await db.execute(query)
    prod = result.scalar_one_or_none()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    feat_res = await db.execute(select(func.count(ProductFeature.id)).where(ProductFeature.product_id == prod.id))
    src_res = await db.execute(select(func.count(ProductSource.id)).where(ProductSource.product_id == prod.id))
    camp_res = await db.execute(select(func.count(Campaign.id)).where(Campaign.product_id == prod.id))

    return ProductDetailOut(
        id=prod.id,
        organization_id=prod.organization_id,
        name=prod.name,
        slug=prod.slug,
        category=prod.category,
        tagline=prod.tagline,
        description=prod.description,
        website_url=prod.website_url,
        primary_objective=prod.primary_objective,
        is_active=prod.is_active,
        created_at=prod.created_at,
        updated_at=prod.updated_at,
        features_count=feat_res.scalar() or 0,
        sources_count=src_res.scalar() or 0,
        campaigns_count=camp_res.scalar() or 0,
        features=prod.features,
        brand_profile=prod.brand_profile,
        audiences=prod.audiences
    )

@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreate, db: AsyncSession = Depends(get_db)):
    # Find or create default organization
    org_res = await db.execute(select(Organization).where(Organization.slug == payload.organization_slug))
    org = org_res.scalar_one_or_none()
    if not org:
        org = Organization(name="PROMETHEUS-9 Master Org", slug=payload.organization_slug)
        db.add(org)
        await db.commit()
        await db.refresh(org)

    # Check for duplicate slug
    slug_res = await db.execute(select(Product).where(Product.slug == payload.slug))
    if slug_res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Product slug '{payload.slug}' already exists")

    new_prod = Product(
        organization_id=org.id,
        name=payload.name,
        slug=payload.slug,
        category=payload.category,
        tagline=payload.tagline,
        description=payload.description,
        website_url=payload.website_url,
        primary_objective=payload.primary_objective,
        is_active=payload.is_active
    )
    db.add(new_prod)
    await db.commit()
    await db.refresh(new_prod)
    
    return ProductOut(
        id=new_prod.id,
        organization_id=new_prod.organization_id,
        name=new_prod.name,
        slug=new_prod.slug,
        category=new_prod.category,
        tagline=new_prod.tagline,
        description=new_prod.description,
        website_url=new_prod.website_url,
        primary_objective=new_prod.primary_objective,
        is_active=new_prod.is_active,
        created_at=new_prod.created_at,
        updated_at=new_prod.updated_at,
        features_count=0,
        sources_count=0,
        campaigns_count=0
    )

@router.post("/{product_id}/features", response_model=ProductFeatureOut, status_code=status.HTTP_201_CREATED)
async def add_product_feature(
    product_id: str,
    payload: ProductFeatureCreate,
    db: AsyncSession = Depends(get_db)
):
    prod = (await db.execute(select(Product).where(Product.id == product_id))).scalar_one_or_none()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    feature = ProductFeature(
        product_id=prod.id,
        name=payload.name,
        description=payload.description,
        benefit_statement=payload.benefit_statement,
        is_verified=payload.is_verified
    )
    db.add(feature)
    await db.commit()
    await db.refresh(feature)
    return feature
