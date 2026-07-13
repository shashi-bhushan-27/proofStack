"""Scoring schemas."""

from pydantic import BaseModel


class ScoreBreakdown(BaseModel):
    """Detailed scoring breakdown for an analysis."""
    overall_score: float
    required_skill_coverage: float
    evidence_strength: float
    preferred_skill_coverage: float
    experience_relevance: float
    resume_communication: float
    weights_used: dict[str, float]
    total_required_skills: int
    covered_required_skills: int
    total_preferred_skills: int
    covered_preferred_skills: int
    average_evidence_score: float


class ScoringWeightsSchema(BaseModel):
    """Configurable scoring weights."""
    required_skill_coverage_weight: float = 0.35
    evidence_strength_weight: float = 0.35
    preferred_skill_coverage_weight: float = 0.10
    experience_relevance_weight: float = 0.10
    resume_communication_weight: float = 0.10
