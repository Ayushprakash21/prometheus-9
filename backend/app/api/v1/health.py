import subprocess
import psutil
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db
from app.config import settings
from app.core.scheduler import task_queue
from app.schemas.health import HealthResponse

router = APIRouter(prefix="/health", tags=["System Health"])

@router.get("", response_model=HealthResponse)
async def check_health(db: AsyncSession = Depends(get_db)):
    # 1. Database check
    db_status = "operational"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    # 2. FFmpeg check
    ffmpeg_available = False
    ffmpeg_version = None
    try:
        proc = subprocess.run(
            [settings.FFMPEG_PATH, "-version"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=3
        )
        if proc.returncode == 0:
            ffmpeg_available = True
            ffmpeg_version = proc.stdout.splitlines()[0] if proc.stdout else "Available"
    except Exception:
        ffmpeg_available = False

    # 3. Host system metrics
    system_metrics = {
        "cpu_usage_percent": psutil.cpu_percent(interval=None),
        "ram_usage_percent": psutil.virtual_memory().percent,
        "ram_available_mb": round(psutil.virtual_memory().available / (1024 * 1024), 2),
        "storage_disk_percent": psutil.disk_usage(str(settings.STORAGE_DIR)).percent
    }

    return HealthResponse(
        status="healthy" if db_status == "operational" else "degraded",
        version=settings.VERSION,
        database=db_status,
        ffmpeg_available=ffmpeg_available,
        ffmpeg_version=ffmpeg_version,
        autonomous_scheduler=task_queue.get_status(),
        system_metrics=system_metrics
    )
