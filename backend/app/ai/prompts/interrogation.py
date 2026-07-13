from pydantic import BaseModel, Field

class InterrogationQuestionResponse(BaseModel):
    next_question: str = Field(description="A single targeted follow-up question asking for specific technical implementation details, architectural choices, or outcomes")
    encouragement: str | None = Field(default=None, description="Brief encouraging acknowledgment of previous context if applicable")
    is_ready_for_bullet: bool = Field(description="True if enough concrete technical action, context, and outcome info has been gathered to draft a strong resume bullet; False otherwise")

class GeneratedBulletResult(BaseModel):
    suggested_bullet: str = Field(description="The suggested STAR-aligned resume bullet point constructed strictly from facts provided by the user")
    explanation: str = Field(description="Explanation of how the bullet satisfies the 6 evidence dimensions based on user answers")

INTERROGATION_SYSTEM_PROMPT = """You are an AI resume interrogation expert for proofStack helping a candidate strengthen their resume evidence for a specific skill.
Your goal is to ask targeted, progressive questions to uncover concrete evidence of how the candidate actually used the technology.

CRITICAL INSTRUCTIONS FOR QUESTIONING:
1. Ask ONLY ONE question at a time. Never dump a long questionnaire.
2. Focus on uncovering: What project involved this skill? What problem were you solving? Why did you choose this technology? What exact architecture or logic did you personally write? What was the outcome or improvement?
3. If the user provides vague answers, gently ask for exact technical context.

CRITICAL INSTRUCTIONS FOR BULLET GENERATION (`is_ready_for_bullet` = True):
1. Once 3-5 rounds of detailed answers are collected (or if the user explicitly asks to generate the bullet now), set `is_ready_for_bullet` to True.
2. When generating a bullet (`GeneratedBulletResult`), you MUST construct it using ONLY information explicitly confirmed by the user during the chat.
3. NEVER invent metrics, percentages, users, scale, response latency improvements, or technologies. If the user didn't provide a number, describe the qualitative technical outcome without making up numbers.
4. Always clearly remind the user that AI-generated bullets require personal review."""

def format_interrogation_question_prompt(skill_name: str, current_evidence_text: str | None, chat_history: list[dict[str, str]]) -> str:
    history_str = "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in chat_history])
    evidence_context = f"Current weak/mentioned evidence snippet: '{current_evidence_text}'" if current_evidence_text else "Current status: Missing from resume."
    return f"""We are interrogating the candidate to build strong evidence for the skill: '{skill_name}'.
{evidence_context}

--- CONVERSATION HISTORY ---
{history_str}

Based on the conversation history above, generate the single best next question to uncover technical depth and outcomes (`is_ready_for_bullet` = False), OR if sufficient concrete details have been provided across the conversation, indicate `is_ready_for_bullet` = True."""

def format_bullet_generation_prompt(skill_name: str, chat_history: list[dict[str, str]]) -> str:
    history_str = "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in chat_history])
    return f"""Construct a high-impact STAR-aligned resume bullet point demonstrating strong evidence for the skill: '{skill_name}' based STRICTLY on the candidate's verified statements below:

--- CONVERSATION HISTORY ---
{history_str}

Generate the final bullet (`suggested_bullet`) and explanation. Do not fabricate any numbers or achievements not stated in the history."""
