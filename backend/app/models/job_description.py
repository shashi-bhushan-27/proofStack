"""Job description model — stores raw JD text and metadata."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    job_title: Mapped[str] = mapped_column(String(512), nullable=False)
    company_name: Mapped[str | None] = mapped_column(String(256), nullable=True)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # ── Relationships ────────────────────────────────────────────────────
    user: Mapped["User | None"] = relationship(back_populates="job_descriptions")  # noqa: F821
    analyses: Mapped[list["Analysis"]] = relationship(  # noqa: F821
        back_populates="job_description", cascade="all, delete-orphan", lazy="noload"
    )

    __table_args__ = (
        Index("ix_job_descriptions_user_id", "user_id"),
        Index("ix_job_descriptions_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<JobDescription {self.job_title}>"
