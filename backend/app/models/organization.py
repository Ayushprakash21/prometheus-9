import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    products = relationship("Product", back_populates="organization", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False)
    tagline = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    website_url = Column(String(500), nullable=True)
    primary_objective = Column(String(100), nullable=False)  # awareness, leads, demos, registrations
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)
    
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
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    source_type = Column(String(50), nullable=False)  # website, doc, changelog, repository, manual
    url = Column(String(500), nullable=True)
    title = Column(String(255), nullable=False)
    raw_content = Column(Text, nullable=True)
    content_hash = Column(String(64), nullable=True)
    last_scanned_at = Column(DateTime(timezone=True), nullable=True)
    verification_status = Column(String(50), default="unverified")  # verified, unverified, failed
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    product = relationship("Product", back_populates="sources")

class ProductFeature(Base):
    __tablename__ = "product_features"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    benefit_statement = Column(Text, nullable=True)
    evidence_source_id = Column(String(36), ForeignKey("product_sources.id"), nullable=True)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    product = relationship("Product", back_populates="features")

class BrandProfile(Base):
    __tablename__ = "brand_profiles"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), unique=True, nullable=False, index=True)
    tone_of_voice = Column(String(255), default="Professional, Authoritative, Innovative")
    primary_color = Column(String(20), default="#A16C50")
    secondary_color = Column(String(20), default="#202221")
    accent_color = Column(String(20), default="#C9B49B")
    do_not_mention_claims = Column(JSON, default=list)  # blacklist of claims or topics
    mandatory_disclaimers = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)
    
    product = relationship("Product", back_populates="brand_profile")

class AudiencePersona(Base):
    __tablename__ = "audience_personas"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)  # e.g. "Operations Leader", "Job Seeker"
    role_description = Column(Text, nullable=True)
    pain_points = Column(JSON, default=list)
    desired_outcomes = Column(JSON, default=list)
    preferred_channels = Column(JSON, default=list)  # e.g. ["linkedin", "youtube"]
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    product = relationship("Product", back_populates="audiences")

class Competitor(Base):
    __tablename__ = "competitors"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    website_url = Column(String(500), nullable=True)
    positioning_summary = Column(Text, nullable=True)
    our_differentiators = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    product = relationship("Product", back_populates="competitors")
