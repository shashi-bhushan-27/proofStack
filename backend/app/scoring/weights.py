from pydantic import BaseModel
from app.models.skill_evidence import EvidenceLevel

class ScoringWeights(BaseModel):
    """Configurable weights for overall job fit score calculation."""
    required_skill_coverage: float = 0.35
    evidence_strength: float = 0.35
    preferred_skill_coverage: float = 0.10
    experience_relevance: float = 0.10
    resume_communication: float = 0.10

# Deterministic numeric score mapping for each evidence level (0 to 100 scale)
EVIDENCE_SCORES = {
    EvidenceLevel.MISSING: 0,
    EvidenceLevel.MENTIONED_ONLY: 25,
    EvidenceLevel.WEAK: 40,
    EvidenceLevel.MODERATE: 65,
    EvidenceLevel.STRONG: 90,
}
