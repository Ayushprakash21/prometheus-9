from typing import List, Optional, Tuple, Dict, Any
import re
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.repositories.product import ProductRepository
from app.models.organization import (
    Product, ProductFeature, ProductSource, BrandProfile, AudiencePersona
)
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductOut, ProductDetailOut,
    ProductFeatureCreate, ProductFeatureUpdate, ProductFeatureOut,
    ProductSourceCreate, ProductSourceUpdate, ProductSourceOut,
    BrandProfileUpdate, BrandProfileOut,
    AudiencePersonaCreate, AudiencePersonaUpdate, AudiencePersonaOut
)
from app.core.exceptions import NotFoundException, ConflictException, ForbiddenException
from app.services.audit import record_audit_event

def slugify(text: str) -> str:
    text = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"[-\s]+", "-", text) or "product"

class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ProductRepository(db)

    def _to_product_out(self, p: Product, feats: int = 0, srcs: int = 0, camps: int = 0) -> ProductOut:
        return ProductOut(
            id=p.id,
            organization_id=p.organization_id,
            name=p.name,
            slug=p.slug,
            category=p.category,
            tagline=p.tagline,
            description=p.description,
            website_url=p.website_url,
            logo_url=p.logo_url,
            primary_objective=p.primary_objective,
            status=p.status,
            is_active=p.is_active,
            target_market=p.target_market,
            target_audience=p.target_audience,
            usp=p.usp,
            keywords=p.keywords or [],
            launch_date=p.launch_date,
            additional_info=p.additional_info,
            created_at=p.created_at,
            updated_at=p.updated_at,
            features_count=feats,
            sources_count=srcs,
            campaigns_count=camps
        )

    async def list_products(
        self,
        organization_id: str,
        status: Optional[str] = None,
        category: Optional[str] = None,
        page: int = 1,
        page_size: int = 50
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
            out_list.append(self._to_product_out(p, feats, srcs, camps))
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
            logo_url=prod.logo_url,
            primary_objective=prod.primary_objective,
            status=prod.status,
            is_active=prod.is_active,
            target_market=prod.target_market,
            target_audience=prod.target_audience,
            usp=prod.usp,
            keywords=prod.keywords or [],
            launch_date=prod.launch_date,
            additional_info=prod.additional_info,
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
        if payload.slug:
            existing = await self.repo.get_by_slug(organization_id, payload.slug)
            if existing:
                raise ConflictException(f"Product with slug '{payload.slug}' already exists in this organization.")
            candidate_slug = payload.slug
        else:
            base_slug = slugify(payload.name)
            candidate_slug = base_slug
            existing = await self.repo.get_by_slug(organization_id, candidate_slug)
            if existing:
                candidate_slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"

        prod = Product(
            organization_id=organization_id,
            name=payload.name,
            slug=candidate_slug,
            category=payload.category,
            tagline=payload.tagline,
            description=payload.description,
            website_url=payload.website_url,
            logo_url=payload.logo_url,
            primary_objective=payload.primary_objective or "autonomous_growth",
            status=payload.status or "active",
            is_active=payload.is_active,
            target_market=payload.target_market,
            target_audience=payload.target_audience,
            usp=payload.usp,
            keywords=payload.keywords or [],
            launch_date=payload.launch_date,
            additional_info=payload.additional_info
        )
        created = await self.repo.create(prod)

        # Create default brand profile
        brand = BrandProfile(
            organization_id=organization_id,
            product_id=created.id,
            brand_name=created.name,
            brand_description=created.description,
            industry=created.category,
            website_url=created.website_url,
            logo_url=created.logo_url,
            tone_of_voice="Professional, Authoritative, Innovative",
            primary_color="#C9B49B",
            secondary_color="#292B29",
            accent_color="#E9DFD2"
        )
        self.db.add(brand)

        # If features were passed, create them as ProductFeature items
        if payload.features:
            for feat_name in payload.features:
                if feat_name and feat_name.strip():
                    f_item = ProductFeature(
                        organization_id=organization_id,
                        product_id=created.id,
                        name=feat_name.strip(),
                        description=f"Core capability of {created.name}",
                        category="Core Capability",
                        is_verified=True,
                        verification_status="verified",
                        verification_date=datetime.now(timezone.utc)
                    )
                    self.db.add(f_item)

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

        feats, srcs, camps = await self.repo.get_counts(created.id)
        return self._to_product_out(created, feats, srcs, camps)

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
        return self._to_product_out(updated, feats, srcs, camps)

    async def duplicate_product(
        self,
        organization_id: str,
        product_id: str,
        actor_id: str,
        ip_address: Optional[str] = None
    ) -> ProductOut:
        prod = await self.repo.get_by_id_or_slug(organization_id, product_id, include_details=True)
        if not prod:
            raise NotFoundException("Product", product_id)

        copy_name = f"{prod.name} (Copy)"
        copy_slug = f"{slugify(copy_name)}-{uuid.uuid4().hex[:6]}"

        new_prod = Product(
            organization_id=organization_id,
            name=copy_name,
            slug=copy_slug,
            category=prod.category,
            tagline=prod.tagline,
            description=prod.description,
            website_url=prod.website_url,
            logo_url=prod.logo_url,
            primary_objective=prod.primary_objective,
            status="draft",
            is_active=True,
            target_market=prod.target_market,
            target_audience=prod.target_audience,
            usp=prod.usp,
            keywords=prod.keywords or [],
            launch_date=prod.launch_date,
            additional_info=prod.additional_info
        )
        created = await self.repo.create(new_prod)

        # Duplicate brand profile
        if prod.brand_profile:
            bp = prod.brand_profile
            new_bp = BrandProfile(
                organization_id=organization_id,
                product_id=created.id,
                brand_name=copy_name,
                brand_description=bp.brand_description,
                industry=bp.industry,
                website_url=bp.website_url,
                logo_url=bp.logo_url,
                mission=bp.mission,
                vision=bp.vision,
                values=bp.values or [],
                personality=bp.personality,
                tone_of_voice=bp.tone_of_voice,
                writing_style=bp.writing_style,
                preferred_vocabulary=bp.preferred_vocabulary or [],
                words_to_avoid=bp.words_to_avoid or [],
                brand_guidelines=bp.brand_guidelines,
                typography=bp.typography or {},
                target_market=bp.target_market,
                primary_color=bp.primary_color,
                secondary_color=bp.secondary_color,
                accent_color=bp.accent_color,
                do_not_mention_claims=bp.do_not_mention_claims or [],
                mandatory_disclaimers=bp.mandatory_disclaimers or []
            )
            self.db.add(new_bp)

        # Duplicate features
        for f in prod.features:
            new_f = ProductFeature(
                organization_id=organization_id,
                product_id=created.id,
                name=f.name,
                description=f.description,
                benefit_statement=f.benefit_statement,
                category=f.category,
                supporting_evidence=f.supporting_evidence,
                evidence_url=f.evidence_url,
                is_verified=f.is_verified,
                verification_status=f.verification_status,
                verification_date=f.verification_date,
                notes=f.notes
            )
            self.db.add(new_f)

        # Duplicate audiences
        for a in prod.audiences:
            new_a = AudiencePersona(
                organization_id=organization_id,
                product_id=created.id,
                title=a.title,
                role_description=a.role_description,
                age_range=a.age_range,
                gender=a.gender,
                location=a.location,
                occupation=a.occupation,
                income_range=a.income_range,
                interests=a.interests or [],
                pain_points=a.pain_points or [],
                desired_outcomes=a.desired_outcomes or [],
                needs=a.needs or [],
                buying_behaviour=a.buying_behaviour,
                preferred_channels=a.preferred_channels or [],
                motivations=a.motivations or [],
                objections=a.objections or [],
                content_preferences=a.content_preferences or []
            )
            self.db.add(new_a)

        await self.db.commit()

        await record_audit_event(
            db=self.db,
            actor_id=actor_id,
            actor_type="user",
            action="PRODUCT_DUPLICATED",
            resource_type="product",
            resource_id=created.id,
            product_id=created.id,
            organization_id=organization_id,
            details={"original_id": product_id, "new_name": copy_name},
            ip_address=ip_address
        )

        feats, srcs, camps = await self.repo.get_counts(created.id)
        return self._to_product_out(created, feats, srcs, camps)

    async def delete_product(
        self,
        organization_id: str,
        product_id: str,
        actor_id: str,
        soft: bool = True,
        ip_address: Optional[str] = None
    ) -> bool:
        prod = await self.repo.get_by_id_or_slug(organization_id, product_id, include_details=False)
        if not prod:
            raise NotFoundException("Product", product_id)

        if soft:
            prod.status = "archived"
            prod.is_active = False
            await self.repo.update(prod)
        else:
            await self.repo.delete(organization_id, prod.id)

        await record_audit_event(
            db=self.db,
            actor_id=actor_id,
            actor_type="user",
            action="PRODUCT_DELETED" if not soft else "PRODUCT_ARCHIVED",
            resource_type="product",
            resource_id=prod.id,
            product_id=prod.id,
            organization_id=organization_id,
            details={"name": prod.name, "soft_deleted": soft},
            ip_address=ip_address
        )
        return True

    async def archive_product(
        self,
        organization_id: str,
        identifier: str,
        actor_id: str,
        ip_address: Optional[str] = None
    ) -> ProductOut:
        prod = await self.repo.archive(organization_id, identifier)
        if not prod:
            raise NotFoundException("Product", identifier)

        await record_audit_event(
            db=self.db,
            actor_id=actor_id,
            actor_type="user",
            action="PRODUCT_ARCHIVED",
            resource_type="product",
            resource_id=prod.id,
            product_id=prod.id,
            organization_id=organization_id,
            details={"status": "archived"},
            ip_address=ip_address
        )
        feats, srcs, camps = await self.repo.get_counts(prod.id)
        return self._to_product_out(prod, feats, srcs, camps)

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
            category=payload.category or "Core Capability",
            supporting_evidence=payload.supporting_evidence,
            evidence_url=payload.evidence_url,
            evidence_source_id=payload.evidence_source_id,
            is_verified=payload.is_verified,
            verification_status=payload.verification_status or "verified",
            verification_date=payload.verification_date or (datetime.now(timezone.utc) if payload.is_verified else None),
            notes=payload.notes
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

    async def update_feature(
        self,
        organization_id: str,
        product_identifier: str,
        feature_id: str,
        actor_id: str,
        payload: ProductFeatureUpdate
    ) -> ProductFeature:
        prod = await self.repo.get_by_id_or_slug(organization_id, product_identifier, include_details=False)
        if not prod:
            raise NotFoundException("Product", product_identifier)

        feat = await self.repo.get_feature(feature_id, prod.id)
        if not feat:
            raise NotFoundException("ProductFeature", feature_id)

        update_data = payload.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            setattr(feat, k, v)

        if "is_verified" in update_data:
            if update_data["is_verified"] and not feat.verification_date:
                feat.verification_date = datetime.now(timezone.utc)

        await self.db.commit()
        await self.db.refresh(feat)
        return feat

    async def delete_feature(
        self,
        organization_id: str,
        product_identifier: str,
        feature_id: str,
        actor_id: str
    ) -> bool:
        prod = await self.repo.get_by_id_or_slug(organization_id, product_identifier, include_details=False)
        if not prod:
            raise NotFoundException("Product", product_identifier)

        success = await self.repo.delete_feature(feature_id, prod.id)
        if not success:
            raise NotFoundException("ProductFeature", feature_id)
        return True

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

    async def update_source(
        self,
        organization_id: str,
        product_identifier: str,
        source_id: str,
        actor_id: str,
        payload: ProductSourceUpdate
    ) -> ProductSource:
        prod = await self.repo.get_by_id_or_slug(organization_id, product_identifier, include_details=False)
        if not prod:
            raise NotFoundException("Product", product_identifier)

        src = await self.repo.get_source(source_id, prod.id)
        if not src:
            raise NotFoundException("ProductSource", source_id)

        update_data = payload.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            setattr(src, k, v)

        await self.db.commit()
        await self.db.refresh(src)
        return src

    async def delete_source(
        self,
        organization_id: str,
        product_identifier: str,
        source_id: str,
        actor_id: str
    ) -> bool:
        prod = await self.repo.get_by_id_or_slug(organization_id, product_identifier, include_details=False)
        if not prod:
            raise NotFoundException("Product", product_identifier)

        success = await self.repo.delete_source(source_id, prod.id)
        if not success:
            raise NotFoundException("ProductSource", source_id)
        return True

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
            brand = BrandProfile(
                organization_id=organization_id,
                product_id=prod.id,
                brand_name=prod.name,
                brand_description=prod.description,
                industry=prod.category,
                website_url=prod.website_url,
                logo_url=prod.logo_url,
                tone_of_voice="Professional, Authoritative, Innovative",
                primary_color="#C9B49B",
                secondary_color="#292B29",
                accent_color="#E9DFD2"
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
            age_range=payload.age_range,
            gender=payload.gender,
            location=payload.location,
            occupation=payload.occupation,
            income_range=payload.income_range,
            interests=payload.interests or [],
            pain_points=payload.pain_points or [],
            desired_outcomes=payload.desired_outcomes or [],
            needs=payload.needs or [],
            buying_behaviour=payload.buying_behaviour,
            preferred_channels=payload.preferred_channels or [],
            motivations=payload.motivations or [],
            objections=payload.objections or [],
            content_preferences=payload.content_preferences or []
        )
        self.db.add(aud)
        await self.db.commit()
        await self.db.refresh(aud)
        return aud

    async def update_audience(
        self,
        organization_id: str,
        product_identifier: str,
        audience_id: str,
        actor_id: str,
        payload: AudiencePersonaUpdate
    ) -> AudiencePersona:
        prod = await self.repo.get_by_id_or_slug(organization_id, product_identifier, include_details=False)
        if not prod:
            raise NotFoundException("Product", product_identifier)

        aud = await self.repo.get_audience(audience_id, prod.id)
        if not aud:
            raise NotFoundException("AudiencePersona", audience_id)

        update_data = payload.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            setattr(aud, k, v)

        await self.db.commit()
        await self.db.refresh(aud)
        return aud

    async def delete_audience(
        self,
        organization_id: str,
        product_identifier: str,
        audience_id: str,
        actor_id: str
    ) -> bool:
        prod = await self.repo.get_by_id_or_slug(organization_id, product_identifier, include_details=False)
        if not prod:
            raise NotFoundException("Product", product_identifier)

        success = await self.repo.delete_audience(audience_id, prod.id)
        if not success:
            raise NotFoundException("AudiencePersona", audience_id)
        return True

    async def list_audiences(self, organization_id: str, product_identifier: str) -> List[AudiencePersona]:
        prod = await self.repo.get_by_id_or_slug(organization_id, product_identifier, include_details=True)
        if not prod:
            raise NotFoundException("Product", product_identifier)
        return list(prod.audiences)
