import logging
from app.ai.groq_provider import get_provider
from app.ai.prompts.jd_extraction import (
    JobDescriptionAnalysis,
    JD_EXTRACTION_SYSTEM_PROMPT,
    format_jd_extraction_prompt,
)
from app.utils.skill_normalizer import normalize_skill

logger = logging.getLogger(__name__)

async def analyze_job_description(
    raw_text: str,
    job_title: str = "Specified Role",
    company_name: str | None = None,
) -> JobDescriptionAnalysis:
    """
    Extract structured job requirements, required/preferred skills, responsibilities,
    and seniority from raw job description text.
    """
    provider = get_provider()
    user_prompt = format_jd_extraction_prompt(job_title, company_name, raw_text)
    
    logger.info(f"Analyzing job description for title: {job_title}")
    result: JobDescriptionAnalysis = await provider.generate_structured(
        system_prompt=JD_EXTRACTION_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_schema=JobDescriptionAnalysis,
        temperature=0.1,
    )
    
    # Ensure all extracted skills pass through our deterministic normalization layer
    for skill in result.required_skills + result.preferred_skills:
        skill.normalized_skill_name = normalize_skill(skill.skill_name)
        
    return result
