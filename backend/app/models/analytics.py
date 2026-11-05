import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Integer, Float, ForeignKey
from app.database.base import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class PlatformAnalytics(Base):
    __tablename__ = "platform_analytics"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    publication_record_id = Column(String(36), ForeignKey("publication_records.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_at = Column(DateTime(timezone=True), default=get_utc_now, index=True, nullable=False)
    
    views_count = Column(Integer, default=0, nullable=False)
    likes_count = Column(Integer, default=0, nullable=False)
    comments_count = Column(Integer, default=0, nullable=False)
    shares_count = Column(Integer, default=0, nullable=False)
    watch_time_minutes = Column(Float, default=0.0, nullable=False)
    click_through_rate = Column(Float, default=0.0, nullable=False)
    raw_metrics = Column(JSON, default=dict, nullable=False)

class WebsiteAnalytics(Base):
    __tablename__ = "website_analytics"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True, index=True)
    recorded_at = Column(DateTime(timezone=True), default=get_utc_now, index=True, nullable=False)
    
    utm_source = Column(String(100), nullable=True)
    utm_medium = Column(String(100), nullable=True)
    utm_campaign = Column(String(100), nullable=True)
    unique_visitors = Column(Integer, default=0, nullable=False)
    sessions = Column(Integer, default=0, nullable=False)
    bounce_rate = Column(Float, default=0.0, nullable=False)

class ConversionEvent(Base):
    __tablename__ = "conversion_events"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True, index=True)
    event_type = Column(String(50), nullable=False)  # registration, demo_request, lead, subscription
    occurred_at = Column(DateTime(timezone=True), default=get_utc_now, index=True, nullable=False)
    metadata_payload = Column(JSON, default=dict, nullable=False)
