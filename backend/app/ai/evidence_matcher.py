import json
import logging
from app.ai.groq_provider import get_provider
from app.ai.prompts.evidence_classification import (
    EvidenceClassificationSet,
    SingleSkillEvidenceEvaluation,
    EVIDENCE_CLASSIFICATION_SYSTEM_PROMPT,
    format_evidence_classification_prompt,
)
from app.ai.prompts.jd_extraction import JobDescriptionAnalysis
from app.ai.prompts.resume_parsing import ResumeAnalysis
from app.models.skill_evidence import EvidenceLevel
from app.utils.skill_normalizer import normalize_skill

logger = logging.getLogger(__name__)

async def match_evidence(
    jd_analysis: JobDescriptionAnalysis,
    resume_analysis: ResumeAnalysis,
    raw_resume_text: str,
) -> list[SingleSkillEvidenceEvaluation]:
    """
    Evaluate candidate resume evidence for every required and preferred skill
    using the 6 quality dimensions (action, context, depth, ownership, outcome, measurability).
    """
    provider = get_provider()
    
    # Prepare lean JSON summaries for prompt
    jd_skills_summary = [
        {
            "skill_name": s.skill_name,
            "normalized_skill_name": s.normalized_skill_name,
            "importance": s.importance.value,
            "category": s.category.value,
        }
        for s in jd_analysis.required_skills + jd_analysis.preferred_skills
    ]
    
    resume_skills_summary = [
        {
            "skill_name": s.skill_name,
            "normalized_skill_name": s.normalized_skill_name,
            "locations": [loc.model_dump() for loc in s.locations],
        }
        for s in resume_analysis.skills
    ]
    
    if not jd_skills_summary:
        logger.warning("No job skills extracted to match evidence against.")
        return []

    user_prompt = format_evidence_classification_prompt(
        jd_requirements_json=json.dumps(jd_skills_summary, indent=2),
        resume_skills_json=json.dumps(resume_skills_summary, indent=2),
    )
    
    logger.info(f"Classifying evidence for {len(jd_skills_summary)} job requirements via AI provider")
    result: EvidenceClassificationSet = await provider.generate_structured(
        system_prompt=EVIDENCE_CLASSIFICATION_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_schema=EvidenceClassificationSet,
        temperature=0.1,
    )
    
    # Map back and ensure deterministic normalization and fail-safes
    evaluations_by_norm = {
        normalize_skill(ev.normalized_skill_name): ev for ev in result.evaluations
    }
    
    final_evaluations: list[SingleSkillEvidenceEvaluation] = []
    
    for jd_skill in jd_analysis.required_skills + jd_analysis.preferred_skills:
        norm_name = normalize_skill(jd_skill.normalized_skill_name)
        if norm_name in evaluations_by_norm:
            ev = evaluations_by_norm[norm_name]
            ev.skill_name = jd_skill.skill_name
            ev.normalized_skill_name = norm_name
            final_evaluations.append(ev)
        else:
            # Fallback if LLM missed evaluating one of the required skills
            final_evaluations.append(
                SingleSkillEvidenceEvaluation(
                    skill_name=jd_skill.skill_name,
                    normalized_skill_name=norm_name,
                    action_demonstrated=False,
                    technical_context=False,
                    implementation_depth=False,
                    ownership_clarity=False,
                    outcome_described=False,
                    measurability=False,
                    overall_level=EvidenceLevel.MISSING,
                    supporting_text=None,
                    classification_explanation=f"No supporting evidence or mention found in the resume for {jd_skill.skill_name}.",
                )
            )
            
    return final_evaluations
