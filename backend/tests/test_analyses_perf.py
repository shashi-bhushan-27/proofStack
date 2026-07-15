import uuid
import pytest
import pytest_asyncio
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.base import Base
from app.models.user import User
from app.models.resume import Resume
from app.models.job_description import JobDescription
from app.models.analysis import Analysis, AnalysisStatus
from app.models.job_requirement import JobRequirement, SkillImportance, SkillCategory
from app.api.v1.analyses import _get_analysis_or_404


@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
    await engine.dispose()


@pytest.mark.asyncio
async def test_analysis_list_no_n_plus_one(db_session: AsyncSession):
    """Verify that querying a list of analyses does not eagerly/cascadingly load child relationships."""
    user = User(id=uuid.uuid4(), email="perf@proofstack.com", full_name="Perf Tester", auth_provider="local")
    resume = Resume(
        id=uuid.uuid4(),
        user_id=user.id,
        filename="resume.pdf",
        original_filename="resume.pdf",
        file_size=1024,
        content_type="application/pdf",
        storage_path="/resumes/resume.pdf",
        parsed_text="Python experience",
    )
    jd = JobDescription(id=uuid.uuid4(), user_id=user.id, job_title="Engineer", raw_text="Need Python")
    
    db_session.add_all([user, resume, jd])
    await db_session.flush()

    # Create 3 analyses each with job requirements
    for i in range(3):
        analysis = Analysis(
            id=uuid.uuid4(),
            user_id=user.id,
            resume_id=resume.id,
            job_description_id=jd.id,
            status=AnalysisStatus.completed,
            overall_score=85.0 + i,
        )
        db_session.add(analysis)
        await db_session.flush()

        req = JobRequirement(
            id=uuid.uuid4(),
            analysis_id=analysis.id,
            skill_name=f"Skill_{i}",
            normalized_skill_name=f"skill_{i}",
            importance=SkillImportance.required,
            category=SkillCategory.language,
        )
        db_session.add(req)

    await db_session.commit()

    # Clear session to ensure we are querying cleanly from database
    await db_session.close()

    # Query analyses exactly as list_analyses endpoint does (without relationship options)
    result = await db_session.execute(
        select(Analysis).where(Analysis.user_id == user.id)
    )
    analyses = result.scalars().all()
    assert len(analyses) == 3

    # Verify that because of lazy="noload", child attributes are None/unloaded or do not trigger queries
    # In SQLAlchemy noload on collection returns empty list or None without running extra queries
    for a in analyses:
        assert a.job_requirements is None or len(a.job_requirements) == 0


@pytest.mark.asyncio
async def test_get_analysis_detail_explicit_eager_loading(db_session: AsyncSession):
    """Verify that _get_analysis_or_404 with explicit selectinload loads child collections directly."""
    user = User(id=uuid.uuid4(), email="detail@proofstack.com", full_name="Detail Tester", auth_provider="local")
    resume = Resume(
        id=uuid.uuid4(),
        user_id=user.id,
        filename="resume.pdf",
        original_filename="resume.pdf",
        file_size=1024,
        content_type="application/pdf",
        storage_path="/resumes/resume.pdf",
        parsed_text="Python",
    )
    jd = JobDescription(id=uuid.uuid4(), user_id=user.id, job_title="Engineer", raw_text="Need Python")
    
    db_session.add_all([user, resume, jd])
    await db_session.flush()

    analysis = Analysis(
        id=uuid.uuid4(),
        user_id=user.id,
        resume_id=resume.id,
        job_description_id=jd.id,
        status=AnalysisStatus.completed,
        overall_score=92.0,
    )
    db_session.add(analysis)
    await db_session.flush()

    req = JobRequirement(
        id=uuid.uuid4(),
        analysis_id=analysis.id,
        skill_name="FastAPI",
        normalized_skill_name="fastapi",
        importance=SkillImportance.required,
        category=SkillCategory.framework,
    )
    db_session.add(req)
    await db_session.commit()
    await db_session.close()

    # Fetch detail using _get_analysis_or_404 with selectinload options (as updated in get_analysis)
    loaded = await _get_analysis_or_404(
        analysis.id,
        db_session,
        options=[selectinload(Analysis.job_requirements)]
    )
    assert loaded is not None
    assert loaded.id == analysis.id
    assert len(loaded.job_requirements) == 1
    assert loaded.job_requirements[0].skill_name == "FastAPI"
