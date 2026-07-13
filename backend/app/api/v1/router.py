"""V1 API router — aggregates all route modules under /api/v1."""

from fastapi import APIRouter

from app.api.v1 import auth, resumes, job_descriptions, analyses, interrogation

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(resumes.router, prefix="/resumes", tags=["Resumes"])
router.include_router(job_descriptions.router, prefix="/job-descriptions", tags=["Job Descriptions"])
router.include_router(analyses.router, prefix="/analyses", tags=["Analyses"])
router.include_router(interrogation.router, tags=["Interrogation"])
