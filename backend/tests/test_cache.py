import json
import time
import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.api.deps import _get_or_sync_user, enforce_daily_analysis_limit
from app.core import cache
from app.db.base import Base
from app.models.user import User


@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
    await engine.dispose()


def test_l1_auth_cache_operations():
    """Verify L1 in-memory auth caching set, get, TTL expiration, and deletion."""
    test_uid = "fb_uid_test_100"
    user_data = {"id": str(uuid.uuid4()), "firebase_uid": test_uid, "email": "test100@proofstack.com"}

    # Set in L1 cache
    cache.set_l1_auth_cache(test_uid, user_data, ttl_seconds=60)
    cached = cache.get_l1_auth_cache(test_uid)
    assert cached == user_data

    # Test deletion
    cache.delete_l1_auth_cache(test_uid)
    assert cache.get_l1_auth_cache(test_uid) is None

    # Test expiration
    cache.set_l1_auth_cache(test_uid, user_data, ttl_seconds=-1)  # Expired immediately
    assert cache.get_l1_auth_cache(test_uid) is None


@pytest.mark.asyncio
async def test_compressed_json_caching():
    """Verify zlib compression and decompression logic for JSON data."""
    test_key = "analysis:detail:test-uuid-999"
    payload = {"analysis_id": "test-uuid-999", "score": 85, "data": "A" * 1000}
    json_str = json.dumps(payload)

    mock_redis = AsyncMock()
    mock_redis.get = AsyncMock()
    mock_redis.set = AsyncMock(return_value=True)

    with patch("app.core.cache.get_redis_client", return_value=mock_redis):
        success = await cache.set_compressed_json(test_key, json_str, expire=604800)
        assert success is True
        assert mock_redis.set.called

        # Extract stored bytes passed to redis.set
        stored_key, stored_bytes = mock_redis.set.call_args[0]
        assert stored_key == test_key
        assert isinstance(stored_bytes, bytes)
        # Verify stored size is smaller than raw json due to zlib compression
        assert len(stored_bytes) < len(json_str.encode("utf-8"))

        # Now mock get returning the compressed bytes
        mock_redis.get.return_value = stored_bytes
        decompressed_json = await cache.get_compressed_json(test_key)
        assert decompressed_json == json_str
        assert json.loads(decompressed_json)["score"] == 85


@pytest.mark.asyncio
async def test_auth_sync_hybrid_caching(db_session: AsyncSession):
    """Verify _get_or_sync_user populates L1 and L2 cache and uses L1 on subsequent requests."""
    claims = {
        "uid": "fb_uid_hybrid_555",
        "email": "hybrid555@proofstack.com",
        "name": "Hybrid Caching User",
        "type": "firebase",
    }

    mock_redis = AsyncMock()
    mock_redis.get = AsyncMock(return_value=None)
    mock_redis.set = AsyncMock(return_value=True)

    with patch("app.core.cache.get_redis_client", return_value=mock_redis):
        # Clear L1
        cache.delete_l1_auth_cache("fb_uid_hybrid_555")

        # 1st call: queries database, creates user, populates L1 and L2 cache
        user1 = await _get_or_sync_user(claims, db_session)
        assert user1 is not None
        assert user1.email == "hybrid555@proofstack.com"

        # Check L1 cache populated
        l1_cached = cache.get_l1_auth_cache("fb_uid_hybrid_555")
        assert l1_cached is not None
        assert l1_cached["email"] == "hybrid555@proofstack.com"

        # 2nd call: should hit L1 cache directly and return a valid User object
        user2 = await _get_or_sync_user(claims, db_session)
        assert user2 is not None
        assert user2.id == user1.id
        assert user2.firebase_uid == "fb_uid_hybrid_555"


def test_enforce_daily_analysis_limit_cache_invalidation():
    """Verify daily analysis limit increments and clears L1 auth cache."""
    user = User(
        id=uuid.uuid4(),
        firebase_uid="fb_uid_limit_777",
        email="limit@proofstack.com",
        subscription_tier="free",
        daily_analyses_count=1,
        last_analysis_date=datetime.now(timezone.utc),
    )

    # Put user in L1 cache
    cache.set_l1_auth_cache("fb_uid_limit_777", {"id": str(user.id), "firebase_uid": "fb_uid_limit_777"})
    assert cache.get_l1_auth_cache("fb_uid_limit_777") is not None

    # Enforce limit with increment=True
    enforce_daily_analysis_limit(user, increment=True)
    assert user.daily_analyses_count == 2

    # Verify L1 auth cache is cleared upon increment
    assert cache.get_l1_auth_cache("fb_uid_limit_777") is None
