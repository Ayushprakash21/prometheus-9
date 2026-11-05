import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Integer, Float, ForeignKey
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class PlatformAnalytics(Base):
    __tablename__ = "platform_analytics"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    publication_record_id = Column(String(36), ForeignKey("publication_records.id"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    recorded_at = Column(DateTime(timezone=True), default=get_utc_now, index=True)
    
    views_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    watch_time_minutes = Column(Float, default=0.0)
    click_through_rate = Column(Float, default=0.0)
    raw_metrics = Column(JSON, default=dict)

class WebsiteAnalytics(Base):
    __tablename__ = "website_analytics"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    campaign_id = Column(String(36), ForeignKey("campaigns.id"), nullable=True, index=True)
    recorded_at = Column(DateTime(timezone=True), default=get_utc_now, index=True)
    
    utm_source = Column(String(100), nullable=True)
    utm_medium = Column(String(100), nullable=True)
    utm_campaign = Column(String(100), nullable=True)
    unique_visitors = Column(Integer, default=0)
    sessions = Column(Integer, default=0)
    bounce_rate = Column(Float, default=0.0)

class ConversionEvent(Base):
    __tablename__ = "conversion_events"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    campaign_id = Column(String(36), ForeignKey("campaigns.id"), nullable=True, index=True)
    event_type = Column(String(50), nullable=False)  # registration, demo_request, lead, subscription
    occurred_at = Column(DateTime(timezone=True), default=get_utc_now, index=True)
    metadata_payload = Column(JSON, default=dict)
