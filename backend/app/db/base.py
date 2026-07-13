"""SQLAlchemy 2.0 DeclarativeBase for all models."""

from sqlalchemy.orm import DeclarativeBase, MappedAsDataclass


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models.

    Uses the SQLAlchemy 2.0 DeclarativeBase style.
    All models should inherit from this class.
    """
    pass
