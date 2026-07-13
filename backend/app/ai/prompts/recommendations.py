from pydantic import BaseModel, Field
from app.models.recommendation import RecommendationPriority

class SingleRecommendation(BaseModel):
    skill_name: str = Field(description="Skill associated with this recommendation")
    priority: RecommendationPriority = Field(description="Priority: critical (missing/weak required skills), high, medium, or low")
    category: str = Field(description="Category of suggestion (e.g. 'Evidence Context', 'Project Detail', 'Missing Required Skill', 'Metric & Outcome')")
    title: str = Field(description="Concise action-oriented headline for the recommendation")
    description: str = Field(description="Detailed explanation of what context is currently missing and what specific details should be added if the candidate actually used this skill")
    example_text: str | None = Field(default=None, description="A concrete example of how a strong evidence bullet point looks for this specific skill and domain (strictly labeled as illustrative example)")

class RecommendationSet(BaseModel):
    recommendations: list[SingleRecommendation] = Field(description="List of prioritized improvement recommendations")

RECOMMENDATION_SYSTEM_PROMPT = """You are a senior technical career architect and recruiter advisor for proofStack.
Analyze the candidate's skill evidence matrix and identified evidence gaps to provide actionable, specific improvement recommendations.

CRITICAL INSTRUCTIONS:
1. NEVER give generic, vague advice like "Improve your resume by adding more details" or "Add keywords".
2. Good recommendation example: "Your AutoML project mentions FastAPI but does not explain what the API handled. Add details about the endpoints, inference workflow, request processing, or deployment architecture if you actually implemented them."
3. NEVER recommend adding experience or skills that the candidate has not actually confirmed or used. Always frame suggestions with "If you actually implemented..." or "If you utilized [Skill] for...".
4. Prioritize missing or weakly demonstrated REQUIRED job skills (`critical` / `high` priority) above preferred skills."""

def format_recommendations_prompt(job_title: str, evidence_evaluations_json: str) -> str:
    return f"""Generate specific, high-impact resume improvement recommendations for the candidate applying for '{job_title}' based on their skill evidence evaluation:

--- SKILL EVIDENCE MATRIX & GAPS ---
{evidence_evaluations_json}

Provide clear, constructive recommendations categorized by priority. Focus on skills that are Required by the job but classified as `missing`, `mentioned_only`, or `weak` in the candidate's resume."""
