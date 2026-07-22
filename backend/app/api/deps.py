"""FastAPI dependencies for authentication and authorization.

Provides reusable Depends() callables for route handlers.
"""

import asyncio
import json
import uuid
from datetime import datetime, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import cache
from app.core.config import settings
from app.core.security import decode_access_token, verify_firebase_token
from app.db.session import get_db
from app.models.user import User

_bearer_scheme = HTTPBearer(auto_error=True)
_bearer_scheme_optional = HTTPBearer(auto_error=False)


def _user_dict_from_model(user: User) -> dict:
    d = {}
    for c in user.__table__.columns:
        val = getattr(user, c.name)
        if isinstance(val, uuid.UUID):
            d[c.name] = str(val)
        elif hasattr(val, "isoformat"):
            d[c.name] = val.isoformat()
        else:
            d[c.name] = val
    return d


async def _user_from_dict(d: dict, db: AsyncSession) -> User:
    user_data = d.copy()
    if "id" in user_data and isinstance(user_data["id"], str):
        user_data["id"] = uuid.UUID(user_data["id"])
    if "created_at" in user_data and isinstance(user_data["created_at"], str):
        user_data["created_at"] = datetime.fromisoformat(user_data["created_at"])
    if "updated_at" in user_data and isinstance(user_data["updated_at"], str):
        user_data["updated_at"] = datetime.fromisoformat(user_data["updated_at"])
    if "last_analysis_date" in user_data and user_data["last_analysis_date"] and isinstance(user_data["last_analysis_date"], str):
        user_data["last_analysis_date"] = datetime.fromisoformat(user_data["last_analysis_date"])
    user = User(**user_data)
    return await db.merge(user)


async def _cache_and_return_user(user: User | None, db: AsyncSession) -> User | None:
    if user and user.is_active and user.firebase_uid:
        try:
            await db.refresh(user)
        except Exception:
            pass
        ud = _user_dict_from_model(user)
        cache.set_l1_auth_cache(user.firebase_uid, ud, ttl_seconds=60)
        await cache.set_compressed_json(f"auth:user:{user.firebase_uid}", json.dumps(ud), expire=900)  # 15 mins
    return user if (user and user.is_active) else None


async def _get_or_sync_user(claims: dict, db: AsyncSession) -> User | None:
    """Find or create a PostgreSQL User based on token claims (`uid`, `email`)."""
    if claims.get("type") == "guest":
        return None

    uid = claims.get("uid")
    email = claims.get("email")

    if uid:
        uid_str = str(uid)
        # Check L1 memory
        l1_dict = cache.get_l1_auth_cache(uid_str)
        if l1_dict:
            user = await _user_from_dict(l1_dict, db)
            return user if user.is_active else None

        # Check L2 Upstash Redis
        l2_json = await cache.get_compressed_json(f"auth:user:{uid_str}")
        if l2_json:
            try:
                l2_dict = json.loads(l2_json)
                cache.set_l1_auth_cache(uid_str, l2_dict, ttl_seconds=60)
                user = await _user_from_dict(l2_dict, db)
                return user if user.is_active else None
            except Exception:
                pass

    # 1. If uid is a valid UUID, first try looking up directly by User.id (for legacy/test JWTs)
    if uid:
        try:
            user_uuid = uuid.UUID(str(uid))
            result = await db.execute(select(User).where(User.id == user_uuid))
            if user := result.scalar_one_or_none():
                return await _cache_and_return_user(user, db)
        except ValueError:
            pass

        # 2. Look up by firebase_uid
        result = await db.execute(select(User).where(User.firebase_uid == str(uid)))
        if user := result.scalar_one_or_none():
            return await _cache_and_return_user(user, db)

    # 3. Look up by email (to link existing legacy user account or find email-matched user)
    if email:
        result = await db.execute(select(User).where(User.email == email))
        if user := result.scalar_one_or_none():
            if not user.is_active:
                return None
            if uid and not user.firebase_uid:
                user.firebase_uid = str(uid)
                await db.flush()
            return await _cache_and_return_user(user, db)

        # 4. If neither found and we have both uid/email from Firebase, auto-create PostgreSQL User
        if uid and email:
            new_user = User(
                id=uuid.uuid4(),
                firebase_uid=str(uid),
                email=email,
                full_name=claims.get("name") or email.split("@")[0],
                is_active=True,
                auth_provider=claims.get("type", "firebase"),
            )
            db.add(new_user)
            await db.flush()
            await db.refresh(new_user)
            return await _cache_and_return_user(new_user, db)

    return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract and validate the token (Firebase or local JWT), then return the authenticated user.

    Raises 401 if the token is invalid/expired or the user doesn't exist.
    """
    try:
        claims = verify_firebase_token(credentials.credentials)
        if claims.get("type") == "guest":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type (guest token)",
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except (jwt.InvalidTokenError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
        )

    user = await _get_or_sync_user(claims, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return user


async def get_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dependency that ensures the authenticated user is an admin via allowlist."""
    admin_emails = [e.strip() for e in settings.ADMIN_EMAILS.split(",") if e.strip()]
    if not current_user.email or current_user.email not in admin_emails:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access admin resources.",
        )
    return current_user


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme_optional),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Return the authenticated user if a valid token is provided, else None.

    Used for two-tier access endpoints that work for both guests and authed users.
    """
    if credentials is None:
        return None
    try:
        claims = verify_firebase_token(credentials.credentials)
        if claims.get("type") == "guest":
            return None
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, ValueError):
        return None

    return await _get_or_sync_user(claims, db)



def verify_ownership(
    resource_user_id: uuid.UUID | None,
    current_user: User,
    resource_name: str = "resource",
) -> None:
    """Verify that the current user owns the given resource.

    Raises 403 if the resource belongs to a different user.
    """
    if resource_user_id is None:
        # Guest resource — no ownership to verify
        return
    if resource_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You do not have permission to access this {resource_name}",
        )


def verify_guest_token(token: str, expected_analysis_id: uuid.UUID) -> bool:
    """Validate a guest token is scoped to the given analysis.

    Returns True if valid, False otherwise.
    """
    try:
        payload = decode_access_token(token)
        if payload.get("type") != "guest":
            return False
        return payload.get("sub") == str(expected_analysis_id)
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return False


def enforce_daily_analysis_limit(current_user: User | None, increment: bool = False) -> None:
    """Check and enforce the 3 analyses/day limit for Free tier users."""
    if not current_user or current_user.subscription_tier != "free":
        return

    from datetime import datetime, timezone
    now_utc = datetime.now(timezone.utc)
    today = now_utc.date()

    last_date = current_user.last_analysis_date
    if last_date:
        if last_date.tzinfo is None:
            last_date = last_date.replace(tzinfo=timezone.utc)
        last_date_only = last_date.astimezone(timezone.utc).date()
    else:
        last_date_only = None

    modified = False
    if not last_date_only or last_date_only < today:
        current_user.daily_analyses_count = 0
        current_user.last_analysis_date = now_utc
        modified = True

    if current_user.daily_analyses_count >= 3:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Daily analysis limit (3/3) reached on the Free plan. Upgrade to Pro for unlimited evaluations."
        )

    if increment:
        current_user.daily_analyses_count += 1
        current_user.last_analysis_date = now_utc
        modified = True

    if modified and current_user.firebase_uid:
        cache.delete_l1_auth_cache(current_user.firebase_uid)
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(cache.delete_cache(f"auth:user:{current_user.firebase_uid}"))
        except RuntimeError:
            pass
