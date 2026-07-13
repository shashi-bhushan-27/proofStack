"""Resume service — upload, parse, retrieve, delete."""

import logging
import os
import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.resume import Resume
from app.utils.pdf_processor import extract_text_from_pdf
from app.utils.storage import get_storage
from app.utils.validators import validate_pdf_file

logger = logging.getLogger(__name__)


async def upload_resume(
    db: AsyncSession,
    file: UploadFile,
    user_id: uuid.UUID | None = None,
) -> Resume:
    """Upload, validate, extract text from, and store a PDF resume.

    Args:
        db: Database session.
        file: The uploaded file.
        user_id: The owning user ID (None for guests).

    Returns:
        The persisted Resume record.

    Raises:
        HTTPException: On validation failures.
    """
    # Read file content
    content = await file.read()

    # Validate the PDF
    validate_pdf_file(
        content=content,
        filename=file.filename or "unknown.pdf",
        content_type=file.content_type,
        max_size_bytes=settings.max_file_size_bytes,
    )

    # Extract text using PyMuPDF
    extraction = extract_text_from_pdf(content)
    if not extraction.is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"PDF processing failed: {extraction.error_message}",
        )

    if not extraction.text or len(extraction.text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract meaningful text from PDF. Is it a scanned image?",
        )

    # Store the file
    unique_filename = f"{uuid.uuid4().hex}_{file.filename or 'resume.pdf'}"
    storage = get_storage()
    storage_path = await storage.upload_file(content, unique_filename, file.content_type or "application/pdf")

    # Create database record
    resume = Resume(
        user_id=user_id,
        filename=unique_filename,
        original_filename=file.filename or "resume.pdf",
        file_size=len(content),
        content_type=file.content_type or "application/pdf",
        storage_path=storage_path,
        parsed_text=extraction.text,
        page_count=extraction.page_count,
    )
    db.add(resume)
    await db.flush()
    await db.refresh(resume)

    logger.info(
        "Resume uploaded: id=%s pages=%d size=%d",
        resume.id, extraction.page_count, len(content),
    )
    return resume


async def get_resume(db: AsyncSession, resume_id: uuid.UUID) -> Resume | None:
    """Fetch a resume by ID."""
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    return result.scalar_one_or_none()


async def get_user_resumes(
    db: AsyncSession, user_id: uuid.UUID
) -> tuple[list[Resume], int]:
    """Fetch all resumes belonging to a user."""
    result = await db.execute(
        select(Resume)
        .where(Resume.user_id == user_id)
        .order_by(Resume.created_at.desc())
    )
    resumes = list(result.scalars().all())
    return resumes, len(resumes)


async def delete_resume(db: AsyncSession, resume: Resume) -> None:
    """Delete a resume and its stored file."""
    try:
        storage = get_storage()
        await storage.delete_file(resume.storage_path)
    except Exception:
        logger.warning("Failed to delete file from storage: %s", resume.storage_path)

    await db.delete(resume)
    await db.flush()
    logger.info("Resume deleted: id=%s", resume.id)
