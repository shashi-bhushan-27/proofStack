import uuid
import pytest
import pytest_asyncio
from datetime import timedelta
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

from app.db.base import Base
from app.models.user import User
from app.core.security import create_access_token, verify_firebase_token
from app.api.deps import _get_or_sync_user
from app.core import cache
from app.scoring.engine import ScoringEngine
from app.scoring.weights import ScoringWeights
from app.ai.prompts.evidence_classification import SingleSkillEvidenceEvaluation
from app.ai.prompts.jd_extraction import JobDescriptionAnalysis, ExtractedSkill
from app.ai.prompts.resume_parsing import ResumeAnalysis, ParsedResumeSkill, SkillLocationDict
from app.models.skill_evidence import EvidenceLevel
from app.models.job_requirement import SkillImportance, SkillCategory


@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
    await engine.dispose()


def test_verify_firebase_token_local_fallback():
    """Verify that verify_firebase_token accepts local PyJWT tokens for test suite / guest mode."""
    test_uuid = str(uuid.uuid4())
    token = create_access_token({
        "sub": test_uuid,
        "email": "localtest@proofstack.com",
        "name": "Local Test",
    })
    
    claims = verify_firebase_token(token)
    assert claims["uid"] == test_uuid
    assert claims["email"] == "localtest@proofstack.com"
    assert claims["name"] == "Local Test"
    assert claims["type"] == "access"


@pytest.mark.asyncio
async def test_get_or_sync_user_creation(db_session: AsyncSession):
    """Verify that _get_or_sync_user creates a new User when neither uid nor email exist."""
    cache.delete_l1_auth_cache("fb_uid_12345")
    await cache.delete_cache("auth:user:fb_uid_12345")
    claims = {
        "uid": "fb_uid_12345",
        "email": "newuser@proofstack.com",
        "name": "New Firebase User",
        "type": "firebase"
    }
    
    user = await _get_or_sync_user(claims, db_session)
    assert user is not None
    assert user.firebase_uid == "fb_uid_12345"
    assert user.email == "newuser@proofstack.com"
    assert user.full_name == "New Firebase User"
    assert user.auth_provider == "firebase"
    assert isinstance(user.id, uuid.UUID)


@pytest.mark.asyncio
async def test_get_or_sync_user_email_linking(db_session: AsyncSession):
    """Verify that an existing user by email gets their firebase_uid linked automatically."""
    cache.delete_l1_auth_cache("fb_uid_legacy_999")
    await cache.delete_cache("auth:user:fb_uid_legacy_999")
    legacy_user = User(
        id=uuid.uuid4(),
        email="legacy@proofstack.com",
        full_name="Legacy User",
        auth_provider="local",
        is_active=True
    )
    db_session.add(legacy_user)
    await db_session.commit()
    
    claims = {
        "uid": "fb_uid_legacy_999",
        "email": "legacy@proofstack.com",
        "name": "Legacy User Linked",
        "type": "firebase"
    }
    
    synced_user = await _get_or_sync_user(claims, db_session)
    assert synced_user is not None
    assert synced_user.id == legacy_user.id
    assert synced_user.firebase_uid == "fb_uid_legacy_999"


def test_scoring_engine_regression():
    """Verify that deterministic scoring calculation works across all metrics without regression."""
    engine = ScoringEngine(ScoringWeights())
    
    eval1 = SingleSkillEvidenceEvaluation(
        skill_name="Python",
        normalized_skill_name="Python",
        action_demonstrated=True,
        technical_context=True,
        implementation_depth=True,
        ownership_clarity=True,
        outcome_described=True,
        measurability=True,
        evidence_sources=["Experience"],
        supporting_text="Built Python backend with FastAPI and Postgres serving 10M requests daily.",
        classification_explanation="Strong evidence across all dimensions.",
        overall_level=EvidenceLevel.STRONG,
    )
    
    jd = JobDescriptionAnalysis(
        job_title="Backend Engineer",
        seniority_level="Senior",
        required_skills=[ExtractedSkill(
            skill_name="Python",
            normalized_skill_name="Python",
            importance=SkillImportance.REQUIRED,
            category=SkillCategory.LANGUAGE,
            source_text="Must know Python"
        )],
        preferred_skills=[ExtractedSkill(
            skill_name="React",
            normalized_skill_name="React",
            importance=SkillImportance.PREFERRED,
            category=SkillCategory.FRAMEWORK,
            source_text="Nice to have React"
        )]
    )
    
    resume = ResumeAnalysis(
        candidate_name="John Doe",
        skills=[ParsedResumeSkill(
            skill_name="Python",
            normalized_skill_name="Python",
            locations=[SkillLocationDict(section="Experience", text="Built backend in Python")]
        )]
    )
    
    breakdown = engine.calculate_scores(
        evaluations=[eval1],
        jd_analysis=jd,
        resume_analysis=resume
    )
    
    assert 0 <= breakdown.overall_score <= 100
    assert breakdown.required_skill_coverage == 100.0
    assert breakdown.evidence_strength > 0

