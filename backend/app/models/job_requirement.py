"""Job requirement model — skills/requirements extracted from a JD by the AI."""

import enum
import uuid

from sqlalchemy import Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SkillImportance(str, enum.Enum):
    required = "required"
    REQUIRED = "required"
    preferred = "preferred"
    PREFERRED = "preferred"
    optional = "optional"
    OPTIONAL = "optional"


class SkillCategory(str, enum.Enum):
    language = "language"
    LANGUAGE = "language"
    framework = "framework"
    FRAMEWORK = "framework"
    database = "database"
    DATABASE = "database"
    cloud = "cloud"
    CLOUD = "cloud"
    devops = "devops"
    DEVOPS = "devops"
    ai_ml = "ai_ml"
    AI_ML = "ai_ml"
    tool = "tool"
    TOOL = "tool"
    soft_skill = "soft_skill"
    SOFT_SKILL = "soft_skill"
    domain = "domain"
    DOMAIN = "domain"


class JobRequirement(Base):
    __tablename__ = "job_requirements"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    analysis_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False
    )
    skill_name: Mapped[str] = mapped_column(String(256), nullable=False)
    normalized_skill_name: Mapped[str] = mapped_column(String(256), nullable=False)
    importance: Mapped[SkillImportance] = mapped_column(
        Enum(SkillImportance, name="skill_importance", create_constraint=True),
        nullable=False,
    )
    category: Mapped[SkillCategory] = mapped_column(
        Enum(SkillCategory, name="skill_category", create_constraint=True),
        nullable=False,
    )
    source_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    context_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Relationships ────────────────────────────────────────────────────
    analysis: Mapped["Analysis"] = relationship(back_populates="job_requirements")  # noqa: F821
    skill_evidences: Mapped[list["SkillEvidence"]] = relationship(  # noqa: F821
        back_populates="job_requirement", cascade="all, delete-orphan", lazy="selectin"
    )

    __table_args__ = (
        Index("ix_job_requirements_analysis_id", "analysis_id"),
    )

    def __repr__(self) -> str:
        return f"<JobRequirement {self.skill_name} ({self.importance.value})>"
