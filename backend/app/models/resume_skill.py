"""Resume skill model — skills found in the resume by the AI parser."""

import uuid

from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ResumeSkill(Base):
    __tablename__ = "resume_skills"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    analysis_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False
    )
    skill_name: Mapped[str] = mapped_column(String(256), nullable=False)
    normalized_skill_name: Mapped[str] = mapped_column(String(256), nullable=False)
    locations: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # ── Relationships ────────────────────────────────────────────────────
    analysis: Mapped["Analysis"] = relationship(back_populates="resume_skills")  # noqa: F821
    skill_evidences: Mapped[list["SkillEvidence"]] = relationship(  # noqa: F821
        back_populates="resume_skill", cascade="all, delete-orphan", lazy="noload"
    )

    __table_args__ = (
        Index("ix_resume_skills_analysis_id", "analysis_id"),
    )

    def __repr__(self) -> str:
        return f"<ResumeSkill {self.skill_name}>"
