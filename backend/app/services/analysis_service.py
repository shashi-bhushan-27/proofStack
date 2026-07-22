import asyncio
from datetime import datetime, timezone
import logging
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai import jd_analyzer, resume_parser, evidence_matcher, recommendation_generator
from app.db.session import async_session_factory
from app.models.analysis import Analysis, AnalysisStatus
from app.models.job_description import JobDescription
from app.models.job_requirement import JobRequirement
from app.models.recommendation import Recommendation, RecommendationPriority
from app.models.resume import Resume
from app.models.resume_skill import ResumeSkill
from app.models.skill_evidence import SkillEvidence
from app.scoring.engine import ScoringEngine
from app.observability.context import obs_analysis_id, obs_user_id

logger = logging.getLogger(__name__)

async def run_analysis(analysis_id: UUID, db: AsyncSession | None = None):
    """
    Background worker orchestrating the full 7-stage AI and scoring pipeline for a resume-JD analysis.
    If called inside a FastAPI BackgroundTask, creates its own database session.
    """
    own_session = False
    if db is None:
        db = async_session_factory()
        own_session = True

    try:
        # Fetch Analysis record with related models
        stmt = select(Analysis).where(Analysis.id == analysis_id)
        result = await db.execute(stmt)
        analysis = result.scalar_one_or_none()
        
        if not analysis:
            logger.error(f"Analysis record {analysis_id} not found.")
            return

        obs_analysis_id.set(analysis.id)
        obs_user_id.set(analysis.user_id)

        resume_stmt = select(Resume).where(Resume.id == analysis.resume_id)
        resume_result = await db.execute(resume_stmt)
        resume = resume_result.scalar_one_or_none()

        jd_stmt = select(JobDescription).where(JobDescription.id == analysis.job_description_id)
        jd_result = await db.execute(jd_stmt)
        jd = jd_result.scalar_one_or_none()

        if not resume or not jd:
            logger.error(f"Missing Resume or JD for analysis {analysis_id}")
            analysis.status = AnalysisStatus.FAILED
            await db.commit()
            return

        # STAGE 1: Extracting Resume Content
        analysis.status = AnalysisStatus.EXTRACTING_RESUME
        await db.commit()
        await asyncio.sleep(0.1)

        raw_resume_text = resume.parsed_text or ""
        if not raw_resume_text.strip():
            logger.error(f"Resume {resume.id} has no parsed text.")
            analysis.status = AnalysisStatus.FAILED
            await db.commit()
            return

        # STAGE 2: Analyzing Job Requirements
        analysis.status = AnalysisStatus.ANALYZING_REQUIREMENTS
        await db.commit()
        await asyncio.sleep(0.1)

        jd_data = await jd_analyzer.analyze_job_description(
            raw_text=jd.raw_text,
            job_title=jd.job_title,
            company_name=jd.company_name,
        )

        # Store JobRequirement rows
        requirement_models: dict[str, JobRequirement] = {}
        for s in jd_data.required_skills + jd_data.preferred_skills:
            req = JobRequirement(
                analysis_id=analysis.id,
                skill_name=s.skill_name,
                normalized_skill_name=s.normalized_skill_name,
                importance=s.importance,
                category=s.category,
                source_text=s.source_text,
                context_explanation=s.context_explanation,
            )
            db.add(req)
            requirement_models[s.normalized_skill_name.lower()] = req

        await db.flush()

        # STAGE 3: Identifying Candidate Skills
        analysis.status = AnalysisStatus.MATCHING_SKILLS
        await db.commit()
        await asyncio.sleep(0.1)

        resume_data = await resume_parser.parse_resume(raw_resume_text)

        # Store ResumeSkill rows
        resume_skill_models: dict[str, ResumeSkill] = {}
        for rs in resume_data.skills:
            skill_row = ResumeSkill(
                analysis_id=analysis.id,
                skill_name=rs.skill_name,
                normalized_skill_name=rs.normalized_skill_name,
                locations=[loc.model_dump() for loc in rs.locations],
            )
            db.add(skill_row)
            resume_skill_models[rs.normalized_skill_name.lower()] = skill_row

        await db.flush()

        # STAGE 4 & 5: Finding & Evaluating Evidence
        analysis.status = AnalysisStatus.FINDING_EVIDENCE
        await db.commit()
        await asyncio.sleep(0.1)

        analysis.status = AnalysisStatus.EVALUATING_STRENGTH
        await db.commit()
        await asyncio.sleep(0.1)

        evaluations = await evidence_matcher.match_evidence(
            jd_analysis=jd_data,
            resume_analysis=resume_data,
            raw_resume_text=raw_resume_text,
        )

        evidence_rows: dict[str, SkillEvidence] = {}
        from app.scoring.weights import EVIDENCE_SCORES

        for ev in evaluations:
            norm_key = ev.normalized_skill_name.lower()
            req_row = requirement_models.get(norm_key)
            if not req_row:
                continue
            
            res_skill_row = resume_skill_models.get(norm_key)
            
            ev_row = SkillEvidence(
                analysis_id=analysis.id,
                job_requirement_id=req_row.id,
                resume_skill_id=res_skill_row.id if res_skill_row else None,
                evidence_level=ev.overall_level,
                evidence_sources=[(loc.model_dump() if hasattr(loc, "model_dump") else loc) for loc in res_skill_row.locations] if res_skill_row else [],
                supporting_text=ev.supporting_text,
                classification_explanation=ev.classification_explanation,
                action_demonstrated=ev.action_demonstrated,
                technical_context=ev.technical_context,
                implementation_depth=ev.implementation_depth,
                ownership_clarity=ev.ownership_clarity,
                outcome_described=ev.outcome_described,
                measurability=ev.measurability,
                score=EVIDENCE_SCORES.get(ev.overall_level, 0),
            )
            db.add(ev_row)
            evidence_rows[norm_key] = ev_row

        await db.flush()

        # STAGE 6: Generating Recommendations
        analysis.status = AnalysisStatus.GENERATING_RECOMMENDATIONS
        await db.commit()
        await asyncio.sleep(0.1)

        recs_data = await recommendation_generator.generate_recommendations(
            job_title=jd.job_title,
            evidence_evaluations=evaluations,
        )

        for rec in recs_data:
            norm_key = rec.skill_name.lower()
            ev_row = evidence_rows.get(norm_key)
            rec_row = Recommendation(
                analysis_id=analysis.id,
                skill_evidence_id=ev_row.id if ev_row else None,
                priority=rec.priority,
                category=rec.category,
                title=rec.title,
                description=rec.description,
                example_text=rec.example_text,
            )
            db.add(rec_row)

        await db.flush()

        # STAGE 7: Deterministic Scoring & Completion
        scoring_engine = ScoringEngine()
        scores = scoring_engine.calculate_scores(
            evaluations=evaluations,
            jd_analysis=jd_data,
            resume_analysis=resume_data,
        )

        analysis.overall_score = scores.overall_score
        analysis.required_coverage_score = scores.required_skill_coverage
        analysis.evidence_strength_score = scores.evidence_strength
        analysis.preferred_coverage_score = scores.preferred_skill_coverage
        analysis.experience_relevance_score = scores.experience_relevance
        analysis.communication_score = scores.resume_communication
        analysis.scoring_breakdown = scores.model_dump()
        analysis.status = AnalysisStatus.COMPLETED
        analysis.completed_at = datetime.now(timezone.utc)

        await db.commit()
        logger.info(f"Successfully completed analysis {analysis_id} with score {scores.overall_score}")

    except Exception as e:
        logger.exception(f"Error during analysis {analysis_id}: {e}")
        try:
            stmt = select(Analysis).where(Analysis.id == analysis_id)
            res = await db.execute(stmt)
            an = res.scalar_one_or_none()
            if an:
                an.status = AnalysisStatus.FAILED
                await db.commit()
        except Exception as inner_e:
            logger.error(f"Could not update status to failed for {analysis_id}: {inner_e}")
    finally:
        if own_session:
            await db.close()
