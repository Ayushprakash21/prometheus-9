import os
import shutil
from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "PROMETHEUS-9"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = Field(default="production", description="production, staging, or development")
    
    # Security
    SECRET_KEY: str = Field(
        default="prometheus9_super_secret_master_key_burnished_copper_2026_secured",
        description="Master cryptographic key for JWT and encryption"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"
    
    # CORS Security Configuration
    ALLOWED_ORIGINS: Union[List[str], str] = Field(
        default=[
            "https://prometheus-9.pages.dev",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000"
        ],
        description="Allowed CORS origins"
    )
    
    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return [
            "https://prometheus-9.pages.dev",
            "http://localhost:5173",
            "http://localhost:3000"
        ]

    # Storage & Persistence
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    STORAGE_DIR: Path = BASE_DIR / "storage"
    ASSETS_DIR: Path = STORAGE_DIR / "assets"
    SQLITE_DB_PATH: Path = STORAGE_DIR / "prometheus9.db"
    
    # Database
    DATABASE_URL: str = f"sqlite+aiosqlite:///{STORAGE_DIR / 'prometheus9.db'}"
    SYNC_DATABASE_URL: str = f"sqlite:///{STORAGE_DIR / 'prometheus9.db'}"
    
    # Hardware & Tools
    FFMPEG_PATH: str = Field(
        default_factory=lambda: shutil.which("ffmpeg") or r"C:\Users\Ayush\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe"
    )
    
    # Operational Limits & Safety
    MAX_FILE_UPLOAD_BYTES: int = 250 * 1024 * 1024  # 250 MB
    AUTONOMOUS_OPERATIONS_PAUSED: bool = False
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure directories exist
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
settings.ASSETS_DIR.mkdir(parents=True, exist_ok=True)
