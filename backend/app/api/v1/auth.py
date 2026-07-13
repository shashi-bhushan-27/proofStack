"""Authentication routes — register, login, and current-user lookup."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import TokenResponse, UserCreate, UserLogin, UserResponse
from app.services.auth_service import authenticate_user, register_user, sync_firebase_user

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Create a new user account and return JWT tokens."""
    result = await register_user(db, payload)
    return result


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and get tokens",
)
async def login(
    payload: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Authenticate with email/password and receive JWT tokens."""
    result = await authenticate_user(db, payload)
    return result


@router.post(
    "/sync",
    response_model=UserResponse,
    summary="Synchronize Firebase User with PostgreSQL",
)
async def sync(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Ensure the authenticated Firebase user exists in PostgreSQL and return profile."""
    return await sync_firebase_user(current_user)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Return the currently authenticated user's profile."""
    return UserResponse.model_validate(current_user)

