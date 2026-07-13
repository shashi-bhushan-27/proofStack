"""Skill evidence model — the core evidence-classification result for each skill match."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class EvidenceLevel(str, enum.Enum):
    missing = "missing"
    MISSING = "missing"
    mentioned_only = "mentioned_only"
    MENTIONED_ONLY = "mentioned_only"
    weak = "weak"
    WEAK = "weak"
    moderate = "moderate"
    MODERATE = "moderate"
    strong = "strong"
    STRONG = "strong"


class SkillEvidence(Base):
    __tablename__ = "skill_evidences"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    analysis_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False
    )
    job_requirement_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_requirements.id", ondelete="CASCADE"), nullable=False
    )
    resume_skill_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("resume_skills.id", ondelete="SET NULL"), nullable=True
    )

    evidence_level: Mapped[EvidenceLevel] = mapped_column(
        Enum(EvidenceLevel, name="evidence_level", create_constraint=True),
        nullable=False,
    )
    evidence_sources: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    supporting_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    classification_explanation: Mapped[str] = mapped_column(Text, nullable=False)

    # ── Six evidence dimensions ──────────────────────────────────────────
    action_demonstrated: Mapped[bool] = mapped_column(Boolean, default=False)
    technical_context: Mapped[bool] = mapped_column(Boolean, default=False)
    implementation_depth: Mapped[bool] = mapped_column(Boolean, default=False)
    ownership_clarity: Mapped[bool] = mapped_column(Boolean, default=False)
    outcome_described: Mapped[bool] = mapped_column(Boolean, default=False)
    measurability: Mapped[bool] = mapped_column(Boolean, default=False)

    score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # ── Relationships ────────────────────────────────────────────────────
    analysis: Mapped["Analysis"] = relationship(back_populates="skill_evidences")  # noqa: F821
    job_requirement: Mapped["JobRequirement"] = relationship(back_populates="skill_evidences")  # noqa: F821
    resume_skill: Mapped["ResumeSkill | None"] = relationship(back_populates="skill_evidences")  # noqa: F821
    recommendations: Mapped[list["Recommendation"]] = relationship(  # noqa: F821
        back_populates="skill_evidence", cascade="all, delete-orphan", lazy="selectin"
    )
    interrogation_sessions: Mapped[list["InterrogationSession"]] = relationship(  # noqa: F821
        back_populates="skill_evidence", cascade="all, delete-orphan", lazy="selectin"
    )

    __table_args__ = (
        Index("ix_skill_evidences_analysis_id", "analysis_id"),
        Index("ix_skill_evidences_job_requirement_id", "job_requirement_id"),
    )

    def __repr__(self) -> str:
        return f"<SkillEvidence {self.evidence_level.value} score={self.score}>"
