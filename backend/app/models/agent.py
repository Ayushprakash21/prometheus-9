import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Integer, Float, ForeignKey
from app.database.base import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class AgentRun(Base):
    __tablename__ = "agent_runs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_role = Column(String(100), nullable=False, index=True)
    status = Column(String(50), default="running", nullable=False, index=True)  # queued, running, completed, failed, paused
    input_payload = Column(JSON, default=dict, nullable=False)
    output_payload = Column(JSON, default=dict, nullable=False)
    error_message = Column(Text, nullable=True)
    tokens_consumed = Column(Integer, default=0, nullable=False)
    duration_ms = Column(Integer, default=0, nullable=False)
    started_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

class AgentTask(Base):
    __tablename__ = "agent_tasks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_run_id = Column(String(36), ForeignKey("agent_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    task_name = Column(String(255), nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # pending, in_progress, completed, failed
    details = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

class AgentMemory(Base):
    __tablename__ = "agent_memory"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    memory_key = Column(String(255), nullable=False, index=True)
    memory_value = Column(JSON, nullable=False)
    relevance_score = Column(Float, default=1.0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

class QualityReport(Base):
    __tablename__ = "quality_reports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_type = Column(String(50), nullable=False)  # script, video, thumbnail, idea
    resource_id = Column(String(36), nullable=False, index=True)
    factual_verification_passed = Column(Boolean, default=False, nullable=False)
    brand_consistency_score = Column(Float, default=0.0, nullable=False)  # 0 to 100
    overall_quality_score = Column(Float, default=0.0, nullable=False)
    flagged_issues = Column(JSON, default=list, nullable=False)
    evaluated_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

class ComplianceReport(Base):
    __tablename__ = "compliance_reports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    platform = Column(String(50), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(36), nullable=False, index=True)
    policy_compliance_passed = Column(Boolean, default=False, nullable=False)
    copyright_clearance_passed = Column(Boolean, default=False, nullable=False)
    compliance_notes = Column(Text, nullable=True)
    evaluated_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
