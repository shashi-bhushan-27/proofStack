"""Resume routes — upload, list, detail, delete."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_user_optional, verify_ownership
from app.db.session import get_db
from app.models.user import User
from app.schemas.resume import ResumeListResponse, ResumeResponse
from app.services.resume_service import (
    delete_resume,
    get_resume,
    get_user_resumes,
    upload_resume,
)

router = APIRouter()


@router.post(
    "/upload",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a resume PDF (public)",
)
async def upload_resume_endpoint(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> ResumeResponse:
    """Upload and parse a PDF resume. Works for both guests and authenticated users."""
    user_id = current_user.id if current_user else None
    resume = await upload_resume(db, file, user_id=user_id)
    return ResumeResponse.model_validate(resume)


@router.get(
    "",
    response_model=ResumeListResponse,
    summary="List user's resumes (auth required)",
)
async def list_resumes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResumeListResponse:
    """List all resumes belonging to the authenticated user."""
    resumes, total = await get_user_resumes(db, current_user.id)
    return ResumeListResponse(
        items=[ResumeResponse.model_validate(r) for r in resumes],
        total=total,
    )


@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
    summary="Get a specific resume",
)
async def get_resume_endpoint(
    resume_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> ResumeResponse:
    """Retrieve a specific resume by ID."""
    resume = await get_resume(db, resume_id)
    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )
    # If the resume has an owner, verify ownership
    if resume.user_id is not None:
        if current_user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
        verify_ownership(resume.user_id, current_user, "resume")
    return ResumeResponse.model_validate(resume)


@router.delete(
    "/{resume_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a resume (auth required)",
)
async def delete_resume_endpoint(
    resume_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete a resume belonging to the authenticated user."""
    resume = await get_resume(db, resume_id)
    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )
    verify_ownership(resume.user_id, current_user, "resume")
    await delete_resume(db, resume)
