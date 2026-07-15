"""Analysis model — the central result entity linking resume ↔ JD evaluation."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index, Text, func
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AnalysisStatus(str, enum.Enum):
    """Pipeline stages an analysis progresses through."""
    pending = "pending"
    PENDING = "pending"
    extracting_resume = "extracting_resume"
    EXTRACTING_RESUME = "extracting_resume"
    analyzing_requirements = "analyzing_requirements"
    ANALYZING_REQUIREMENTS = "analyzing_requirements"
    matching_skills = "matching_skills"
    MATCHING_SKILLS = "matching_skills"
    finding_evidence = "finding_evidence"
    FINDING_EVIDENCE = "finding_evidence"
    evaluating_strength = "evaluating_strength"
    EVALUATING_STRENGTH = "evaluating_strength"
    generating_recommendations = "generating_recommendations"
    GENERATING_RECOMMENDATIONS = "generating_recommendations"
    completed = "completed"
    COMPLETED = "completed"
    failed = "failed"
    FAILED = "failed"


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    resume_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False
    )
    job_description_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False
    )

    status: Mapped[AnalysisStatus] = mapped_column(
        Enum(AnalysisStatus, name="analysis_status", create_constraint=True),
        default=AnalysisStatus.pending,
        server_default="pending",
        nullable=False,
    )

    # ── Scores (populated after pipeline completes) ──────────────────────
    overall_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    required_coverage_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    evidence_strength_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    preferred_coverage_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    experience_relevance_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    communication_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    scoring_breakdown: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # ── Relationships ────────────────────────────────────────────────────
    user: Mapped["User | None"] = relationship(back_populates="analyses")  # noqa: F821
    resume: Mapped["Resume"] = relationship(back_populates="analyses")  # noqa: F821
    job_description: Mapped["JobDescription"] = relationship(back_populates="analyses")  # noqa: F821
    job_requirements: Mapped[list["JobRequirement"]] = relationship(  # noqa: F821
        back_populates="analysis", cascade="all, delete-orphan", lazy="noload"
    )
    resume_skills: Mapped[list["ResumeSkill"]] = relationship(  # noqa: F821
        back_populates="analysis", cascade="all, delete-orphan", lazy="noload"
    )
    skill_evidences: Mapped[list["SkillEvidence"]] = relationship(  # noqa: F821
        back_populates="analysis", cascade="all, delete-orphan", lazy="noload"
    )
    recommendations: Mapped[list["Recommendation"]] = relationship(  # noqa: F821
        back_populates="analysis", cascade="all, delete-orphan", lazy="noload"
    )
    interrogation_sessions: Mapped[list["InterrogationSession"]] = relationship(  # noqa: F821
        back_populates="analysis", cascade="all, delete-orphan", lazy="noload"
    )

    __table_args__ = (
        Index("ix_analyses_user_id", "user_id"),
        Index("ix_analyses_resume_id", "resume_id"),
        Index("ix_analyses_created_at", "created_at"),
        Index("ix_analyses_status", "status"),
    )

    def __repr__(self) -> str:
        return f"<Analysis {self.id} status={self.status}>"
