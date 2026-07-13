import logging
from app.ai.groq_provider import get_provider
from app.ai.prompts.interrogation import (
    InterrogationQuestionResponse,
    INTERROGATION_SYSTEM_PROMPT,
    format_interrogation_question_prompt,
)

logger = logging.getLogger(__name__)

async def generate_questions(
    skill_name: str,
    current_evidence_text: str | None,
    chat_history: list[dict[str, str]],
) -> InterrogationQuestionResponse:
    """
    Generate a single progressive, targeted follow-up question asking for specific technical
    implementation details or outcomes to help the candidate build strong evidence.
    """
    provider = get_provider()
    user_prompt = format_interrogation_question_prompt(
        skill_name=skill_name,
        current_evidence_text=current_evidence_text,
        chat_history=chat_history,
    )
    
    logger.info(f"Generating interrogation question for skill: {skill_name}")
    result: InterrogationQuestionResponse = await provider.generate_structured(
        system_prompt=INTERROGATION_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_schema=InterrogationQuestionResponse,
        temperature=0.3,
    )
    
    return result
