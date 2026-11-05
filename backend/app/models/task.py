import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from app.database.base import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class PersistentTask(Base):
    __tablename__ = "persistent_tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=True, index=True)
    task_type = Column(String(100), nullable=False, index=True)
    idempotency_key = Column(String(255), nullable=True, index=True)
    status = Column(String(50), default="pending", nullable=False, index=True)  # pending, running, completed, failed, dead_letter, cancelled
    payload = Column(JSON, default=dict, nullable=False)
    result = Column(JSON, default=dict, nullable=False)
    error_message = Column(Text, nullable=True)
    
    retry_count = Column(Integer, default=0, nullable=False)
    max_retries = Column(Integer, default=3, nullable=False)
    backoff_multiplier = Column(Float, default=2.0, nullable=False)
    next_retry_at = Column(DateTime(timezone=True), nullable=True, index=True)
    
    scheduled_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False, index=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    worker_id = Column(String(100), nullable=True)
    heartbeat_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    __table_args__ = (
        Index("ix_tasks_pending_retry", "status", "next_retry_at", "scheduled_at"),
        UniqueConstraint("organization_id", "idempotency_key", name="uq_org_task_idempotency"),
    )

    # Relationships
    execution_logs = relationship("TaskExecutionLog", back_populates="task", cascade="all, delete-orphan", order_by="TaskExecutionLog.attempt_number.asc()")

class TaskExecutionLog(Base):
    __tablename__ = "task_execution_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    task_id = Column(String(36), ForeignKey("persistent_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    attempt_number = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False)  # started, completed, failed
    duration_ms = Column(Integer, default=0, nullable=False)
    error_message = Column(Text, nullable=True)
    details = Column(JSON, default=dict, nullable=False)
    executed_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    task = relationship("PersistentTask", back_populates="execution_logs")
