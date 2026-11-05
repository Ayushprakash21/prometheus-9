import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Integer, Float, ForeignKey
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class AgentRun(Base):
    __tablename__ = "agent_runs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    agent_role = Column(String(100), nullable=False, index=True)  # Marketing Intelligence, Strategist, Scriptwriter, etc.
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    status = Column(String(50), default="running", index=True)  # queued, running, completed, failed, paused
    input_payload = Column(JSON, default=dict)
    output_payload = Column(JSON, default=dict)
    error_message = Column(Text, nullable=True)
    tokens_consumed = Column(Integer, default=0)
    duration_ms = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), default=get_utc_now)
    completed_at = Column(DateTime(timezone=True), nullable=True)

class AgentTask(Base):
    __tablename__ = "agent_tasks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    agent_run_id = Column(String(36), ForeignKey("agent_runs.id"), nullable=False, index=True)
    task_name = Column(String(255), nullable=False)
    status = Column(String(50), default="pending")  # pending, in_progress, completed, failed
    details = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

class AgentMemory(Base):
    __tablename__ = "agent_memory"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    memory_key = Column(String(255), nullable=False, index=True)
    memory_value = Column(JSON, nullable=False)
    relevance_score = Column(Float, default=1.0)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

class QualityReport(Base):
    __tablename__ = "quality_reports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    resource_type = Column(String(50), nullable=False)  # script, video, thumbnail, idea
    resource_id = Column(String(36), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    factual_verification_passed = Column(Boolean, default=False)
    brand_consistency_score = Column(Float, default=0.0)  # 0 to 100
    overall_quality_score = Column(Float, default=0.0)
    flagged_issues = Column(JSON, default=list)
    evaluated_at = Column(DateTime(timezone=True), default=get_utc_now)

class ComplianceReport(Base):
    __tablename__ = "compliance_reports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(36), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    platform = Column(String(50), nullable=False)
    policy_compliance_passed = Column(Boolean, default=False)
    copyright_clearance_passed = Column(Boolean, default=False)
    compliance_notes = Column(Text, nullable=True)
    evaluated_at = Column(DateTime(timezone=True), default=get_utc_now)
