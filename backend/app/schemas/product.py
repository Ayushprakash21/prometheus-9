from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# --- Product Features (Verified Capabilities) ---
class ProductFeatureBase(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=2)
    benefit_statement: Optional[str] = None
    category: Optional[str] = "Core Capability"
    supporting_evidence: Optional[str] = None
    evidence_url: Optional[str] = None
    is_verified: bool = True
    verification_status: Optional[str] = "verified"  # verified, pending, rejected
    verification_date: Optional[datetime] = None
    notes: Optional[str] = None

class ProductFeatureCreate(ProductFeatureBase):
    evidence_source_id: Optional[str] = None

class ProductFeatureUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    benefit_statement: Optional[str] = None
    category: Optional[str] = None
    supporting_evidence: Optional[str] = None
    evidence_url: Optional[str] = None
    is_verified: Optional[bool] = None
    verification_status: Optional[str] = None
    verification_date: Optional[datetime] = None
    notes: Optional[str] = None

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

class ProductSourceUpdate(BaseModel):
    source_type: Optional[str] = None
    url: Optional[str] = None
    title: Optional[str] = None
    raw_content: Optional[str] = None
    verification_status: Optional[str] = None

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
    brand_name: Optional[str] = None
    brand_description: Optional[str] = None
    industry: Optional[str] = None
    website_url: Optional[str] = None
    logo_url: Optional[str] = None
    mission: Optional[str] = None
    vision: Optional[str] = None
    values: Optional[List[str]] = None
    personality: Optional[str] = None
    tone_of_voice: str = "Professional, Authoritative, Innovative"
    writing_style: Optional[str] = None
    preferred_vocabulary: Optional[List[str]] = None
    words_to_avoid: Optional[List[str]] = None
    brand_guidelines: Optional[str] = None
    typography: Optional[Dict[str, Any]] = None
    target_market: Optional[str] = None
    primary_color: str = "#C9B49B"
    secondary_color: str = "#292B29"
    accent_color: str = "#E9DFD2"
    do_not_mention_claims: Optional[List[str]] = None
    mandatory_disclaimers: Optional[List[str]] = None

class BrandProfileUpdate(BaseModel):
    brand_name: Optional[str] = None
    brand_description: Optional[str] = None
    industry: Optional[str] = None
    website_url: Optional[str] = None
    logo_url: Optional[str] = None
    mission: Optional[str] = None
    vision: Optional[str] = None
    values: Optional[List[str]] = None
    personality: Optional[str] = None
    tone_of_voice: Optional[str] = None
    writing_style: Optional[str] = None
    preferred_vocabulary: Optional[List[str]] = None
    words_to_avoid: Optional[List[str]] = None
    brand_guidelines: Optional[str] = None
    typography: Optional[Dict[str, Any]] = None
    target_market: Optional[str] = None
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
    age_range: Optional[str] = None
    gender: Optional[str] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    income_range: Optional[str] = None
    interests: Optional[List[str]] = None
    pain_points: Optional[List[str]] = None
    desired_outcomes: Optional[List[str]] = None
    needs: Optional[List[str]] = None
    buying_behaviour: Optional[str] = None
    preferred_channels: Optional[List[str]] = None
    motivations: Optional[List[str]] = None
    objections: Optional[List[str]] = None
    content_preferences: Optional[List[str]] = None

class AudiencePersonaCreate(AudiencePersonaBase):
    pass

class AudiencePersonaUpdate(BaseModel):
    title: Optional[str] = None
    role_description: Optional[str] = None
    age_range: Optional[str] = None
    gender: Optional[str] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    income_range: Optional[str] = None
    interests: Optional[List[str]] = None
    pain_points: Optional[List[str]] = None
    desired_outcomes: Optional[List[str]] = None
    needs: Optional[List[str]] = None
    buying_behaviour: Optional[str] = None
    preferred_channels: Optional[List[str]] = None
    motivations: Optional[List[str]] = None
    objections: Optional[List[str]] = None
    content_preferences: Optional[List[str]] = None

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
    slug: Optional[str] = Field(None, max_length=100)
    category: str = Field(min_length=2, max_length=100)
    tagline: Optional[str] = None
    description: Optional[str] = None
    website_url: Optional[str] = None
    logo_url: Optional[str] = None
    primary_objective: str = Field(default="awareness", description="awareness, leads, demos, registrations")
    status: str = Field(default="active", description="active, inactive, draft, archived")
    is_active: bool = True
    target_market: Optional[str] = None
    target_audience: Optional[str] = None
    usp: Optional[str] = None
    keywords: Optional[List[str]] = None
    launch_date: Optional[str] = None
    additional_info: Optional[str] = None

class ProductCreate(ProductBase):
    features: Optional[List[str]] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    category: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    website_url: Optional[str] = None
    logo_url: Optional[str] = None
    primary_objective: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None
    target_market: Optional[str] = None
    target_audience: Optional[str] = None
    usp: Optional[str] = None
    keywords: Optional[List[str]] = None
    launch_date: Optional[str] = None
    additional_info: Optional[str] = None

class ProductStatusUpdate(BaseModel):
    status: str
    is_active: Optional[bool] = None

class ProductOut(ProductBase):
    id: str
    organization_id: str
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
