import asyncio
import logging
from datetime import datetime, timezone
from typing import Callable, Dict, Any, Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.config import settings

logger = logging.getLogger("prometheus9.scheduler")

class AutonomousTaskQueue:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.handlers: Dict[str, Callable] = {}
        self.is_paused = settings.AUTONOMOUS_OPERATIONS_PAUSED
        self._running_jobs: Dict[str, Any] = {}

    def register_handler(self, task_type: str, handler: Callable):
        self.handlers[task_type] = handler
        logger.info(f"Registered task handler for: {task_type}")

    def start(self):
        if not self.scheduler.running:
            self.scheduler.start()
            logger.info("Persistent Task Scheduler started.")

    def shutdown(self):
        if self.scheduler.running:
            self.scheduler.shutdown(wait=False)
            logger.info("Task Scheduler shut down.")

    def pause_all(self):
        self.is_paused = True
        logger.warning("AUTONOMOUS MARKETING ENGINE PAUSED BY FOUNDER.")

    def resume_all(self):
        self.is_paused = False
        logger.info("AUTONOMOUS MARKETING ENGINE RESUMED.")

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.scheduler.running,
            "is_paused": self.is_paused,
            "active_scheduled_jobs_count": len(self.scheduler.get_jobs()),
            "registered_task_types": list(self.handlers.keys())
        }

task_queue = AutonomousTaskQueue()
