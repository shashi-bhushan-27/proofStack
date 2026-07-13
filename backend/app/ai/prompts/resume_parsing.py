from pydantic import BaseModel, Field

class SkillLocationDict(BaseModel):
    section: str = Field(description="Section where skill was found (e.g., 'skills', 'experience', 'projects', 'summary')")
    text: str = Field(description="Exact sentence or bullet point containing the skill")
    project: str | None = Field(default=None, description="Name of the project if found in a projects section")
    company: str | None = Field(default=None, description="Name of the company if found in an experience section")

class ParsedResumeSkill(BaseModel):
    skill_name: str = Field(description="Skill name exactly as written in the resume")
    normalized_skill_name: str = Field(description="Normalized standard name (e.g., 'Fast API' -> 'FastAPI')")
    locations: list[SkillLocationDict] = Field(description="Every location across all sections where this skill is mentioned")

class ResumeAnalysis(BaseModel):
    candidate_name: str = Field(description="Full name of the candidate extracted from the resume")
    summary: str | None = Field(default=None, description="Professional summary or objective section text")
    skills: list[ParsedResumeSkill] = Field(description="All technical skills found across all sections of the resume along with their locations")

RESUME_PARSING_SYSTEM_PROMPT = """You are an expert AI resume parser and structured data extractor.
Analyze the provided raw text extracted from a candidate's resume and extract candidate name, summary, and skills.

CRITICAL INSTRUCTIONS:
1. Extract AT MOST 15 most important technical skills (e.g. languages, frameworks, tools). Do not extract soft skills.
2. For each skill, include AT MOST 2 locations where it appears.
3. Keep the location `text` snippet extremely short (under 10 words).
4. Do not invent or fabricate anything."""

def format_resume_parsing_prompt(raw_text: str) -> str:
    return f"""Please parse and extract all structured data from the following resume text:

--- RESUME TEXT START ---
{raw_text}
--- RESUME TEXT END ---

Return the structured resume data adhering to the required JSON schema."""
