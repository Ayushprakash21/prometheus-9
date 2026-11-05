import uuid
import asyncio
from datetime import datetime, timezone
import pytest
from app.core.scheduler import PersistentTaskScheduler
from app.models.task import PersistentTask, TaskExecutionLog
from app.models.system import Organization
from sqlalchemy import select

@pytest.mark.asyncio
async def test_scheduler_persistence_across_restarts(db_session):
    """
    Requested 5-step persistence test:
    1. Creates a task.
    2. Shuts down the scheduler.
    3. Reinitializes the scheduler.
    4. Verifies that the task remains stored in the database.
    5. Executes the task successfully.
    """
    unique = str(uuid.uuid4())[:8]
    org = (await db_session.execute(select(Organization))).scalars().first()
    org_id = org.id
    task_type = f"test_render_{unique}"

    # Step 1: Create a task using Scheduler 1
    scheduler_1 = PersistentTaskScheduler()
    scheduler_1.register_handler(task_type, lambda payload, task: {"status": "rendered", "fps": 60})
    scheduler_1.start()

    created_task = await scheduler_1.create_task(
        session=db_session,
        organization_id=org_id,
        task_type=task_type,
        payload={"scene": "intro", "resolution": "1080p"},
        idempotency_key=f"render-key-{unique}"
    )
    task_id = created_task.id
    assert created_task.status == "pending"

    # Step 2: Shut down Scheduler 1
    scheduler_1.shutdown()
    assert scheduler_1._running is False

    # Step 3: Reinitialize Scheduler 2 (simulating fresh application startup)
    scheduler_2 = PersistentTaskScheduler()
    scheduler_2.register_handler(task_type, lambda payload, task: {"status": "rendered", "fps": 60})

    # Step 4: Verify task remains stored in database
    retrieved_task = await scheduler_2.get_task(db_session, task_id, org_id)
    assert retrieved_task is not None
    assert retrieved_task.id == task_id
    assert retrieved_task.status == "pending"
    assert retrieved_task.payload["resolution"] == "1080p"

    # Step 5: Execute task successfully using Scheduler 2
    executed = await scheduler_2.execute_task_by_id(task_id, db_session)
    assert executed is True

    # Refresh task and verify completed state & result
    await db_session.refresh(retrieved_task)
    assert retrieved_task.status == "completed"
    assert retrieved_task.result == {"status": "rendered", "fps": 60}
    assert retrieved_task.completed_at is not None

    # Verify execution history log
    logs_res = await db_session.execute(
        select(TaskExecutionLog).where(TaskExecutionLog.task_id == task_id)
    )
    logs = logs_res.scalars().all()
    assert len(logs) == 1
    assert logs[0].status == "completed"
    assert logs[0].attempt_number == 1

@pytest.mark.asyncio
async def test_scheduler_retries_and_dead_letter_queue(db_session):
    """
    Verify retry mechanism, exponential backoff, and dead-letter queue transition.
    """
    unique = str(uuid.uuid4())[:8]
    org = (await db_session.execute(select(Organization))).scalars().first()
    org_id = org.id
    task_type = f"failing_job_{unique}"

    scheduler = PersistentTaskScheduler()

    def always_fails_handler(payload, task):
        raise ConnectionError("Social Platform API Gateway Timeout")

    scheduler.register_handler(task_type, always_fails_handler)

    # Create task with max_retries=2
    task = await scheduler.create_task(
        session=db_session,
        organization_id=org_id,
        task_type=task_type,
        payload={"url": "https://api.social.com/post"},
        max_retries=2,
        backoff_multiplier=2.0
    )
    task_id = task.id

    # Attempt 1: Fails -> status returns to pending, next_retry_at is calculated
    success_1 = await scheduler.execute_task_by_id(task_id, db_session)
    assert success_1 is False
    await db_session.refresh(task)
    assert task.status == "pending"
    assert task.retry_count == 1
    assert task.next_retry_at is not None
    assert "Gateway Timeout" in task.error_message

    # Attempt 2: Fails again -> reaches max_retries=2 -> status moves to dead_letter!
    success_2 = await scheduler.execute_task_by_id(task_id, db_session)
    assert success_2 is False
    await db_session.refresh(task)
    assert task.status == "dead_letter"
    assert task.retry_count == 2
    assert "Gateway Timeout" in task.error_message

    # Verify 2 execution logs were recorded
    logs_res = await db_session.execute(
        select(TaskExecutionLog).where(TaskExecutionLog.task_id == task_id).order_by(TaskExecutionLog.attempt_number.asc())
    )
    logs = logs_res.scalars().all()
    assert len(logs) == 2
    assert logs[0].status == "failed"
    assert logs[1].status == "failed"

@pytest.mark.asyncio
async def test_scheduler_idempotency_key(db_session):
    """
    Verify that creating tasks with the same idempotency key does not duplicate jobs.
    """
    unique = str(uuid.uuid4())[:8]
    org = (await db_session.execute(select(Organization))).scalars().first()
    org_id = org.id
    idempotency_key = f"unique-key-{unique}"
    scheduler = PersistentTaskScheduler()

    task1 = await scheduler.create_task(
        session=db_session,
        organization_id=org_id,
        task_type="publish_video",
        payload={"title": "Original Video"},
        idempotency_key=idempotency_key
    )

    task2 = await scheduler.create_task(
        session=db_session,
        organization_id=org_id,
        task_type="publish_video",
        payload={"title": "Duplicate Video Call"},
        idempotency_key=idempotency_key
    )

    assert task1.id == task2.id

@pytest.mark.asyncio
async def test_scheduler_global_pause_and_resume(db_session):
    """
    Verify global pause blocks polling and resume unblocks execution.
    """
    scheduler = PersistentTaskScheduler()
    assert scheduler.is_paused is False

    scheduler.pause_all()
    assert scheduler.is_paused is True
    # When paused, poll_and_execute_next immediately returns False
    result = await scheduler.poll_and_execute_next()
    assert result is False

    scheduler.resume_all()
    assert scheduler.is_paused is False
