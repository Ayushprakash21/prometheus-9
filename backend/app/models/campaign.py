import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    objective = Column(String(100), nullable=False)  # awareness, traffic, leads, demos, conversions
    status = Column(String(50), default="draft", nullable=False, index=True)  # draft, active, paused, completed, archived
    target_audience_id = Column(String(36), ForeignKey("audience_personas.id", ondelete="SET NULL"), nullable=True)
    budget_cap_cents = Column(Integer, default=0, nullable=False)
    scheduled_start = Column(DateTime(timezone=True), nullable=True)
    scheduled_end = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)
    
    ideas = relationship("ContentIdea", back_populates="campaign", cascade="all, delete-orphan")

class ContentIdea(Base):
    __tablename__ = "content_ideas"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    hook = Column(Text, nullable=False)
    format = Column(String(50), nullable=False)  # youtube_shorts, reel, linkedin_carousel, video_tutorial
    core_thesis = Column(Text, nullable=False)
    rationale = Column(Text, nullable=True)
    status = Column(String(50), default="proposed", nullable=False)  # proposed, approved, scripted, rejected
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    
    campaign = relationship("Campaign", back_populates="ideas")
    scripts = relationship("Script", back_populates="idea", cascade="all, delete-orphan")

class Script(Base):
    __tablename__ = "scripts"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    idea_id = Column(String(36), ForeignKey("content_ideas.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    target_duration_seconds = Column(Integer, default=60, nullable=False)
    hook_segment = Column(Text, nullable=False)
    body_segment = Column(Text, nullable=False)
    cta_segment = Column(Text, nullable=False)
    full_text = Column(Text, nullable=False)
    visual_notes = Column(JSON, default=list, nullable=False)
    version = Column(Integer, default=1, nullable=False)
    status = Column(String(50), default="draft", nullable=False)  # draft, validated, approved, recorded
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    
    idea = relationship("ContentIdea", back_populates="scripts")

class Storyboard(Base):
    __tablename__ = "storyboards"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    script_id = Column(String(36), ForeignKey("scripts.id", ondelete="CASCADE"), nullable=False, index=True)
    scenes = Column(JSON, default=list, nullable=False)
    total_frames = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

class MediaAsset(Base):
    __tablename__ = "media_assets"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    content_hash = Column(String(64), nullable=False, index=True)  # SHA-256
    mime_type = Column(String(100), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    asset_type = Column(String(50), nullable=False)  # image, audio, video, subtitle, document
    licensing_status = Column(String(50), default="proprietary_product_asset", nullable=False)
    attribution_details = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

class Voiceover(Base):
    __tablename__ = "voiceovers"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    script_id = Column(String(36), ForeignKey("scripts.id", ondelete="CASCADE"), nullable=False, index=True)
    media_asset_id = Column(String(36), ForeignKey("media_assets.id", ondelete="CASCADE"), nullable=False)
    tts_engine = Column(String(50), default="local_piper", nullable=False)
    voice_name = Column(String(100), default="en_US-lessac", nullable=False)
    duration_seconds = Column(Float, default=0.0, nullable=False)
    status = Column(String(50), default="completed", nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

class RenderedVideo(Base):
    __tablename__ = "rendered_videos"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    script_id = Column(String(36), ForeignKey("scripts.id", ondelete="SET NULL"), nullable=True)
    media_asset_id = Column(String(36), ForeignKey("media_assets.id", ondelete="CASCADE"), nullable=False)
    aspect_ratio = Column(String(20), default="9:16", nullable=False)  # 9:16 (Shorts), 16:9 (Landscape)
    resolution = Column(String(20), default="1080x1920", nullable=False)
    duration_seconds = Column(Float, default=0.0, nullable=False)
    render_engine = Column(String(50), default="ffmpeg_pipeline", nullable=False)
    render_parameters = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

class Thumbnail(Base):
    __tablename__ = "thumbnails"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    media_asset_id = Column(String(36), ForeignKey("media_assets.id", ondelete="CASCADE"), nullable=False)
    headline_text = Column(String(255), nullable=True)
    aspect_ratio = Column(String(20), default="9:16", nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

class Subtitle(Base):
    __tablename__ = "subtitles"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    script_id = Column(String(36), ForeignKey("scripts.id", ondelete="SET NULL"), nullable=True)
    media_asset_id = Column(String(36), ForeignKey("media_assets.id", ondelete="SET NULL"), nullable=True)
    format = Column(String(10), default="srt", nullable=False)
    timing_data = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
