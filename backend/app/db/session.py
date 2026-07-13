"""Async database engine and session management.

Provides the async engine, session factory, and a FastAPI dependency
for injecting database sessions into route handlers.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from sqlalchemy.engine.url import make_url
from app.core.config import settings

try:
    _url_obj = make_url(settings.DATABASE_URL)
    if _url_obj.drivername in ("postgres", "postgresql"):
        _url_obj = _url_obj.set(drivername="postgresql+asyncpg")
    
    # Enforce SSL and correct IPv4 port for remote databases (like Supabase)
    if _url_obj.host and _url_obj.host not in ("localhost", "127.0.0.1", "db", "postgres"):
        if "ssl" not in _url_obj.query:
            _url_obj = _url_obj.update_query_dict({"ssl": "require"})
        
        # Supabase pooler requires port 6543 for IPv4 (Render doesn't support IPv6)
        if "pooler.supabase.com" in _url_obj.host and _url_obj.port == 5432:
            _url_obj = _url_obj.set(port=6543)
            
    db_url = _url_obj.render_as_string(hide_password=False)
except Exception:
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgres://"):

        db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif db_url.startswith("postgresql://") and "+asyncpg" not in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(
    db_url,
    echo=settings.DEBUG,

    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)


async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)
async_session_maker = async_session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields an async database session.

    The session is automatically closed when the request completes.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
