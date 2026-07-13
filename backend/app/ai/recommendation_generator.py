import json
import logging
from app.ai.groq_provider import get_provider
from app.ai.prompts.evidence_classification import SingleSkillEvidenceEvaluation
from app.ai.prompts.recommendations import (
    RecommendationSet,
    SingleRecommendation,
    RECOMMENDATION_SYSTEM_PROMPT,
    format_recommendations_prompt,
)
from app.models.skill_evidence import EvidenceLevel

logger = logging.getLogger(__name__)

async def generate_recommendations(
    job_title: str,
    evidence_evaluations: list[SingleSkillEvidenceEvaluation],
) -> list[SingleRecommendation]:
    """
    Generate actionable, specific improvement recommendations based on
    missing or weak candidate evidence. Never generic.
    """
    provider = get_provider()
    
    # Filter for skills that need improvement (missing, mentioned_only, weak, moderate)
    gaps = [
        {
            "skill_name": ev.skill_name,
            "normalized_skill_name": ev.normalized_skill_name,
            "overall_level": ev.overall_level.value,
            "action_demonstrated": ev.action_demonstrated,
            "technical_context": ev.technical_context,
            "implementation_depth": ev.implementation_depth,
            "outcome_described": ev.outcome_described,
            "supporting_text": ev.supporting_text,
            "classification_explanation": ev.classification_explanation,
        }
        for ev in evidence_evaluations
        if ev.overall_level in [EvidenceLevel.MISSING, EvidenceLevel.MENTIONED_ONLY, EvidenceLevel.WEAK, EvidenceLevel.MODERATE]
    ]
    
    if not gaps:
        logger.info("No evidence gaps found requiring recommendations.")
        return []

    user_prompt = format_recommendations_prompt(
        job_title=job_title,
        evidence_evaluations_json=json.dumps(gaps, indent=2),
    )
    
    logger.info(f"Generating actionable recommendations for {len(gaps)} evidence gaps")
    result: RecommendationSet = await provider.generate_structured(
        system_prompt=RECOMMENDATION_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_schema=RecommendationSet,
        temperature=0.2,
    )
    
    return result.recommendations
