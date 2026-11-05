from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class CampaignBase(BaseModel):
    title: str
    objective: str
    status: str = "draft"
    budget_cap_cents: int = 0

class CampaignCreate(CampaignBase):
    product_id: str
    target_audience_id: Optional[str] = None

class CampaignOut(CampaignBase):
    id: str
    product_id: str
    target_audience_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class ContentIdeaBase(BaseModel):
    title: str
    hook: str
    format: str
    core_thesis: str
    rationale: Optional[str] = None

class ContentIdeaCreate(ContentIdeaBase):
    campaign_id: str
    product_id: str

class ContentIdeaOut(ContentIdeaBase):
    id: str
    campaign_id: str
    product_id: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class ScriptBase(BaseModel):
    title: str
    target_duration_seconds: int = 60
    hook_segment: str
    body_segment: str
    cta_segment: str
    full_text: str
    visual_notes: List[Dict[str, Any]] = []

class ScriptCreate(ScriptBase):
    idea_id: str
    product_id: str

class ScriptOut(ScriptBase):
    id: str
    idea_id: str
    product_id: str
    version: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True
