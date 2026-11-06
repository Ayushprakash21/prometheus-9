from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, and_, delete
from sqlalchemy.orm import selectinload
from app.models.organization import (
    Product, ProductFeature, ProductSource, BrandProfile, AudiencePersona
)
from app.models.campaign import Campaign

class ProductRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_products(
        self,
        organization_id: str,
        status: Optional[str] = "active",
        category: Optional[str] = None,
        page: int = 1,
        page_size: int = 50
    ) -> Tuple[List[Product], int]:
        filters = [Product.organization_id == organization_id]
        if status and status != "all":
            filters.append(Product.status == status)
        if category and category != "all":
            filters.append(Product.category == category)

        # Count total matching
        count_stmt = select(func.count(Product.id)).where(and_(*filters))
        count_res = await self.db.execute(count_stmt)
        total = count_res.scalar() or 0

        # Query paginated items
        offset = (page - 1) * page_size
        stmt = (
            select(Product)
            .where(and_(*filters))
            .order_by(Product.name.asc())
            .offset(offset)
            .limit(page_size)
        )
        result = await self.db.execute(stmt)
        products = result.scalars().all()
        return list(products), total

    async def get_by_id_or_slug(
        self,
        organization_id: str,
        identifier: str,
        include_details: bool = True
    ) -> Optional[Product]:
        stmt = select(Product).where(
            and_(
                Product.organization_id == organization_id,
                (Product.id == identifier) | (Product.slug == identifier)
            )
        )
        if include_details:
            stmt = stmt.options(
                selectinload(Product.features),
                selectinload(Product.sources),
                selectinload(Product.brand_profile),
                selectinload(Product.audiences)
            )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_slug(self, organization_id: str, slug: str) -> Optional[Product]:
        stmt = select(Product).where(
            and_(
                Product.organization_id == organization_id,
                Product.slug == slug
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, product: Product) -> Product:
        self.db.add(product)
        await self.db.commit()
        await self.db.refresh(product)
        return product

    async def update(self, product: Product) -> Product:
        await self.db.commit()
        await self.db.refresh(product)
        return product

    async def archive(self, organization_id: str, product_id: str) -> Optional[Product]:
        prod = await self.get_by_id_or_slug(organization_id, product_id, include_details=False)
        if not prod:
            return None
        prod.status = "archived"
        prod.is_active = False
        await self.db.commit()
        await self.db.refresh(prod)
        return prod

    async def delete(self, organization_id: str, product_id: str) -> bool:
        prod = await self.get_by_id_or_slug(organization_id, product_id, include_details=False)
        if not prod:
            return False
        await self.db.delete(prod)
        await self.db.commit()
        return True

    async def get_counts(self, product_id: str) -> Tuple[int, int, int]:
        feat_res = await self.db.execute(
            select(func.count(ProductFeature.id)).where(ProductFeature.product_id == product_id)
        )
        src_res = await self.db.execute(
            select(func.count(ProductSource.id)).where(ProductSource.product_id == product_id)
        )
        camp_res = await self.db.execute(
            select(func.count(Campaign.id)).where(Campaign.product_id == product_id)
        )
        return (feat_res.scalar() or 0, src_res.scalar() or 0, camp_res.scalar() or 0)

    # --- Nested Entity Lookups & Deletions ---
    async def get_feature(self, feature_id: str, product_id: str) -> Optional[ProductFeature]:
        stmt = select(ProductFeature).where(
            and_(ProductFeature.id == feature_id, ProductFeature.product_id == product_id)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def delete_feature(self, feature_id: str, product_id: str) -> bool:
        feat = await self.get_feature(feature_id, product_id)
        if not feat:
            return False
        await self.db.delete(feat)
        await self.db.commit()
        return True

    async def get_audience(self, audience_id: str, product_id: str) -> Optional[AudiencePersona]:
        stmt = select(AudiencePersona).where(
            and_(AudiencePersona.id == audience_id, AudiencePersona.product_id == product_id)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def delete_audience(self, audience_id: str, product_id: str) -> bool:
        aud = await self.get_audience(audience_id, product_id)
        if not aud:
            return False
        await self.db.delete(aud)
        await self.db.commit()
        return True

    async def get_source(self, source_id: str, product_id: str) -> Optional[ProductSource]:
        stmt = select(ProductSource).where(
            and_(ProductSource.id == source_id, ProductSource.product_id == product_id)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def delete_source(self, source_id: str, product_id: str) -> bool:
        src = await self.get_source(source_id, product_id)
        if not src:
            return False
        await self.db.delete(src)
        await self.db.commit()
        return True
