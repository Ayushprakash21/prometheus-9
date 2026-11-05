import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    objective = Column(String(100), nullable=False)  # awareness, traffic, leads, demos, conversions
    status = Column(String(50), default="draft", index=True)  # draft, active, paused, completed, archived
    target_audience_id = Column(String(36), ForeignKey("audience_personas.id"), nullable=True)
    budget_cap_cents = Column(Integer, default=0)
    scheduled_start = Column(DateTime(timezone=True), nullable=True)
    scheduled_end = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)
    
    ideas = relationship("ContentIdea", back_populates="campaign", cascade="all, delete-orphan")

class ContentIdea(Base):
    __tablename__ = "content_ideas"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    hook = Column(Text, nullable=False)
    format = Column(String(50), nullable=False)  # youtube_shorts, reel, linkedin_carousel, video_tutorial
    core_thesis = Column(Text, nullable=False)
    rationale = Column(Text, nullable=True)
    status = Column(String(50), default="proposed")  # proposed, approved, scripted, rejected
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    campaign = relationship("Campaign", back_populates="ideas")
    scripts = relationship("Script", back_populates="idea", cascade="all, delete-orphan")

class Script(Base):
    __tablename__ = "scripts"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    idea_id = Column(String(36), ForeignKey("content_ideas.id"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    target_duration_seconds = Column(Integer, default=60)
    hook_segment = Column(Text, nullable=False)
    body_segment = Column(Text, nullable=False)
    cta_segment = Column(Text, nullable=False)
    full_text = Column(Text, nullable=False)
    visual_notes = Column(JSON, default=list)
    version = Column(Integer, default=1)
    status = Column(String(50), default="draft")  # draft, validated, approved, recorded
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    
    idea = relationship("ContentIdea", back_populates="scripts")

class Storyboard(Base):
    __tablename__ = "storyboards"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    script_id = Column(String(36), ForeignKey("scripts.id"), nullable=False, index=True)
    scenes = Column(JSON, default=list)  # list of scene frames with narration text, visual prompt, duration
    total_frames = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

class MediaAsset(Base):
    __tablename__ = "media_assets"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    content_hash = Column(String(64), nullable=False, index=True)  # SHA-256 for integrity and deduplication
    mime_type = Column(String(100), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    asset_type = Column(String(50), nullable=False)  # image, audio, video, subtitle, document
    licensing_status = Column(String(50), default="proprietary_product_asset")  # proprietary, cc0, licensed
    attribution_details = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

class Voiceover(Base):
    __tablename__ = "voiceovers"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    script_id = Column(String(36), ForeignKey("scripts.id"), nullable=False, index=True)
    media_asset_id = Column(String(36), ForeignKey("media_assets.id"), nullable=False)
    tts_engine = Column(String(50), default="local_piper")  # local_piper, kokoro, edge_tts
    voice_name = Column(String(100), default="en_US-lessac")
    duration_seconds = Column(Float, default=0.0)
    status = Column(String(50), default="completed")
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

class RenderedVideo(Base):
    __tablename__ = "rendered_videos"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    script_id = Column(String(36), ForeignKey("scripts.id"), nullable=True)
    media_asset_id = Column(String(36), ForeignKey("media_assets.id"), nullable=False)
    aspect_ratio = Column(String(20), default="9:16")  # 9:16 (Shorts), 16:9 (Landscape)
    resolution = Column(String(20), default="1080x1920")
    duration_seconds = Column(Float, default=0.0)
    render_engine = Column(String(50), default="ffmpeg_pipeline")
    render_parameters = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

class Thumbnail(Base):
    __tablename__ = "thumbnails"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    media_asset_id = Column(String(36), ForeignKey("media_assets.id"), nullable=False)
    headline_text = Column(String(255), nullable=True)
    aspect_ratio = Column(String(20), default="9:16")
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

class Subtitle(Base):
    __tablename__ = "subtitles"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    script_id = Column(String(36), ForeignKey("scripts.id"), nullable=True)
    media_asset_id = Column(String(36), ForeignKey("media_assets.id"), nullable=True)
    format = Column(String(10), default="srt")  # srt, vtt
    timing_data = Column(JSON, default=list)  # list of cue segments [{start, end, text}]
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
