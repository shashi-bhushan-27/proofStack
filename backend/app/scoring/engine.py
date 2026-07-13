import logging
from app.ai.prompts.evidence_classification import SingleSkillEvidenceEvaluation
from app.ai.prompts.jd_extraction import JobDescriptionAnalysis
from app.ai.prompts.resume_parsing import ResumeAnalysis
from app.schemas.scoring import ScoreBreakdown
from app.scoring.calculator import (
    calculate_required_coverage_score,
    calculate_preferred_coverage_score,
    calculate_evidence_strength_score,
    calculate_communication_score,
    calculate_unsupported_claims_score,
)
from app.scoring.weights import ScoringWeights, EVIDENCE_SCORES

logger = logging.getLogger(__name__)

class ScoringEngine:
    """
    Deterministic scoring engine that calculates explainable 0-100 scores
    based on verified candidate evidence without relying on LLM-generated numerical scores.
    """

    def __init__(self, weights: ScoringWeights | None = None):
        self.weights = weights or ScoringWeights()

    def calculate_scores(
        self,
        evaluations: list[SingleSkillEvidenceEvaluation],
        jd_analysis: JobDescriptionAnalysis,
        resume_analysis: ResumeAnalysis,
    ) -> ScoreBreakdown:
        """
        Compute all sub-scores and the final weighted overall job fit score.
        """
        logger.info("Executing deterministic scoring calculations")
        
        req_coverage = calculate_required_coverage_score(evaluations, jd_analysis)
        pref_coverage = calculate_preferred_coverage_score(evaluations, jd_analysis)
        evidence_strength = calculate_evidence_strength_score(evaluations)
        communication = calculate_communication_score(evaluations)
        unsupported = calculate_unsupported_claims_score(evaluations, resume_analysis)
        
        # Experience relevance: estimate based on required coverage + preferred coverage
        exp_relevance = round((req_coverage * 0.7) + (pref_coverage * 0.3), 1)
        
        # Weighted overall score
        overall = round(
            (req_coverage * self.weights.required_skill_coverage) +
            (evidence_strength * self.weights.evidence_strength) +
            (pref_coverage * self.weights.preferred_skill_coverage) +
            (exp_relevance * self.weights.experience_relevance) +
            (communication * self.weights.resume_communication),
            1
        )
        
        overall = min(100.0, max(0.0, overall))
        
        logger.info(f"Scoring complete -> Overall: {overall}, Required Coverage: {req_coverage}, Evidence Strength: {evidence_strength}")
        
        from app.models.skill_evidence import EvidenceLevel
        required_names = {s.normalized_skill_name.lower() for s in jd_analysis.required_skills}
        preferred_names = {s.normalized_skill_name.lower() for s in jd_analysis.preferred_skills}

        covered_req = sum(1 for e in evaluations if e.normalized_skill_name.lower() in required_names and e.overall_level != EvidenceLevel.MISSING)
        covered_pref = sum(1 for e in evaluations if e.normalized_skill_name.lower() in preferred_names and e.overall_level != EvidenceLevel.MISSING)
        
        total_score = sum(EVIDENCE_SCORES.get(e.overall_level, 0) for e in evaluations)
        avg_ev_score = round(total_score / len(evaluations), 1) if evaluations else 0.0
        
        return ScoreBreakdown(
            overall_score=overall,
            required_skill_coverage=req_coverage,
            evidence_strength=evidence_strength,
            preferred_skill_coverage=pref_coverage,
            experience_relevance=exp_relevance,
            resume_communication=communication,
            weights_used={
                "required_skill_coverage": self.weights.required_skill_coverage,
                "evidence_strength": self.weights.evidence_strength,
                "preferred_skill_coverage": self.weights.preferred_skill_coverage,
                "experience_relevance": self.weights.experience_relevance,
                "resume_communication": self.weights.resume_communication,
            },
            total_required_skills=len(jd_analysis.required_skills),
            covered_required_skills=covered_req,
            total_preferred_skills=len(jd_analysis.preferred_skills),
            covered_preferred_skills=covered_pref,
            average_evidence_score=avg_ev_score,
        )
