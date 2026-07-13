"""Job description schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class JobDescriptionCreate(BaseModel):
    """Request body for creating a job description."""
    job_title: str = Field(..., min_length=1, max_length=512)
    company_name: str | None = Field(None, max_length=256)
    raw_text: str = Field(..., min_length=50, max_length=50000)


class JobDescriptionResponse(BaseModel):
    """Job description representation."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID | None
    job_title: str
    company_name: str | None
    raw_text: str
    created_at: datetime
