"""Analysis schemas."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.analysis import AnalysisStatus


class AnalysisCreate(BaseModel):
    """Request body for creating a new analysis."""
    resume_id: uuid.UUID
    job_title: str = Field(..., min_length=1, max_length=512)
    company_name: str | None = Field(None, max_length=256)
    job_description_text: str = Field(..., min_length=50, max_length=50000)


class AnalysisResponse(BaseModel):
    """Summary analysis representation (for lists)."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID | None
    resume_id: uuid.UUID
    job_description_id: uuid.UUID
    status: AnalysisStatus
    overall_score: float | None
    required_coverage_score: float | None
    evidence_strength_score: float | None
    preferred_coverage_score: float | None
    experience_relevance_score: float | None
    communication_score: float | None
    error_message: str | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class AnalysisCreateResponse(BaseModel):
    """Returned when a new analysis is created — includes guest token for anon users."""
    analysis: AnalysisResponse
    guest_token: str | None = None


class AnalysisListResponse(BaseModel):
    """Paginated list of analyses."""
    items: list[AnalysisResponse]
    total: int


class AnalysisDetailResponse(AnalysisResponse):
    """Full analysis with nested child data."""
    scoring_breakdown: dict[str, Any] | None = None
    job_requirements: list[dict[str, Any]] = []
    resume_skills: list[dict[str, Any]] = []
    skill_evidences: list[dict[str, Any]] = []
    recommendations: list[dict[str, Any]] = []
