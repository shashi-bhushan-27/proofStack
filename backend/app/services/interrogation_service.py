import logging
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.ai import interrogation_engine, bullet_generator
from app.core import cache
from app.models.interrogation import InterrogationSession, InterrogationMessage, InterrogationStatus, MessageRole
from app.models.skill_evidence import SkillEvidence
from app.models.user import User
from app.schemas.interrogation import InterrogationSessionResponse, GeneratedBulletResponse
from app.observability.context import obs_analysis_id, obs_user_id

logger = logging.getLogger(__name__)

async def get_session(
    db: AsyncSession,
    session_id: UUID,
    user: User | None = None,
) -> InterrogationSession:
    """Retrieve an interrogation session with all messages loaded."""
    stmt = select(InterrogationSession).where(InterrogationSession.id == session_id).options(selectinload(InterrogationSession.messages))
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interrogation session not found")
    return session

async def start_interrogation(
    db: AsyncSession,
    analysis_id: UUID,
    skill_evidence_id: UUID,
    user: User | None = None,
) -> InterrogationSession:
    """
    Start a new progressive interrogation session for a specific skill evidence item.
    """
    stmt = select(SkillEvidence).where(SkillEvidence.id == skill_evidence_id, SkillEvidence.analysis_id == analysis_id)
    res = await db.execute(stmt)
    evidence = res.scalar_one_or_none()
    
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill evidence not found for this analysis")

    obs_analysis_id.set(analysis_id)
    if user:
        obs_user_id.set(user.id)

    # Check if active session exists
    session_stmt = select(InterrogationSession).where(
        InterrogationSession.skill_evidence_id == skill_evidence_id,
        InterrogationSession.status == InterrogationStatus.ACTIVE
    ).options(selectinload(InterrogationSession.messages))
    
    existing_res = await db.execute(session_stmt)
    existing_session = existing_res.scalar_one_or_none()
    
    if existing_session:
        return existing_session

    from app.models.job_requirement import JobRequirement
    req_stmt = select(JobRequirement).where(JobRequirement.id == evidence.job_requirement_id)
    req_res = await db.execute(req_stmt)
    requirement = req_res.scalar_one()
    skill_name = requirement.skill_name

    session = InterrogationSession(
        analysis_id=analysis_id,
        skill_evidence_id=skill_evidence_id,
        skill_name=skill_name,
        status=InterrogationStatus.ACTIVE,
    )
    db.add(session)
    await db.flush()

    question_result = await interrogation_engine.generate_questions(
        skill_name=skill_name,
        current_evidence_text=evidence.supporting_text,
        chat_history=[],
    )

    initial_msg = InterrogationMessage(
        session_id=session.id,
        role=MessageRole.AI,
        content=question_result.next_question,
    )
    db.add(initial_msg)
    await db.commit()
    
    reload_stmt = select(InterrogationSession).where(InterrogationSession.id == session.id).options(selectinload(InterrogationSession.messages))
    reload_res = await db.execute(reload_stmt)
    return reload_res.scalar_one()

async def process_message(
    db: AsyncSession,
    session_id: UUID,
    user_message: str,
    user: User | None = None,
) -> InterrogationSession:
    """
    Process candidate response, generate next AI question or finish bullet, and return updated session.
    """
    stmt = select(InterrogationSession).where(InterrogationSession.id == session_id).options(selectinload(InterrogationSession.messages))
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interrogation session not found")
    if session.status != InterrogationStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Interrogation session is no longer active")

    obs_analysis_id.set(session.analysis_id)
    if user:
        obs_user_id.set(user.id)

    user_msg = InterrogationMessage(
        session_id=session.id,
        role=MessageRole.USER,
        content=user_message,
    )
    db.add(user_msg)
    await db.flush()

    msg_stmt = select(InterrogationMessage).where(InterrogationMessage.session_id == session.id).order_by(InterrogationMessage.created_at)
    msg_res = await db.execute(msg_stmt)
    all_msgs = msg_res.scalars().all()
    
    chat_history = [{"role": m.role.value, "content": m.content} for m in all_msgs]

    ev_stmt = select(SkillEvidence).where(SkillEvidence.id == session.skill_evidence_id)
    ev_res = await db.execute(ev_stmt)
    evidence = ev_res.scalar_one_or_none()
    
    ai_result = await interrogation_engine.generate_questions(
        skill_name=session.skill_name,
        current_evidence_text=evidence.supporting_text if evidence else None,
        chat_history=chat_history,
    )

    if ai_result.is_ready_for_bullet or len(all_msgs) >= 10:
        bullet_res = await bullet_generator.generate_bullet(
            skill_name=session.skill_name,
            chat_history=chat_history,
        )
        session.status = InterrogationStatus.COMPLETED
        session.generated_bullet = bullet_res.suggested_bullet
        
        final_ai_text = f"Here is your STAR-aligned resume bullet point based on verified answers:\n\n**{bullet_res.suggested_bullet}**\n\n_{bullet_res.explanation}_"
    else:
        final_ai_text = ai_result.next_question
        if ai_result.encouragement:
            final_ai_text = f"{ai_result.encouragement}\n\n{final_ai_text}"

    ai_msg = InterrogationMessage(
        session_id=session.id,
        role=MessageRole.AI,
        content=final_ai_text,
    )
    db.add(ai_msg)
    await db.commit()
    await cache.delete_cache(f"analysis:detail:{session.analysis_id}")
    
    reload_stmt = select(InterrogationSession).where(InterrogationSession.id == session.id).options(selectinload(InterrogationSession.messages))
    reload_res = await db.execute(reload_stmt)
    return reload_res.scalar_one()

async def generate_bullet_from_session(
    db: AsyncSession,
    session_id: UUID,
    user: User | None = None,
) -> GeneratedBulletResponse:
    """
    Explicitly trigger bullet generation for an active or completed session.
    """
    stmt = select(InterrogationSession).where(InterrogationSession.id == session_id).options(selectinload(InterrogationSession.messages))
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interrogation session not found")

    obs_analysis_id.set(session.analysis_id)
    if user:
        obs_user_id.set(user.id)

    msg_stmt = select(InterrogationMessage).where(InterrogationMessage.session_id == session.id).order_by(InterrogationMessage.created_at)
    msg_res = await db.execute(msg_stmt)
    all_msgs = msg_res.scalars().all()
    
    chat_history = [{"role": m.role.value, "content": m.content} for m in all_msgs]
    
    bullet_res = await bullet_generator.generate_bullet(
        skill_name=session.skill_name,
        chat_history=chat_history,
    )
    
    session.status = InterrogationStatus.COMPLETED
    session.generated_bullet = bullet_res.suggested_bullet
    await db.commit()
    await cache.delete_cache(f"analysis:detail:{session.analysis_id}")
    
    return GeneratedBulletResponse(
        bullet=bullet_res.suggested_bullet,
        explanation=bullet_res.explanation,
    )
