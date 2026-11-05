import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Integer, ForeignKey
from app.database.base import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class SocialAccount(Base):
    __tablename__ = "social_accounts"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    platform = Column(String(50), nullable=False, index=True)  # youtube, linkedin, instagram, facebook, tiktok, x
    account_name = Column(String(255), nullable=False)
    account_id_on_platform = Column(String(255), nullable=True)
    authorization_status = Column(String(50), default="unauthorized", nullable=False)  # authorized, unauthorized, expired, error
    channel_url = Column(String(500), nullable=True)
    scopes_granted = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

class OAuthCredential(Base):
    __tablename__ = "oauth_credentials"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    social_account_id = Column(String(36), ForeignKey("social_accounts.id", ondelete="CASCADE"), unique=True, nullable=False)
    encrypted_access_token = Column(Text, nullable=False)
    encrypted_refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

class PublishingJob(Base):
    __tablename__ = "publishing_jobs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    social_account_id = Column(String(36), ForeignKey("social_accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True)
    media_asset_id = Column(String(36), ForeignKey("media_assets.id", ondelete="SET NULL"), nullable=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    tags = Column(JSON, default=list, nullable=False)
    privacy_status = Column(String(50), default="public", nullable=False)  # public, unlisted, private
    
    status = Column(String(50), default="queued", nullable=False, index=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=True, index=True)
    retry_count = Column(Integer, default=0, nullable=False)
    max_retries = Column(Integer, default=3, nullable=False)
    last_error_message = Column(Text, nullable=True)
    idempotency_key = Column(String(64), unique=True, nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

class PublicationRecord(Base):
    __tablename__ = "publication_records"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    publishing_job_id = Column(String(36), ForeignKey("publishing_jobs.id", ondelete="CASCADE"), unique=True, nullable=False)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    platform = Column(String(50), nullable=False)
    platform_post_id = Column(String(255), nullable=False, index=True)  # authoritative platform post ID
    platform_post_url = Column(String(500), nullable=False)
    published_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    verified_by_api = Column(Boolean, default=True, nullable=False)
    raw_response = Column(JSON, default=dict, nullable=False)

class PublishingError(Base):
    __tablename__ = "publishing_errors"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    publishing_job_id = Column(String(36), ForeignKey("publishing_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    error_code = Column(String(100), nullable=False)
    error_details = Column(Text, nullable=False)
    occurred_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
