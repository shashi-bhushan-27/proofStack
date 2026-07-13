"""Evidence schemas."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict

from app.models.skill_evidence import EvidenceLevel


class SkillEvidenceResponse(BaseModel):
    """Summary evidence for a skill."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    analysis_id: uuid.UUID
    job_requirement_id: uuid.UUID
    resume_skill_id: uuid.UUID | None
    evidence_level: EvidenceLevel
    score: int
    classification_explanation: str
    created_at: datetime


class SkillEvidenceDetailResponse(SkillEvidenceResponse):
    """Full evidence detail including all 6 dimensions."""
    evidence_sources: dict[str, Any] | None
    supporting_text: str | None
    action_demonstrated: bool
    technical_context: bool
    implementation_depth: bool
    ownership_clarity: bool
    outcome_described: bool
    measurability: bool


class EvidenceMatrixEntry(BaseModel):
    """One cell of the evidence matrix: requirement × evidence."""
    model_config = ConfigDict(from_attributes=True)

    skill_name: str
    normalized_skill_name: str
    importance: str
    category: str
    evidence_level: EvidenceLevel
    score: int
    classification_explanation: str


class EvidenceMatrixResponse(BaseModel):
    """Full evidence matrix for an analysis."""
    analysis_id: uuid.UUID
    entries: list[EvidenceMatrixEntry]
    total_requirements: int
    covered_count: int
    missing_count: int
