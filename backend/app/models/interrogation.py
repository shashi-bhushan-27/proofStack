"""Interrogation models — session + message for skill deep-dive conversations."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class InterrogationStatus(str, enum.Enum):
    active = "active"
    ACTIVE = "active"
    completed = "completed"
    COMPLETED = "completed"
    abandoned = "abandoned"
    ABANDONED = "abandoned"


class MessageRole(str, enum.Enum):
    ai = "ai"
    AI = "ai"
    user = "user"
    USER = "user"


class InterrogationSession(Base):
    __tablename__ = "interrogation_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    analysis_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False
    )
    skill_evidence_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("skill_evidences.id", ondelete="CASCADE"), nullable=False
    )
    skill_name: Mapped[str] = mapped_column(String(256), nullable=False)
    status: Mapped[InterrogationStatus] = mapped_column(
        Enum(InterrogationStatus, name="interrogation_status", create_constraint=True),
        default=InterrogationStatus.active,
        server_default="active",
        nullable=False,
    )
    generated_bullet: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # ── Relationships ────────────────────────────────────────────────────
    analysis: Mapped["Analysis"] = relationship(back_populates="interrogation_sessions")  # noqa: F821
    skill_evidence: Mapped["SkillEvidence"] = relationship(back_populates="interrogation_sessions")  # noqa: F821
    messages: Mapped[list["InterrogationMessage"]] = relationship(
        back_populates="session", cascade="all, delete-orphan",
        lazy="selectin", order_by="InterrogationMessage.created_at"
    )

    __table_args__ = (
        Index("ix_interrogation_sessions_analysis_id", "analysis_id"),
        Index("ix_interrogation_sessions_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<InterrogationSession {self.skill_name} ({self.status.value})>"


class InterrogationMessage(Base):
    __tablename__ = "interrogation_messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("interrogation_sessions.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[MessageRole] = mapped_column(
        Enum(MessageRole, name="message_role", create_constraint=True),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # ── Relationships ────────────────────────────────────────────────────
    session: Mapped["InterrogationSession"] = relationship(back_populates="messages")

    __table_args__ = (
        Index("ix_interrogation_messages_session_id", "session_id"),
        Index("ix_interrogation_messages_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<InterrogationMessage {self.role.value} len={len(self.content)}>"
