import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database.base import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    tagline = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    website_url = Column(String(500), nullable=True)
    logo_url = Column(String(500), nullable=True)
    primary_objective = Column(String(100), nullable=False)  # awareness, leads, demos, registrations
    status = Column(String(50), default="active", nullable=False, index=True)  # active, inactive, draft, archived
    is_active = Column(Boolean, default=True, nullable=False)
    target_market = Column(String(255), nullable=True)
    target_audience = Column(String(255), nullable=True)
    usp = Column(String(500), nullable=True)
    keywords = Column(JSON, default=list, nullable=True)
    launch_date = Column(String(50), nullable=True)
    additional_info = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)
    
    __table_args__ = (
        UniqueConstraint("organization_id", "slug", name="uq_org_product_slug"),
    )
    
    # Relationships
    organization = relationship("Organization", back_populates="products")
    sources = relationship("ProductSource", back_populates="product", cascade="all, delete-orphan")
    features = relationship("ProductFeature", back_populates="product", cascade="all, delete-orphan")
    brand_profile = relationship("BrandProfile", back_populates="product", uselist=False, cascade="all, delete-orphan")
    audiences = relationship("AudiencePersona", back_populates="product", cascade="all, delete-orphan")
    competitors = relationship("Competitor", back_populates="product", cascade="all, delete-orphan")

class ProductSource(Base):
    __tablename__ = "product_sources"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    source_type = Column(String(50), nullable=False)  # website, doc, changelog, repository, manual
    url = Column(String(500), nullable=True)
    title = Column(String(255), nullable=False)
    raw_content = Column(Text, nullable=True)
    content_hash = Column(String(64), nullable=True)
    last_scanned_at = Column(DateTime(timezone=True), nullable=True)
    verification_status = Column(String(50), default="unverified", nullable=False)  # verified, unverified, failed
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    
    product = relationship("Product", back_populates="sources")

class ProductFeature(Base):
    __tablename__ = "product_features"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    benefit_statement = Column(Text, nullable=True)
    category = Column(String(100), default="Core Capability", nullable=True)
    supporting_evidence = Column(Text, nullable=True)
    evidence_url = Column(String(500), nullable=True)
    evidence_source_id = Column(String(36), ForeignKey("product_sources.id", ondelete="SET NULL"), nullable=True)
    is_verified = Column(Boolean, default=True, nullable=False)
    verification_status = Column(String(50), default="verified", nullable=False)  # verified, pending, rejected
    verification_date = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    
    product = relationship("Product", back_populates="features")

class BrandProfile(Base):
    __tablename__ = "brand_profiles"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    brand_name = Column(String(255), nullable=True)
    brand_description = Column(Text, nullable=True)
    industry = Column(String(100), nullable=True)
    website_url = Column(String(500), nullable=True)
    logo_url = Column(String(500), nullable=True)
    mission = Column(Text, nullable=True)
    vision = Column(Text, nullable=True)
    values = Column(JSON, default=list, nullable=True)
    personality = Column(String(255), nullable=True)
    tone_of_voice = Column(String(255), default="Professional, Authoritative, Innovative", nullable=False)
    writing_style = Column(String(255), nullable=True)
    preferred_vocabulary = Column(JSON, default=list, nullable=True)
    words_to_avoid = Column(JSON, default=list, nullable=True)
    brand_guidelines = Column(Text, nullable=True)
    typography = Column(JSON, default=dict, nullable=True)
    target_market = Column(String(255), nullable=True)
    primary_color = Column(String(20), default="#C9B49B", nullable=False)
    secondary_color = Column(String(20), default="#292B29", nullable=False)
    accent_color = Column(String(20), default="#E9DFD2", nullable=False)
    do_not_mention_claims = Column(JSON, default=list, nullable=False)  # blacklist of claims or topics
    mandatory_disclaimers = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)
    
    product = relationship("Product", back_populates="brand_profile")

class AudiencePersona(Base):
    __tablename__ = "audience_personas"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)  # e.g. "Operations Leader", "Job Seeker"
    role_description = Column(Text, nullable=True)
    age_range = Column(String(50), nullable=True)
    gender = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    occupation = Column(String(255), nullable=True)
    income_range = Column(String(50), nullable=True)
    interests = Column(JSON, default=list, nullable=True)
    pain_points = Column(JSON, default=list, nullable=False)
    desired_outcomes = Column(JSON, default=list, nullable=False)
    needs = Column(JSON, default=list, nullable=True)
    buying_behaviour = Column(Text, nullable=True)
    preferred_channels = Column(JSON, default=list, nullable=False)
    motivations = Column(JSON, default=list, nullable=True)
    objections = Column(JSON, default=list, nullable=True)
    content_preferences = Column(JSON, default=list, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    
    product = relationship("Product", back_populates="audiences")

class Competitor(Base):
    __tablename__ = "competitors"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    website_url = Column(String(500), nullable=True)
    positioning_summary = Column(Text, nullable=True)
    our_differentiators = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    
    product = relationship("Product", back_populates="competitors")
