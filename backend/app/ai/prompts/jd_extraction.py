from pydantic import BaseModel, Field
from app.models.job_requirement import SkillImportance, SkillCategory

class ExtractedSkill(BaseModel):
    skill_name: str = Field(description="Original exact skill/technology name mentioned in the text")
    normalized_skill_name: str = Field(description="Normalized standard name (e.g. 'Postgres' -> 'PostgreSQL')")
    importance: SkillImportance = Field(description="Whether the skill is required, preferred, or optional based on context")
    category: SkillCategory = Field(description="Category of the skill (language, framework, database, cloud, devops, ai_ml, tool, soft_skill, domain)")
    source_text: str = Field(description="Exact snippet or bullet point from the JD where this skill requirement appears")
    context_explanation: str | None = Field(default=None, description="Why this skill is needed according to the job description")

class JobDescriptionAnalysis(BaseModel):
    job_title: str = Field(description="Extracted clean job title")
    seniority_level: str = Field(description="Estimated seniority (Intern, Junior, Mid-Level, Senior, Lead, Staff, etc.)")
    required_skills: list[ExtractedSkill] = Field(description="List of skills explicitly or implicitly required")
    preferred_skills: list[ExtractedSkill] = Field(description="List of skills listed as preferred, nice-to-have, or bonus")

JD_EXTRACTION_SYSTEM_PROMPT = """You are an expert technical AI recruiter and job requirement extractor.
Analyze the provided job description text carefully and extract a structured breakdown of the job details, seniority, and technical skill requirements.

CRITICAL INSTRUCTIONS:
1. Extract AT MOST 12 most important technical skills (e.g., programming languages, frameworks, databases, cloud, devops). Do not extract soft skills.
2. Keep `source_text` extremely short (under 10 words).
3. Keep `context_explanation` extremely short (under 10 words).
4. Differentiate strictly between REQUIRED vs PREFERRED vs OPTIONAL skills.
5. Normalize skill names where applicable (e.g., 'ReactJS' -> 'React')."""

def format_jd_extraction_prompt(job_title: str, company_name: str | None, raw_text: str) -> str:
    company_info = f" at {company_name}" if company_name else ""
    return f"""Please analyze the following job description for the position of '{job_title}'{company_info}:

--- JOB DESCRIPTION START ---
{raw_text}
--- JOB DESCRIPTION END ---

Extract all required and preferred skills along with their source text snippets, importance levels, and categories."""
