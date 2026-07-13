"""Interrogation routes — start sessions, send messages, generate bullets."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.interrogation import (
    GeneratedBulletResponse,
    InterrogationMessageCreate,
    InterrogationMessageResponse,
    InterrogationSessionCreate,
    InterrogationSessionResponse,
)
from app.services.interrogation_service import (
    generate_bullet_from_session,
    get_session,
    process_message,
    start_interrogation,
)

router = APIRouter()


@router.post(
    "/analyses/{analysis_id}/interrogation",
    response_model=InterrogationSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start an interrogation session (auth required)",
)
async def start_interrogation_endpoint(
    analysis_id: uuid.UUID,
    payload: InterrogationSessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InterrogationSessionResponse:
    """Start a new interrogation session for a specific skill evidence.

    The AI will ask targeted questions to gather evidence for the skill.
    """
    session = await start_interrogation(
        db=db,
        analysis_id=analysis_id,
        skill_evidence_id=payload.skill_evidence_id,
        user=current_user,
    )
    return InterrogationSessionResponse.model_validate(session)


@router.post(
    "/interrogation/{session_id}/message",
    response_model=InterrogationSessionResponse,
    summary="Send a message in an interrogation session (auth required)",
)
async def send_message_endpoint(
    session_id: uuid.UUID,
    payload: InterrogationMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InterrogationSessionResponse:
    """Send a user response and receive the next AI question."""
    session = await process_message(
        db=db,
        session_id=session_id,
        user_message=payload.content,
        user=current_user,
    )
    return InterrogationSessionResponse.model_validate(session)


@router.get(
    "/interrogation/{session_id}",
    response_model=InterrogationSessionResponse,
    summary="Get interrogation session details (auth required)",
)
async def get_session_endpoint(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InterrogationSessionResponse:
    """Retrieve the full message history of an interrogation session."""
    session = await get_session(db=db, session_id=session_id, user=current_user)
    return InterrogationSessionResponse.model_validate(session)


@router.post(
    "/interrogation/{session_id}/generate-bullet",
    response_model=GeneratedBulletResponse,
    summary="Generate a resume bullet from the session (auth required)",
)
async def generate_bullet_endpoint(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GeneratedBulletResponse:
    """Generate a resume bullet point from the interrogation session answers.

    Only uses information the user explicitly provided — never invents details.
    """
    result = await generate_bullet_from_session(
        db=db, session_id=session_id, user=current_user
    )
    return result
