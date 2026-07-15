"""Analysis routes — create, list, detail, skills, recommendations."""

import uuid
from datetime import datetime, timezone
from typing import Any


from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import (
    enforce_daily_analysis_limit,
    get_current_user,
    get_current_user_optional,
    verify_guest_token,
    verify_ownership,
)
from app.core.security import create_guest_token
from app.db.session import get_db
from app.models.analysis import Analysis, AnalysisStatus
from app.models.job_description import JobDescription
from app.models.job_requirement import JobRequirement
from app.models.recommendation import Recommendation
from app.models.resume import Resume
from app.models.resume_skill import ResumeSkill
from app.models.skill_evidence import SkillEvidence
from app.models.user import User
from app.schemas.analysis import (
    AnalysisCreate,
    AnalysisCreateResponse,
    AnalysisDetailResponse,
    AnalysisListResponse,
    AnalysisResponse,
)

router = APIRouter()


async def _get_analysis_or_404(
    analysis_id: uuid.UUID,
    db: AsyncSession,
    options: list[Any] | None = None,
) -> Analysis:
    """Fetch an analysis by ID or raise 404."""
    stmt = select(Analysis).where(Analysis.id == analysis_id)
    if options:
        stmt = stmt.options(*options).execution_options(populate_existing=True)
    result = await db.execute(stmt)
    analysis = result.scalar_one_or_none()
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return analysis


async def _authorize_analysis_access(
    analysis: Analysis,
    current_user: User | None,
    authorization: str | None,
) -> None:
    """Check that the caller can access this analysis (owner or valid guest token)."""
    # If analysis belongs to a user, verify ownership
    if analysis.user_id is not None:
        if current_user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
        verify_ownership(analysis.user_id, current_user, "analysis")
        return

    # Guest analysis — check guest token in Authorization header
    if authorization:
        token = authorization.replace("Bearer ", "").replace("bearer ", "")
        if verify_guest_token(token, analysis.id):
            return

    # Guest analysis with no token — allow read (public guest analysis)
    return


@router.post(
    "",
    response_model=AnalysisCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new analysis (public)",
)
async def create_analysis(
    payload: AnalysisCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> AnalysisCreateResponse:
    """Create an analysis from a resume and inline job description.

    For anonymous users a guest_token is returned for accessing results.
    The analysis pipeline runs as a background task.
    """
    # Validate resume exists

    result = await db.execute(select(Resume).where(Resume.id == payload.resume_id))
    resume = result.scalar_one_or_none()
    if resume is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    # Enforce Subscription & Product Functionality Gating (Free vs Pro)
    enforce_daily_analysis_limit(current_user, increment=True)


    # Create job description record
    jd = JobDescription(
        user_id=current_user.id if current_user else None,
        job_title=payload.job_title,
        company_name=payload.company_name,
        raw_text=payload.job_description_text,
    )
    db.add(jd)
    await db.flush()

    # Create analysis record
    analysis = Analysis(
        user_id=current_user.id if current_user else None,
        resume_id=resume.id,
        job_description_id=jd.id,
        status=AnalysisStatus.pending,
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)

    # Generate guest token for anonymous users
    guest_token: str | None = None
    if current_user is None:
        guest_token = create_guest_token(analysis.id)

    # Launch background analysis pipeline
    # Import here to avoid circular imports
    from app.services.analysis_service import run_analysis
    background_tasks.add_task(run_analysis, analysis.id)

    return AnalysisCreateResponse(
        analysis=AnalysisResponse.model_validate(analysis),
        guest_token=guest_token,
    )


@router.get(
    "",
    response_model=AnalysisListResponse,
    summary="List user's analyses (auth required)",
)
async def list_analyses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalysisListResponse:
    """List all analyses belonging to the authenticated user."""
    result = await db.execute(
        select(Analysis)
        .where(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
    )
    analyses = result.scalars().all()
    return AnalysisListResponse(
        items=[AnalysisResponse.model_validate(a) for a in analyses],
        total=len(analyses),
    )


@router.get(
    "/{analysis_id}",
    response_model=AnalysisDetailResponse,
    summary="Get analysis details",
)
async def get_analysis(
    analysis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
    authorization: str | None = Header(None),
) -> AnalysisDetailResponse:
    """Get full analysis details including scores, evidence, and recommendations."""
    analysis = await _get_analysis_or_404(
        analysis_id,
        db,
        options=[
            selectinload(Analysis.job_requirements),
            selectinload(Analysis.resume_skills),
            selectinload(Analysis.skill_evidences),
            selectinload(Analysis.recommendations),
        ],
    )
    await _authorize_analysis_access(analysis, current_user, authorization)

    return AnalysisDetailResponse(
        **AnalysisResponse.model_validate(analysis).model_dump(),
        scoring_breakdown=analysis.scoring_breakdown,
        job_requirements=[
            {
                "id": str(jr.id),
                "skill_name": jr.skill_name,
                "normalized_skill_name": jr.normalized_skill_name,
                "importance": jr.importance.value,
                "category": jr.category.value,
                "source_text": jr.source_text,
                "context_explanation": jr.context_explanation,
            }
            for jr in analysis.job_requirements
        ],
        resume_skills=[
            {
                "id": str(rs.id),
                "skill_name": rs.skill_name,
                "normalized_skill_name": rs.normalized_skill_name,
                "locations": rs.locations,
            }
            for rs in analysis.resume_skills
        ],
        skill_evidences=[
            {
                "id": str(se.id),
                "job_requirement_id": str(se.job_requirement_id),
                "resume_skill_id": str(se.resume_skill_id) if se.resume_skill_id else None,
                "evidence_level": se.evidence_level.value,
                "score": se.score,
                "classification_explanation": se.classification_explanation,
                "supporting_text": se.supporting_text,
                "action_demonstrated": se.action_demonstrated,
                "technical_context": se.technical_context,
                "implementation_depth": se.implementation_depth,
                "ownership_clarity": se.ownership_clarity,
                "outcome_described": se.outcome_described,
                "measurability": se.measurability,
            }
            for se in analysis.skill_evidences
        ],
        recommendations=[
            {
                "id": str(rec.id),
                "skill_evidence_id": str(rec.skill_evidence_id) if rec.skill_evidence_id else None,
                "priority": rec.priority.value,
                "category": rec.category,
                "title": rec.title,
                "description": rec.description,
                "example_text": rec.example_text,
            }
            for rec in analysis.recommendations
        ],
    )


@router.delete(
    "/{analysis_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an analysis (auth required)",
)
async def delete_analysis(
    analysis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete an analysis belonging to the authenticated user."""
    analysis = await _get_analysis_or_404(analysis_id, db)
    verify_ownership(analysis.user_id, current_user, "analysis")
    await db.delete(analysis)
    await db.flush()


@router.get(
    "/{analysis_id}/skills",
    summary="Get skill evidence matrix for an analysis",
)
async def get_analysis_skills(
    analysis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
    authorization: str | None = Header(None),
) -> dict[str, Any]:
    """Return the evidence matrix for all skills in this analysis."""
    analysis = await _get_analysis_or_404(analysis_id, db)
    await _authorize_analysis_access(analysis, current_user, authorization)

    result = await db.execute(
        select(SkillEvidence)
        .where(SkillEvidence.analysis_id == analysis_id)
        .options(selectinload(SkillEvidence.job_requirement))
    )
    evidences = result.scalars().all()

    entries = []
    covered = 0
    for se in evidences:
        jr = se.job_requirement
        entry = {
            "skill_evidence_id": str(se.id),
            "skill_name": jr.skill_name,
            "normalized_skill_name": jr.normalized_skill_name,
            "importance": jr.importance.value,
            "category": jr.category.value,
            "evidence_level": se.evidence_level.value,
            "score": se.score,
            "classification_explanation": se.classification_explanation,
        }
        entries.append(entry)
        if se.evidence_level.value != "missing":
            covered += 1

    return {
        "analysis_id": str(analysis_id),
        "entries": entries,
        "total_requirements": len(entries),
        "covered_count": covered,
        "missing_count": len(entries) - covered,
    }


@router.get(
    "/{analysis_id}/skills/{skill_evidence_id}",
    summary="Get detailed evidence for a specific skill",
)
async def get_skill_evidence_detail(
    analysis_id: uuid.UUID,
    skill_evidence_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
    authorization: str | None = Header(None),
) -> dict[str, Any]:
    """Return detailed evidence classification for a single skill."""
    analysis = await _get_analysis_or_404(analysis_id, db)
    await _authorize_analysis_access(analysis, current_user, authorization)

    result = await db.execute(
        select(SkillEvidence).where(
            SkillEvidence.id == skill_evidence_id,
            SkillEvidence.analysis_id == analysis_id,
        )
    )
    se = result.scalar_one_or_none()
    if se is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill evidence not found")

    return {
        "id": str(se.id),
        "analysis_id": str(se.analysis_id),
        "job_requirement_id": str(se.job_requirement_id),
        "resume_skill_id": str(se.resume_skill_id) if se.resume_skill_id else None,
        "evidence_level": se.evidence_level.value,
        "evidence_sources": se.evidence_sources,
        "supporting_text": se.supporting_text,
        "classification_explanation": se.classification_explanation,
        "action_demonstrated": se.action_demonstrated,
        "technical_context": se.technical_context,
        "implementation_depth": se.implementation_depth,
        "ownership_clarity": se.ownership_clarity,
        "outcome_described": se.outcome_described,
        "measurability": se.measurability,
        "score": se.score,
        "created_at": se.created_at.isoformat(),
    }


@router.get(
    "/{analysis_id}/recommendations",
    summary="Get recommendations for an analysis",
)
async def get_analysis_recommendations(
    analysis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
    authorization: str | None = Header(None),
) -> dict[str, Any]:
    """Return all recommendations for an analysis, ordered by priority."""
    analysis = await _get_analysis_or_404(analysis_id, db)
    await _authorize_analysis_access(analysis, current_user, authorization)

    result = await db.execute(
        select(Recommendation)
        .where(Recommendation.analysis_id == analysis_id)
        .order_by(Recommendation.priority)
    )
    recs = result.scalars().all()

    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    sorted_recs = sorted(recs, key=lambda r: priority_order.get(r.priority.value, 99))

    return {
        "analysis_id": str(analysis_id),
        "recommendations": [
            {
                "id": str(rec.id),
                "skill_evidence_id": str(rec.skill_evidence_id) if rec.skill_evidence_id else None,
                "priority": rec.priority.value,
                "category": rec.category,
                "title": rec.title,
                "description": rec.description,
                "example_text": rec.example_text,
            }
            for rec in sorted_recs
        ],
        "total": len(sorted_recs),
    }
