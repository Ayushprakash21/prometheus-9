from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from app.config import settings
from app.database.session import AsyncSessionLocal
from app.db_init import init_db
from app.services.seeder import seed_initial_data
from app.core.scheduler import task_queue
from app.core.exceptions import AppException
from app.schemas.common import ErrorResponse, ErrorDetail

# API v1 Routers
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.products import router as products_router
from app.api.v1.campaigns import router as campaigns_router
from app.api.v1.publishing import router as publishing_router
from app.api.v1.agents import router as agents_router
from app.api.v1.assets import router as assets_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed initial idempotent portfolio
    init_db()
    async with AsyncSessionLocal() as session:
        await seed_initial_data(session)
    task_queue.start()
    yield
    # Shutdown cleanly
    task_queue.shutdown()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="PROMETHEUS-9 Autonomous Marketing, Creative Production & Growth Operating System API",
    lifespan=lifespan
)

# CORS - Environment-based allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Centralized Exception Handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.message,
            "error": {"code": exc.error_code, "message": exc.message, "details": exc.details}
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Input validation failed. Please check your request parameters.",
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Input validation failed. Please check your request parameters.",
                "details": exc.errors()
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected server error occurred."
            }
        }
    )

# Versioned API Routes
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(products_router, prefix=settings.API_V1_STR)
app.include_router(campaigns_router, prefix=settings.API_V1_STR)
app.include_router(publishing_router, prefix=settings.API_V1_STR)
app.include_router(agents_router, prefix=settings.API_V1_STR)
app.include_router(assets_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "system": settings.PROJECT_NAME,
        "edition": "Charcoal & Copper Edition",
        "version": settings.VERSION,
        "operating_cycle": "RESEARCH → STRATEGIZE → CREATE → VALIDATE → PUBLISH → MEASURE → LEARN → OPTIMIZE",
        "documentation": "/docs"
    }
