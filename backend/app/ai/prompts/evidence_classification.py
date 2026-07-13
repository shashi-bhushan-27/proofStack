from pydantic import BaseModel, Field
from app.models.skill_evidence import EvidenceLevel

class SingleSkillEvidenceEvaluation(BaseModel):
    skill_name: str = Field(description="Name of the skill being evaluated")
    normalized_skill_name: str = Field(description="Normalized skill name")
    action_demonstrated: bool = Field(description="Did the candidate explain what they personally built, implemented, designed, optimized, or deployed?")
    technical_context: bool = Field(description="Did the candidate explain where, how, or why the technology was used within an architecture or workflow?")
    implementation_depth: bool = Field(description="Does the description demonstrate meaningful technical understanding beyond superficial naming?")
    ownership_clarity: bool = Field(description="Is it clear what the candidate was directly responsible for owning or delivering?")
    outcome_described: bool = Field(description="Does the bullet describe a tangible impact, outcome, or improvement resulting from the implementation?")
    measurability: bool = Field(description="Is the impact or outcome quantified with specific numbers, percentages, latency improvements, or scale metrics?")
    overall_level: EvidenceLevel = Field(description="Classification level: missing, mentioned_only, weak, moderate, or strong based on the 6 dimensions")
    supporting_text: str | None = Field(default=None, description="The most relevant supporting bullet point or sentence found in projects/experience (None if missing or mentioned_only)")
    classification_explanation: str = Field(description="Detailed explainable justification for why this evidence level was assigned, referencing the 6 dimensions")

class EvidenceClassificationSet(BaseModel):
    evaluations: list[SingleSkillEvidenceEvaluation] = Field(description="List of evidence evaluations for all job requirements")

EVIDENCE_CLASSIFICATION_SYSTEM_PROMPT = """You are an expert technical hiring manager and resume evidence evaluator for proofStack.
Your task is to evaluate the strength of evidence for candidate skills against required job competencies.

Instead of matching keywords, you MUST evaluate credible evidence of actual usage using these 6 exact dimensions:
1. Action: Did the candidate use action verbs explaining what they personally did (built, implemented, designed, optimized, deployed)?
2. Technical Context: Did they explain where or why the technology was used?
3. Implementation Depth: Does the description demonstrate real technical understanding?
4. Ownership: Is it clear what the candidate owned?
5. Outcome: Does the bullet describe an impact or result?
6. Measurability: Is the impact quantified? (Note: Do NOT automatically penalize legitimate projects simply because exact numbers are absent if context is deep).

EVIDENCE LEVEL CLASSIFICATION RULES:
- `missing`: The skill does not appear anywhere in the resume text or locations.
- `mentioned_only`: The skill appears only in a skills grid or summary list without supporting project or work experience context. (Satisfies 0 of 6 dimensions).
- `weak`: The skill appears in a project or experience bullet but lacks meaningful context (e.g., "Used Redis in the application"). (Satisfies <= 1 dimension).
- `moderate`: The candidate explains what they built or implemented using the technology (e.g., "Implemented Redis caching for repeated ML inference requests"). (Satisfies 2-3 dimensions).
- `strong`: The candidate provides technical context, implementation details, ownership, complexity, or measurable outcomes (e.g., "Designed a Redis caching layer for repeated ML inference requests, reducing redundant execution and improving API latency by 35%"). (Satisfies 4+ dimensions)."""

def format_evidence_classification_prompt(jd_requirements_json: str, resume_skills_json: str) -> str:
    return f"""Evaluate the candidate's resume evidence for each of the following required/preferred skills:

--- JOB REQUIREMENTS ---
{jd_requirements_json}

--- CANDIDATE RESUME SKILLS & LOCATIONS ---
{resume_skills_json}

For each job requirement, check all resume skill locations and text, evaluate the 6 dimensions, assign an exact `overall_level` (missing, mentioned_only, weak, moderate, strong), extract the best `supporting_text`, and provide a thorough `classification_explanation`."""
