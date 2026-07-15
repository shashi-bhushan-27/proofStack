"""Caching utility module using Upstash/Redis with payload compression and L1 memory cache."""

import asyncio
import logging
import time
import zlib
from typing import Any

import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger(__name__)

# Global Redis clients keyed by asyncio loop ID
_redis_clients: dict[int, aioredis.Redis] = {}

# In-memory L1 cache for fast auth lookups (key -> (value, expire_timestamp))
_l1_auth_cache: dict[str, tuple[dict[str, Any], float]] = {}


def get_redis_client() -> aioredis.Redis | None:
    """Get or initialize the global async Redis client for the current event loop."""
    if not settings.REDIS_URL:
        return None

    try:
        loop = asyncio.get_running_loop()
        loop_id = id(loop)
    except RuntimeError:
        return None

    if loop.is_closed():
        return None

    if loop_id in _redis_clients:
        return _redis_clients[loop_id]

    try:
        kwargs: dict[str, Any] = {"decode_responses": False}
        if settings.REDIS_URL.startswith("rediss://"):
            kwargs["ssl_cert_reqs"] = "none"

        client = aioredis.from_url(settings.REDIS_URL, **kwargs)
        _redis_clients[loop_id] = client
        return client
    except Exception as e:
        logger.error(f"Failed to initialize Redis client: {e}")
        return None


async def get_cache_bytes(key: str) -> bytes | None:
    """Fetch raw bytes from Redis cache."""
    client = get_redis_client()
    if not client:
        return None
    try:
        data = await client.get(key)
        return data
    except Exception as e:
        logger.warning(f"Redis GET error for {key}: {e}")
        return None


async def set_cache_bytes(key: str, value: bytes, expire: int = 604800) -> bool:
    """Store raw bytes in Redis cache with an expiration time in seconds (default 7 days)."""
    client = get_redis_client()
    if not client:
        return False
    try:
        await client.set(key, value, ex=expire)
        return True
    except Exception as e:
        logger.warning(f"Redis SET error for {key}: {e}")
        return False


async def get_compressed_json(key: str) -> str | None:
    """Fetch and decompress a JSON string from Redis cache."""
    data = await get_cache_bytes(key)
    if not data:
        return None
    try:
        decompressed = zlib.decompress(data)
        return decompressed.decode("utf-8")
    except zlib.error:
        # Fallback in case data was not compressed
        try:
            return data.decode("utf-8")
        except Exception:
            return None
    except Exception as e:
        logger.warning(f"Error decompressing cache key {key}: {e}")
        return None


async def set_compressed_json(key: str, json_str: str, expire: int = 604800) -> bool:
    """Compress and store a JSON string in Redis cache."""
    try:
        compressed = zlib.compress(json_str.encode("utf-8"))
        return await set_cache_bytes(key, compressed, expire=expire)
    except Exception as e:
        logger.warning(f"Error compressing cache key {key}: {e}")
        return False


async def delete_cache(key: str) -> bool:
    """Delete a key from Redis cache."""
    client = get_redis_client()
    if not client:
        return False
    try:
        await client.delete(key)
        return True
    except Exception as e:
        logger.warning(f"Redis DELETE error for {key}: {e}")
        return False


# ── L1 Memory Cache for Auth (reduces Upstash RPD usage) ─────────────────────

def get_l1_auth_cache(firebase_uid: str) -> dict[str, Any] | None:
    """Get cached user dict from in-memory L1 cache if valid."""
    now = time.time()
    if firebase_uid in _l1_auth_cache:
        val, exp = _l1_auth_cache[firebase_uid]
        if now < exp:
            return val
        else:
            _l1_auth_cache.pop(firebase_uid, None)
    return None


def set_l1_auth_cache(firebase_uid: str, user_dict: dict[str, Any], ttl_seconds: int = 60) -> None:
    """Set user dict into in-memory L1 cache."""
    _l1_auth_cache[firebase_uid] = (user_dict, time.time() + ttl_seconds)


def delete_l1_auth_cache(firebase_uid: str) -> None:
    """Remove a user from L1 cache."""
    _l1_auth_cache.pop(firebase_uid, None)
