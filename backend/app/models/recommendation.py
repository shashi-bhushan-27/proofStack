"""Recommendation model — actionable improvement suggestions."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RecommendationPriority(str, enum.Enum):
    critical = "critical"
    CRITICAL = "critical"
    high = "high"
    HIGH = "high"
    medium = "medium"
    MEDIUM = "medium"
    low = "low"
    LOW = "low"


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    analysis_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False
    )
    skill_evidence_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skill_evidences.id", ondelete="SET NULL"), nullable=True
    )
    priority: Mapped[RecommendationPriority] = mapped_column(
        Enum(RecommendationPriority, name="recommendation_priority", create_constraint=True),
        nullable=False,
    )
    category: Mapped[str] = mapped_column(String(128), nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    example_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # ── Relationships ────────────────────────────────────────────────────
    analysis: Mapped["Analysis"] = relationship(back_populates="recommendations")  # noqa: F821
    skill_evidence: Mapped["SkillEvidence | None"] = relationship(back_populates="recommendations")  # noqa: F821

    __table_args__ = (
        Index("ix_recommendations_analysis_id", "analysis_id"),
    )

    def __repr__(self) -> str:
        return f"<Recommendation {self.title} ({self.priority.value})>"
