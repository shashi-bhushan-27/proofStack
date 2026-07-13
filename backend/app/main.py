from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base

# Import ALL models so Base.metadata knows about every table
from app.models import user, resume, job_description, analysis, job_requirement, resume_skill, skill_evidence, recommendation, interrogation  # noqa: F401

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("proofStack")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management for startup and shutdown cleanups."""
    logger.info("proofStack API starting up...")
    # Auto-create all database tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables verified/created.")
    yield
    logger.info("proofStack API shutting down...")
    await engine.dispose()

app = FastAPI(
    title="proofStack API",
    description="Evidence-Based AI Resume Intelligence Platform API",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 API router
app.include_router(v1_router, prefix="/api/v1")

@app.get("/health", tags=["System"])
async def health_check():
    """Service health check endpoint."""
    return {"status": "healthy", "service": "proofStack API", "version": "1.0.0"}
