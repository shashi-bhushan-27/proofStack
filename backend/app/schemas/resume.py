"""Resume schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ResumeResponse(BaseModel):
    """Single resume representation."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID | None
    filename: str
    original_filename: str
    file_size: int
    content_type: str
    page_count: int | None
    created_at: datetime


class ResumeDetailResponse(ResumeResponse):
    """Resume with parsed text (for internal pipeline use)."""
    parsed_text: str | None


class ResumeListResponse(BaseModel):
    """Paginated list of resumes."""
    items: list[ResumeResponse]
    total: int
