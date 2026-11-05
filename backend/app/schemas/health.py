from typing import Dict, Any, Optional
from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    version: str
    database: str
    ffmpeg_available: bool
    ffmpeg_version: Optional[str]
    autonomous_scheduler: Dict[str, Any]
    system_metrics: Dict[str, Any]
