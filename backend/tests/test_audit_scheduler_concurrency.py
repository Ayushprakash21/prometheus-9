import uuid
import asyncio
from datetime import datetime, timezone, timedelta
import pytest
from app.core.scheduler import PersistentTaskScheduler
from app.models.task import PersistentTask
from app.models.system import Organization
from sqlalchemy import select

@pytest.mark.asyncio
async def test_concurrent_worker_atomic_claiming(db_session):
    """
    Simulate two concurrent workers attempting to claim the same pending task simultaneously.
    Verify that atomic conditional update ensures exactly one worker claims it,
    preventing duplicate execution.
    """
    unique = str(uuid.uuid4())[:8]
    org = (await db_session.execute(select(Organization))).scalars().first()
    org_id = org.id
    task_type = f"concurrent_job_{unique}"

    # Initialize two distinct worker instances polling the same DB
    worker_1 = PersistentTaskScheduler()
    worker_1.worker_id = f"worker-alpha-{unique}"

    worker_2 = PersistentTaskScheduler()
    worker_2.worker_id = f"worker-beta-{unique}"

    # Create 1 pending task
    task = await worker_1.create_task(
        session=db_session,
        organization_id=org_id,
        task_type=task_type,
        payload={"item": 1}
    )
    task_id = task.id
    assert task.status == "pending"

    # Both workers attempt to claim the exact same task ID concurrently
    claim_1, claim_2 = await asyncio.gather(
        worker_1.claim_task_atomically(db_session, task_id),
        worker_2.claim_task_atomically(db_session, task_id)
    )

    # Exactly one worker must win the lease; the other must be rejected
    assert (claim_1 is True and claim_2 is False) or (claim_1 is False and claim_2 is True)

    # Refresh task from DB: must be running with the winning worker's ID
    await db_session.refresh(task)
    assert task.status == "running"
    winning_worker_id = worker_1.worker_id if claim_1 else worker_2.worker_id
    assert task.worker_id == winning_worker_id

@pytest.mark.asyncio
async def test_stale_task_recovery_after_worker_crash(db_session):
    """
    Verify that if a worker crashes while executing a task,
    the scheduler recovers the abandoned task and schedules a retry or moves to dead letter.
    """
    unique = str(uuid.uuid4())[:8]
    org = (await db_session.execute(select(Organization))).scalars().first()
    org_id = org.id

    scheduler = PersistentTaskScheduler()
    task = await scheduler.create_task(
        session=db_session,
        organization_id=org_id,
        task_type="long_running_export",
        payload={"export_id": 123},
        max_retries=3
    )

    # Simulate worker claiming task, then dying unexpectedly 10 minutes ago
    ten_minutes_ago = datetime.now(timezone.utc) - timedelta(minutes=10)
    task.status = "running"
    task.worker_id = "dead-worker-999"
    task.heartbeat_at = ten_minutes_ago
    await db_session.commit()

    # Run recovery with stale threshold = 300 seconds (5 min)
    recovered = await scheduler.recover_stale_tasks(db_session, stale_threshold_seconds=300)
    assert recovered == 1

    # Task must be recovered to pending with incremented retry count and future retry time
    await db_session.refresh(task)
    assert task.status == "pending"
    assert task.retry_count == 1
    assert task.next_retry_at is not None
    assert "Worker lease expired" in task.error_message
