"""Password hashing and JWT token utilities.

Uses argon2-cffi for password hashing and PyJWT for token management.
"""

from datetime import datetime, timedelta, timezone
from typing import Any
import uuid

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError

try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth, credentials
except ImportError:
    firebase_admin = None
    firebase_auth = None

from app.core.config import settings

import os

import json

if firebase_admin and not firebase_admin._apps:
    json_env = os.environ.get("FIREBASE_CREDENTIALS_JSON") or os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")
    if json_env:
        try:
            cred_dict = json.loads(json_env)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred, options={"projectId": settings.FIREBASE_PROJECT_ID or "proofstack-b606d"})
        except Exception as e:
            print(f"Error loading FIREBASE_CREDENTIALS_JSON: {e}")

    if not firebase_admin._apps:
        cred_path = settings.FIREBASE_CREDENTIALS_PATH
        if not cred_path or not os.path.exists(cred_path):
            for candidate in (
                "/app/firebase-credentials.json",
                "firebase-credentials.json",
                os.path.join(os.path.dirname(__file__), "../../firebase-credentials.json"),
                "../proofstack-b606d-firebase-adminsdk-fbsvc-229165d20f.json",
                "proofstack-b606d-firebase-adminsdk-fbsvc-229165d20f.json",
                os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", ""),
            ):
                if candidate and os.path.exists(candidate):
                    cred_path = candidate
                    break

        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, options={"projectId": settings.FIREBASE_PROJECT_ID or "proofstack-b606d"})
        elif settings.FIREBASE_PROJECT_ID:
            firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})
        else:
            try:
                firebase_admin.initialize_app()
            except ValueError:
                pass





_ph = PasswordHasher(
    time_cost=2,
    memory_cost=65536,
    parallelism=1,
)


def hash_password(password: str) -> str:
    """Hash a plaintext password using Argon2id."""
    return _ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against an Argon2id hash.

    Returns False on mismatch instead of raising an exception.
    """
    try:
        return _ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def create_access_token(
    data: dict[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    """Create a JWT access token.

    Args:
        data: Claims to encode in the token (must include "sub").
        expires_delta: Custom expiration. Defaults to settings value.

    Returns:
        Encoded JWT string.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(
    data: dict[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    """Create a JWT refresh token with a longer lifetime."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_guest_token(analysis_id: str | uuid.UUID) -> str:
    """Create a short-lived guest token scoped to a single analysis.

    Allows unauthenticated users to access their analysis results.
    """
    expire = datetime.now(timezone.utc) + timedelta(
        hours=settings.GUEST_TOKEN_EXPIRE_HOURS
    )
    payload = {
        "sub": str(analysis_id),
        "type": "guest",
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT token.

    Returns:
        Decoded payload dictionary.

    Raises:
        jwt.ExpiredSignatureError: If the token is expired.
        jwt.InvalidTokenError: If the token is invalid.
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


def verify_firebase_token(token: str) -> dict[str, Any]:
    """Verify a token (either a local PyJWT token for testing or a Firebase ID token).

    Returns:
        A dictionary containing user claims: uid, email, name, picture, type.

    Raises:
        jwt.ExpiredSignatureError: If the token is expired.
        jwt.InvalidTokenError / ValueError: If the token cannot be verified.
    """
    # 1. First try checking if it is a local PyJWT token (used by test suite or guest token)
    try:
        payload = decode_access_token(token)
        if payload.get("type") in ("access", "guest", "refresh"):
            uid = payload.get("firebase_uid") or payload.get("sub")
            return {
                "uid": str(uid) if uid else None,
                "email": payload.get("email"),
                "name": payload.get("name"),
                "type": payload.get("type", "access"),
            }
    except (jwt.InvalidTokenError, jwt.ExpiredSignatureError, ValueError) as err:
        # If it's expired locally, we raise if it looks like our token or check Firebase
        if isinstance(err, jwt.ExpiredSignatureError):
            raise
        pass

    # 2. If local decoding didn't apply, verify via firebase_admin
    if not firebase_auth:
        raise ValueError("firebase_admin is not initialized or installed")

    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name") or decoded_token.get("display_name"),
            "picture": decoded_token.get("picture"),
            "type": "firebase",
        }
    except Exception as exc:
        raise ValueError(f"Invalid Firebase ID token: {exc}") from exc

