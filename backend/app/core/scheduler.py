import asyncio
import logging
import time
from datetime import datetime, timezone, timedelta
from typing import Callable, Dict, Any, Optional, List
from sqlalchemy import select, and_, or_, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.database.session import AsyncSessionLocal
from app.models.task import PersistentTask, TaskExecutionLog

logger = logging.getLogger("prometheus9.scheduler")

class PersistentTaskScheduler:
    def __init__(self):
        self.handlers: Dict[str, Callable] = {}
        self.is_paused: bool = settings.AUTONOMOUS_OPERATIONS_PAUSED
        self.worker_id: str = f"worker-{time.strftime('%Y%m%d%H%M%S')}"
        self._polling_task: Optional[asyncio.Task] = None
        self._running: bool = False
        self.last_heartbeat: Optional[datetime] = None

    def register_handler(self, task_type: str, handler: Callable):
        self.handlers[task_type] = handler
        logger.info(f"Registered persistent task handler for: '{task_type}'")

    async def create_task(
        self,
        session: AsyncSession,
        organization_id: str,
        task_type: str,
        payload: Dict[str, Any],
        product_id: Optional[str] = None,
        idempotency_key: Optional[str] = None,
        max_retries: int = 3,
        scheduled_at: Optional[datetime] = None,
        backoff_multiplier: float = 2.0
    ) -> PersistentTask:
        """
        Creates a persistent task with idempotency protection.
        Survives application restarts because it is written to the database.
        """
        now = datetime.now(timezone.utc)
        
        # 1. Idempotency Check
        if idempotency_key:
            stmt = select(PersistentTask).where(
                and_(
                    PersistentTask.organization_id == organization_id,
                    PersistentTask.idempotency_key == idempotency_key
                )
            )
            existing = (await session.execute(stmt)).scalar_one_or_none()
            if existing and existing.status not in ("cancelled", "failed"):
                logger.info(f"Idempotent task match found: {existing.id} (status={existing.status})")
                return existing

        task = PersistentTask(
            organization_id=organization_id,
            product_id=product_id,
            task_type=task_type,
            idempotency_key=idempotency_key,
            status="pending",
            payload=payload,
            result={},
            retry_count=0,
            max_retries=max_retries,
            backoff_multiplier=backoff_multiplier,
            scheduled_at=scheduled_at or now,
            next_retry_at=None,
            created_at=now,
            updated_at=now
        )
        session.add(task)
        await session.flush()
        await session.commit()
        await session.refresh(task)
        logger.info(f"Created persistent task '{task.id}' of type '{task_type}'")
        return task

    async def cancel_task(self, session: AsyncSession, task_id: str, organization_id: str) -> bool:
        """Cancels a pending or failed task."""
        stmt = select(PersistentTask).where(
            and_(
                PersistentTask.id == task_id,
                PersistentTask.organization_id == organization_id
            )
        )
        task = (await session.execute(stmt)).scalar_one_or_none()
        if not task:
            return False
        if task.status in ("completed", "cancelled"):
            return False
        
        task.status = "cancelled"
        task.updated_at = datetime.now(timezone.utc)
        await session.commit()
        logger.info(f"Task '{task_id}' was cancelled by organization '{organization_id}'")
        return True

    async def get_task(self, session: AsyncSession, task_id: str, organization_id: str) -> Optional[PersistentTask]:
        stmt = select(PersistentTask).where(
            and_(
                PersistentTask.id == task_id,
                PersistentTask.organization_id == organization_id
            )
        )
        return (await session.execute(stmt)).scalar_one_or_none()

    async def execute_task_by_id(self, task_id: str, session: AsyncSession) -> bool:
        """
        Executes a single specified task by ID, updating status, execution history,
        and handling retries / exponential backoff / dead-letter transitions.
        """
        now = datetime.now(timezone.utc)
        stmt = select(PersistentTask).where(PersistentTask.id == task_id)
        task = (await session.execute(stmt)).scalar_one_or_none()
        if not task or task.status in ("completed", "cancelled", "dead_letter"):
            return False

        task.status = "running"
        task.worker_id = self.worker_id
        task.started_at = now
        task.heartbeat_at = now
        task.updated_at = now
        await session.commit()

        start_time = time.perf_counter()
        attempt_number = task.retry_count + 1
        handler = self.handlers.get(task.task_type)

        if not handler:
            err = f"No handler registered for task type: '{task.task_type}'"
            logger.error(err)
            task.status = "dead_letter"
            task.error_message = err
            task.completed_at = datetime.now(timezone.utc)
            task.updated_at = datetime.now(timezone.utc)
            
            log = TaskExecutionLog(
                task_id=task.id,
                attempt_number=attempt_number,
                status="failed",
                duration_ms=int((time.perf_counter() - start_time) * 1000),
                error_message=err,
                details={"reason": "unregistered_handler"}
            )
            session.add(log)
            await session.commit()
            return False

        try:
            # Execute handler (async or sync)
            if asyncio.iscoroutinefunction(handler):
                result = await handler(task.payload, task)
            else:
                result = handler(task.payload, task)

            duration_ms = int((time.perf_counter() - start_time) * 1000)
            task.status = "completed"
            task.result = result if isinstance(result, dict) else {"output": result}
            task.completed_at = datetime.now(timezone.utc)
            task.updated_at = datetime.now(timezone.utc)
            task.error_message = None

            log = TaskExecutionLog(
                task_id=task.id,
                attempt_number=attempt_number,
                status="completed",
                duration_ms=duration_ms,
                error_message=None,
                details={"result_keys": list(task.result.keys()) if isinstance(task.result, dict) else []}
            )
            session.add(log)
            await session.commit()
            logger.info(f"Task '{task.id}' [{task.task_type}] completed successfully in {duration_ms}ms")
            return True

        except Exception as exc:
            duration_ms = int((time.perf_counter() - start_time) * 1000)
            task.retry_count += 1
            task.error_message = str(exc)
            task.updated_at = datetime.now(timezone.utc)

            log = TaskExecutionLog(
                task_id=task.id,
                attempt_number=attempt_number,
                status="failed",
                duration_ms=duration_ms,
                error_message=str(exc),
                details={"attempt": attempt_number}
            )
            session.add(log)

            if task.retry_count >= task.max_retries:
                # Exceeded max retries -> Move to Dead-Letter Queue
                task.status = "dead_letter"
                task.completed_at = datetime.now(timezone.utc)
                logger.error(f"Task '{task.id}' failed attempt {attempt_number}/{task.max_retries} -> Moved to DEAD-LETTER QUEUE: {exc}")
            else:
                # Exponential backoff: delay = (multiplier ** retry_count)
                delay_sec = int(task.backoff_multiplier ** task.retry_count)
                task.next_retry_at = datetime.now(timezone.utc) + timedelta(seconds=delay_sec)
                task.status = "pending"
                logger.warning(f"Task '{task.id}' failed attempt {attempt_number}/{task.max_retries}. Next retry in {delay_sec}s: {exc}")

            await session.commit()
            return False

    async def poll_and_execute_next(self) -> bool:
        """Polls database for the next runnable task and executes it."""
        if self.is_paused:
            return False

        now = datetime.now(timezone.utc)
        self.last_heartbeat = now

        async with AsyncSessionLocal() as session:
            # Query next eligible task:
            # 1. status == 'pending' and scheduled_at <= now and (next_retry_at is null or next_retry_at <= now)
            stmt = select(PersistentTask.id).where(
                and_(
                    PersistentTask.status == "pending",
                    PersistentTask.scheduled_at <= now,
                    or_(
                        PersistentTask.next_retry_at.is_(None),
                        PersistentTask.next_retry_at <= now
                    )
                )
            ).order_by(PersistentTask.scheduled_at.asc()).limit(1)

            task_id = (await session.execute(stmt)).scalar_one_or_none()
            if not task_id:
                return False

            return await self.execute_task_by_id(task_id, session)

    async def _worker_loop(self):
        logger.info(f"Persistent worker [{self.worker_id}] polling loop started.")
        while self._running:
            try:
                executed = await self.poll_and_execute_next()
                if not executed:
                    await asyncio.sleep(0.5)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Worker polling error: {e}")
                await asyncio.sleep(1.0)

    def start(self):
        """Starts the persistent background worker."""
        if not self._running:
            self._running = True
            try:
                loop = asyncio.get_running_loop()
                self._polling_task = loop.create_task(self._worker_loop())
            except RuntimeError:
                # No running event loop yet (will be started with lifespan)
                pass
            logger.info("Persistent Task Scheduler started.")

    def shutdown(self):
        """Clean shutdown of worker loop."""
        self._running = False
        if self._polling_task and not self._polling_task.done():
            self._polling_task.cancel()
        logger.info("Persistent Task Scheduler shut down.")

    def pause_all(self):
        self.is_paused = True
        logger.warning("AUTONOMOUS MARKETING ENGINE PAUSED BY FOUNDER.")

    def resume_all(self):
        self.is_paused = False
        logger.info("AUTONOMOUS MARKETING ENGINE RESUMED.")

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self._running,
            "is_paused": self.is_paused,
            "worker_id": self.worker_id,
            "last_heartbeat": self.last_heartbeat.isoformat() if self.last_heartbeat else None,
            "registered_task_types": list(self.handlers.keys())
        }

task_queue = PersistentTaskScheduler()
