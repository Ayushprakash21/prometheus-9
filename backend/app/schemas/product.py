from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# --- Product Features ---
class ProductFeatureBase(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=5)
    benefit_statement: Optional[str] = None
    is_verified: bool = True

class ProductFeatureCreate(ProductFeatureBase):
    evidence_source_id: Optional[str] = None

class ProductFeatureOut(ProductFeatureBase):
    id: str
    organization_id: str
    product_id: str
    evidence_source_id: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# --- Product Sources ---
class ProductSourceBase(BaseModel):
    source_type: str = Field(description="website, doc, changelog, repository, manual")
    url: Optional[str] = None
    title: str = Field(min_length=2, max_length=255)
    raw_content: Optional[str] = None

class ProductSourceCreate(ProductSourceBase):
    pass

class ProductSourceOut(ProductSourceBase):
    id: str
    organization_id: str
    product_id: str
    content_hash: Optional[str] = None
    last_scanned_at: Optional[datetime] = None
    verification_status: str
    created_at: datetime
    class Config:
        from_attributes = True

# --- Brand Profile ---
class BrandProfileBase(BaseModel):
    tone_of_voice: str = "Professional, Authoritative, Innovative"
    primary_color: str = "#A16C50"
    secondary_color: str = "#202221"
    accent_color: str = "#C9B49B"
    do_not_mention_claims: List[str] = []
    mandatory_disclaimers: List[str] = []

class BrandProfileUpdate(BaseModel):
    tone_of_voice: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    do_not_mention_claims: Optional[List[str]] = None
    mandatory_disclaimers: Optional[List[str]] = None

class BrandProfileOut(BrandProfileBase):
    id: str
    organization_id: str
    product_id: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# --- Audience Personas ---
class AudiencePersonaBase(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    role_description: Optional[str] = None
    pain_points: List[str] = []
    desired_outcomes: List[str] = []
    preferred_channels: List[str] = []

class AudiencePersonaCreate(AudiencePersonaBase):
    pass

class AudiencePersonaOut(AudiencePersonaBase):
    id: str
    organization_id: str
    product_id: str
    created_at: datetime
    class Config:
        from_attributes = True

# --- Products ---
class ProductBase(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    slug: str = Field(min_length=2, max_length=100, pattern=r"^[a-z0-9-]+$")
    category: str = Field(min_length=2, max_length=100)
    tagline: Optional[str] = None
    description: Optional[str] = None
    website_url: Optional[str] = None
    primary_objective: str = Field(description="awareness, leads, demos, registrations")
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    category: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    website_url: Optional[str] = None
    primary_objective: Optional[str] = None
    is_active: Optional[bool] = None

class ProductOut(ProductBase):
    id: str
    organization_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    features_count: int = 0
    sources_count: int = 0
    campaigns_count: int = 0
    class Config:
        from_attributes = True

class ProductDetailOut(ProductOut):
    features: List[ProductFeatureOut] = []
    sources: List[ProductSourceOut] = []
    brand_profile: Optional[BrandProfileOut] = None
    audiences: List[AudiencePersonaOut] = []
