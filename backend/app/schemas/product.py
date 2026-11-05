from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class ProductFeatureBase(BaseModel):
    name: str
    description: str
    benefit_statement: Optional[str] = None
    is_verified: bool = True

class ProductFeatureCreate(ProductFeatureBase):
    pass

class ProductFeatureOut(ProductFeatureBase):
    id: str
    product_id: str
    created_at: datetime
    class Config:
        from_attributes = True

class BrandProfileOut(BaseModel):
    id: str
    tone_of_voice: str
    primary_color: str
    secondary_color: str
    accent_color: str
    do_not_mention_claims: List[str]
    mandatory_disclaimers: List[str]
    class Config:
        from_attributes = True

class AudiencePersonaOut(BaseModel):
    id: str
    title: str
    role_description: Optional[str]
    pain_points: List[str]
    desired_outcomes: List[str]
    preferred_channels: List[str]
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    slug: str
    category: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    website_url: Optional[str] = None
    primary_objective: str
    is_active: bool = True

class ProductCreate(ProductBase):
    organization_slug: Optional[str] = "prometheus-org"

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
    brand_profile: Optional[BrandProfileOut] = None
    audiences: List[AudiencePersonaOut] = []
