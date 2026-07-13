"""User model for authentication and ownership."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Index, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    firebase_uid: Mapped[str | None] = mapped_column(
        String(128), unique=True, nullable=True, index=True
    )
    email: Mapped[str] = mapped_column(
        String(320), unique=True, nullable=False, index=True
    )
    hashed_password: Mapped[str | None] = mapped_column(String(256), nullable=True)
    full_name: Mapped[str | None] = mapped_column(String(256), nullable=True)
    auth_provider: Mapped[str] = mapped_column(
        String(50), default="firebase", server_default="firebase"
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    subscription_tier: Mapped[str] = mapped_column(String(50), default="free", server_default="free")
    subscription_status: Mapped[str] = mapped_column(String(50), default="active", server_default="active")
    cashfree_subscription_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    cashfree_customer_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    daily_analyses_count: Mapped[int] = mapped_column(default=0, server_default="0")
    last_analysis_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


    # ── Relationships ────────────────────────────────────────────────────
    resumes: Mapped[list["Resume"]] = relationship(  # noqa: F821
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )
    job_descriptions: Mapped[list["JobDescription"]] = relationship(  # noqa: F821
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )
    analyses: Mapped[list["Analysis"]] = relationship(  # noqa: F821
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )

    __table_args__ = (
        Index("ix_users_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<User {self.email}>"
