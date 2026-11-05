from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.repositories.product import ProductRepository
from app.models.organization import (
    Product, ProductFeature, ProductSource, BrandProfile, AudiencePersona
)
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductOut, ProductDetailOut,
    ProductFeatureCreate, ProductSourceCreate, BrandProfileUpdate, AudiencePersonaCreate
)
from app.core.exceptions import NotFoundException, ConflictException, ForbiddenException
from app.services.audit import record_audit_event

class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ProductRepository(db)

    async def list_products(
        self,
        organization_id: str,
        status: Optional[str] = "active",
        category: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[ProductOut], int]:
        products, total = await self.repo.list_products(
            organization_id=organization_id,
            status=status,
            category=category,
            page=page,
            page_size=page_size
        )

        out_list = []
        for p in products:
            feats, srcs, camps = await self.repo.get_counts(p.id)
            out_list.append(ProductOut(
                id=p.id,
                organization_id=p.organization_id,
                name=p.name,
                slug=p.slug,
                category=p.category,
                tagline=p.tagline,
                description=p.description,
                website_url=p.website_url,
                primary_objective=p.primary_objective,
                status=p.status,
                is_active=p.is_active,
                created_at=p.created_at,
                updated_at=p.updated_at,
                features_count=feats,
                sources_count=srcs,
                campaigns_count=camps
            ))
        return out_list, total

    async def get_product(self, organization_id: str, identifier: str) -> ProductDetailOut:
        prod = await self.repo.get_by_id_or_slug(organization_id, identifier, include_details=True)
        if not prod:
            raise NotFoundException("Product", identifier)

        feats, srcs, camps = await self.repo.get_counts(prod.id)
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
            status=prod.status,
            is_active=prod.is_active,
            created_at=prod.created_at,
            updated_at=prod.updated_at,
            features_count=feats,
            sources_count=srcs,
            campaigns_count=camps,
            features=prod.features,
            sources=prod.sources,
            brand_profile=prod.brand_profile,
            audiences=prod.audiences
        )

    async def create_product(
        self,
        organization_id: str,
        actor_id: str,
        payload: ProductCreate,
        ip_address: Optional[str] = None
    ) -> ProductOut:
        existing = await self.repo.get_by_slug(organization_id, payload.slug)
        if existing:
            raise ConflictException(f"Product with slug '{payload.slug}' already exists in this organization.")

        prod = Product(
            organization_id=organization_id,
            name=payload.name,
            slug=payload.slug,
            category=payload.category,
            tagline=payload.tagline,
            description=payload.description,
            website_url=payload.website_url,
            primary_objective=payload.primary_objective,
            status="active",
            is_active=payload.is_active
        )
        created = await self.repo.create(prod)

        # Automatically create default brand profile
        brand = BrandProfile(
            organization_id=organization_id,
            product_id=created.id,
            tone_of_voice="Professional, Authoritative, Innovative",
            primary_color="#A16C50",
            secondary_color="#202221",
            accent_color="#C9B49B"
        )
        self.db.add(brand)
        await self.db.commit()

        await record_audit_event(
            db=self.db,
            actor_id=actor_id,
            actor_type="user",
            action="PRODUCT_CREATED",
            resource_type="product",
            resource_id=created.id,
            product_id=created.id,
            organization_id=organization_id,
            details={"name": created.name, "slug": created.slug, "category": created.category},
            ip_address=ip_address
        )

        return ProductOut(
            id=created.id,
            organization_id=created.organization_id,
            name=created.name,
            slug=created.slug,
            category=created.category,
            tagline=created.tagline,
            description=created.description,
            website_url=created.website_url,
            primary_objective=created.primary_objective,
            status=created.status,
            is_active=created.is_active,
            created_at=created.created_at,
            updated_at=created.updated_at,
            features_count=0,
            sources_count=0,
            campaigns_count=0
        )

    async def update_product(
        self,
        organization_id: str,
        identifier: str,
        actor_id: str,
        payload: ProductUpdate,
        ip_address: Optional[str] = None
    ) -> ProductOut:
        prod = await self.repo.get_by_id_or_slug(organization_id, identifier, include_details=False)
        if not prod:
            raise NotFoundException("Product", identifier)

        update_data = payload.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            setattr(prod, k, v)

        updated = await self.repo.update(prod)

        await record_audit_event(
            db=self.db,
            actor_id=actor_id,
            actor_type="user",
            action="PRODUCT_UPDATED",
            resource_type="product",
            resource_id=updated.id,
            product_id=updated.id,
            organization_id=organization_id,
            details={"updated_fields": list(update_data.keys())},
            ip_address=ip_address
        )

        feats, srcs, camps = await self.repo.get_counts(updated.id)
        return ProductOut(
            id=updated.id,
            organization_id=updated.organization_id,
            name=updated.name,
            slug=updated.slug,
            category=updated.category,
            tagline=updated.tagline,
            description=updated.description,
            website_url=updated.website_url,
            primary_objective=updated.primary_objective,
            status=updated.status,
            is_active=updated.is_active,
            created_at=updated.created_at,
            updated_at=updated.updated_at,
            features_count=feats,
            sources_count=srcs,
            campaigns_count=camps
        )

    async def archive_product(
        self,
        organization_id: str,
        identifier: str,
        actor_id: str,
        ip_address: Optional[str] = None
    ) -> ProductOut:
        archived = await self.repo.archive(organization_id, identifier)
        if not archived:
            raise NotFoundException("Product", identifier)

        await record_audit_event(
            db=self.db,
            actor_id=actor_id,
            actor_type="user",
            action="PRODUCT_ARCHIVED",
            resource_type="product",
            resource_id=archived.id,
            product_id=archived.id,
            organization_id=organization_id,
            details={"previous_status": "active", "new_status": "archived"},
            ip_address=ip_address
        )

        feats, srcs, camps = await self.repo.get_counts(archived.id)
        return ProductOut(
            id=archived.id,
            organization_id=archived.organization_id,
            name=archived.name,
            slug=archived.slug,
            category=archived.category,
            tagline=archived.tagline,
            description=archived.description,
            website_url=archived.website_url,
            primary_objective=archived.primary_objective,
            status=archived.status,
            is_active=archived.is_active,
            created_at=archived.created_at,
            updated_at=archived.updated_at,
            features_count=feats,
            sources_count=srcs,
            campaigns_count=camps
        )

    # --- Nested Feature Management ---
    async def add_feature(
        self,
        organization_id: str,
        product_identifier: str,
        actor_id: str,
        payload: ProductFeatureCreate
    ) -> ProductFeature:
        prod = await self.repo.get_by_id_or_slug(organization_id, product_identifier, include_details=False)
        if not prod:
            raise NotFoundException("Product", product_identifier)

        feat = ProductFeature(
            organization_id=organization_id,
            product_id=prod.id,
            name=payload.name,
            description=payload.description,
            benefit_statement=payload.benefit_statement,
            evidence_source_id=payload.evidence_source_id,
            is_verified=payload.is_verified
        )
        self.db.add(feat)
        await self.db.commit()
        await self.db.refresh(feat)

        await record_audit_event(
            db=self.db,
            actor_id=actor_id,
            actor_type="user",
            action="PRODUCT_FEATURE_ADDED",
            resource_type="product_feature",
            resource_id=feat.id,
            product_id=prod.id,
            organization_id=organization_id,
            details={"feature_name": feat.name}
        )
        return feat

    async def list_features(self, organization_id: str, product_identifier: str) -> List[ProductFeature]:
        prod = await self.repo.get_by_id_or_slug(organization_id, product_identifier, include_details=True)
        if not prod:
            raise NotFoundException("Product", product_identifier)
        return list(prod.features)

    # --- Nested Source Management ---
    async def add_source(
        self,
        organization_id: str,
        product_identifier: str,
        actor_id: str,
        payload: ProductSourceCreate
    ) -> ProductSource:
        prod = await self.repo.get_by_id_or_slug(organization_id, product_identifier, include_details=False)
        if not prod:
            raise NotFoundException("Product", product_identifier)

        src = ProductSource(
            organization_id=organization_id,
            product_id=prod.id,
            source_type=payload.source_type,
            url=payload.url,
            title=payload.title,
            raw_content=payload.raw_content,
            verification_status="verified" if payload.raw_content else "unverified"
        )
        self.db.add(src)
        await self.db.commit()
        await self.db.refresh(src)
        return src

    async def list_sources(self, organization_id: str, product_identifier: str) -> List[ProductSource]:
        prod = await self.repo.get_by_id_or_slug(organization_id, product_identifier, include_details=True)
        if not prod:
            raise NotFoundException("Product", product_identifier)
        return list(prod.sources)

    # --- Nested Brand Profile ---
    async def get_brand_profile(self, organization_id: str, product_identifier: str) -> BrandProfile:
        prod = await self.repo.get_by_id_or_slug(organization_id, product_identifier, include_details=True)
        if not prod:
            raise NotFoundException("Product", product_identifier)
        if not prod.brand_profile:
            # Create default if missing
            brand = BrandProfile(
                organization_id=organization_id,
                product_id=prod.id,
                tone_of_voice="Professional, Authoritative, Innovative",
                primary_color="#A16C50",
                secondary_color="#202221",
                accent_color="#C9B49B"
            )
            self.db.add(brand)
            await self.db.commit()
            await self.db.refresh(brand)
            return brand
        return prod.brand_profile

    async def update_brand_profile(
        self,
        organization_id: str,
        product_identifier: str,
        actor_id: str,
        payload: BrandProfileUpdate
    ) -> BrandProfile:
        brand = await self.get_brand_profile(organization_id, product_identifier)
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(brand, k, v)
        await self.db.commit()
        await self.db.refresh(brand)

        await record_audit_event(
            db=self.db,
            actor_id=actor_id,
            actor_type="user",
            action="BRAND_PROFILE_UPDATED",
            resource_type="brand_profile",
            resource_id=brand.id,
            product_id=brand.product_id,
            organization_id=organization_id
        )
        return brand

    # --- Nested Audience Personas ---
    async def add_audience(
        self,
        organization_id: str,
        product_identifier: str,
        actor_id: str,
        payload: AudiencePersonaCreate
    ) -> AudiencePersona:
        prod = await self.repo.get_by_id_or_slug(organization_id, product_identifier, include_details=False)
        if not prod:
            raise NotFoundException("Product", product_identifier)

        aud = AudiencePersona(
            organization_id=organization_id,
            product_id=prod.id,
            title=payload.title,
            role_description=payload.role_description,
            pain_points=payload.pain_points,
            desired_outcomes=payload.desired_outcomes,
            preferred_channels=payload.preferred_channels
        )
        self.db.add(aud)
        await self.db.commit()
        await self.db.refresh(aud)
        return aud

    async def list_audiences(self, organization_id: str, product_identifier: str) -> List[AudiencePersona]:
        prod = await self.repo.get_by_id_or_slug(organization_id, product_identifier, include_details=True)
        if not prod:
            raise NotFoundException("Product", product_identifier)
        return list(prod.audiences)
