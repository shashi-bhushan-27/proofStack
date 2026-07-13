"""Interrogation schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class InterrogationSessionCreate(BaseModel):
    """Request body for starting a new interrogation session."""
    skill_evidence_id: uuid.UUID


class InterrogationMessageCreate(BaseModel):
    """User reply in an interrogation session."""
    content: str = Field(..., min_length=1, max_length=5000)


class InterrogationMessageResponse(BaseModel):
    """Single message in a session."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    session_id: uuid.UUID
    role: str
    content: str
    created_at: datetime


class InterrogationSessionResponse(BaseModel):
    """Session with message history."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    analysis_id: uuid.UUID
    skill_evidence_id: uuid.UUID
    skill_name: str
    status: str
    generated_bullet: str | None
    created_at: datetime
    updated_at: datetime
    messages: list[InterrogationMessageResponse] = []


class GeneratedBulletResponse(BaseModel):
    """Response when a bullet point is generated from the session."""
    session_id: uuid.UUID
    skill_name: str
    generated_bullet: str
