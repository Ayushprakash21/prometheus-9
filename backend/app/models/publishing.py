import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class SocialAccount(Base):
    __tablename__ = "social_accounts"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    platform = Column(String(50), nullable=False, index=True)  # youtube, linkedin, instagram, facebook, tiktok, x
    account_name = Column(String(255), nullable=False)
    account_id_on_platform = Column(String(255), nullable=True)
    authorization_status = Column(String(50), default="unauthorized")  # authorized, unauthorized, expired, error
    channel_url = Column(String(500), nullable=True)
    scopes_granted = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

class OAuthCredential(Base):
    __tablename__ = "oauth_credentials"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    social_account_id = Column(String(36), ForeignKey("social_accounts.id"), unique=True, nullable=False)
    encrypted_access_token = Column(Text, nullable=False)
    encrypted_refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

class PublishingJob(Base):
    __tablename__ = "publishing_jobs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    social_account_id = Column(String(36), ForeignKey("social_accounts.id"), nullable=False, index=True)
    campaign_id = Column(String(36), ForeignKey("campaigns.id"), nullable=True)
    media_asset_id = Column(String(36), ForeignKey("media_assets.id"), nullable=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    tags = Column(JSON, default=list)
    privacy_status = Column(String(50), default="public")  # public, unlisted, private
    
    # State Machine: queued -> validating -> uploading -> published | failed | dead_letter
    status = Column(String(50), default="queued", index=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=True, index=True)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    last_error_message = Column(Text, nullable=True)
    idempotency_key = Column(String(64), unique=True, nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

class PublicationRecord(Base):
    __tablename__ = "publication_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    publishing_job_id = Column(String(36), ForeignKey("publishing_jobs.id"), unique=True, nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    platform = Column(String(50), nullable=False)
    platform_post_id = Column(String(255), nullable=False, index=True)  # authoritative video ID / post ID
    platform_post_url = Column(String(500), nullable=False)
    published_at = Column(DateTime(timezone=True), default=get_utc_now)
    verified_by_api = Column(Boolean, default=True, nullable=False)
    raw_response = Column(JSON, default=dict)

class PublishingError(Base):
    __tablename__ = "publishing_errors"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    publishing_job_id = Column(String(36), ForeignKey("publishing_jobs.id"), nullable=False, index=True)
    error_code = Column(String(100), nullable=False)
    error_details = Column(Text, nullable=False)
    occurred_at = Column(DateTime(timezone=True), default=get_utc_now)
