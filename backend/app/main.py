from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db_init import init_db, seed_initial_products
from app.core.scheduler import task_queue
from app.api.v1.health import router as health_router
from app.api.v1.products import router as products_router
from app.api.v1.campaigns import router as campaigns_router
from app.api.v1.publishing import router as publishing_router
from app.api.v1.agents import router as agents_router
from app.api.v1.assets import router as assets_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist, seed initial products, start scheduler
    init_db()
    await seed_initial_products()
    task_queue.start()
    yield
    # Shutdown: stop scheduler cleanly
    task_queue.shutdown()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Autonomous Marketing, Creative Production & Growth Operating System",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1 Routers
app.include_router(health_router, prefix=settings.API_V1_STR)
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
