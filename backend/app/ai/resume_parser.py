import logging
from app.ai.groq_provider import get_provider
from app.ai.prompts.resume_parsing import (
    ResumeAnalysis,
    RESUME_PARSING_SYSTEM_PROMPT,
    format_resume_parsing_prompt,
)
from app.utils.skill_normalizer import normalize_skill

logger = logging.getLogger(__name__)

async def parse_resume(raw_text: str) -> ResumeAnalysis:
    """
    Extract structured resume data including sections, experience, projects,
    and exact skill locations from extracted PDF text.
    """
    provider = get_provider()
    user_prompt = format_resume_parsing_prompt(raw_text)
    
    logger.info("Parsing resume text into structured schema via AI provider")
    result: ResumeAnalysis = await provider.generate_structured(
        system_prompt=RESUME_PARSING_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_schema=ResumeAnalysis,
        temperature=0.1,
    )
    
    # Run all parsed skills through deterministic normalizer
    for skill in result.skills:
        skill.normalized_skill_name = normalize_skill(skill.skill_name)
        
    return result
