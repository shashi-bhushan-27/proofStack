"""Job description routes."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import enforce_daily_analysis_limit, get_current_user_optional
from app.db.session import get_db
from app.models.job_description import JobDescription
from app.models.user import User
from app.schemas.job_description import JobDescriptionCreate, JobDescriptionResponse

router = APIRouter()


@router.post(
    "",
    response_model=JobDescriptionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a job description (public)",
)
async def create_job_description(
    payload: JobDescriptionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> JobDescriptionResponse:
    """Store a job description. Works for both guests and authenticated users."""
    enforce_daily_analysis_limit(current_user, increment=False)
    jd = JobDescription(
        user_id=current_user.id if current_user else None,
        job_title=payload.job_title,
        company_name=payload.company_name,
        raw_text=payload.raw_text,
    )
    db.add(jd)
    await db.flush()
    await db.refresh(jd)
    return JobDescriptionResponse.model_validate(jd)
