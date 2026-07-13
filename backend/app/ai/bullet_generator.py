import logging
from app.ai.groq_provider import get_provider
from app.ai.prompts.interrogation import (
    GeneratedBulletResult,
    INTERROGATION_SYSTEM_PROMPT,
    format_bullet_generation_prompt,
)

logger = logging.getLogger(__name__)

async def generate_bullet(
    skill_name: str,
    chat_history: list[dict[str, str]],
) -> GeneratedBulletResult:
    """
    Generate a high-impact STAR-aligned resume bullet point constructed strictly
    from user answers without inventing metrics or experience.
    """
    provider = get_provider()
    user_prompt = format_bullet_generation_prompt(
        skill_name=skill_name,
        chat_history=chat_history,
    )
    
    logger.info(f"Generating resume bullet from verified chat answers for skill: {skill_name}")
    result: GeneratedBulletResult = await provider.generate_structured(
        system_prompt=INTERROGATION_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_schema=GeneratedBulletResult,
        temperature=0.1,  # Very low temperature for strict adherence to provided facts
    )
    
    return result
