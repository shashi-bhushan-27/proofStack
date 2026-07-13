from app.ai.prompts.evidence_classification import SingleSkillEvidenceEvaluation
from app.ai.prompts.jd_extraction import JobDescriptionAnalysis
from app.ai.prompts.resume_parsing import ResumeAnalysis
from app.models.job_requirement import SkillImportance
from app.models.skill_evidence import EvidenceLevel
from app.scoring.weights import EVIDENCE_SCORES

def calculate_required_coverage_score(evaluations: list[SingleSkillEvidenceEvaluation], jd_analysis: JobDescriptionAnalysis) -> float:
    """
    Calculate coverage score for required skills weighted by evidence quality.
    Found with strong evidence gives 100% credit per skill.
    Found with lower evidence gives proportional credit.
    """
    required_names = {s.normalized_skill_name.lower() for s in jd_analysis.required_skills}
    if not required_names:
        return 100.0
        
    req_evals = [e for e in evaluations if e.normalized_skill_name.lower() in required_names]
    if not req_evals:
        return 0.0
        
    total_score = sum(EVIDENCE_SCORES.get(e.overall_level, 0) for e in req_evals)
    # Normalize against maximum possible score if all required skills were STRONG (90 score = 100% coverage credit)
    max_possible = len(required_names) * 90.0
    coverage = (total_score / max_possible) * 100.0 if max_possible > 0 else 100.0
    return round(min(100.0, max(0.0, coverage)), 1)

def calculate_preferred_coverage_score(evaluations: list[SingleSkillEvidenceEvaluation], jd_analysis: JobDescriptionAnalysis) -> float:
    """Calculate coverage score for preferred skills."""
    preferred_names = {s.normalized_skill_name.lower() for s in jd_analysis.preferred_skills}
    if not preferred_names:
        return 100.0
        
    pref_evals = [e for e in evaluations if e.normalized_skill_name.lower() in preferred_names]
    if not pref_evals:
        return 0.0
        
    total_score = sum(EVIDENCE_SCORES.get(e.overall_level, 0) for e in pref_evals)
    max_possible = len(preferred_names) * 90.0
    coverage = (total_score / max_possible) * 100.0 if max_possible > 0 else 100.0
    return round(min(100.0, max(0.0, coverage)), 1)

def calculate_evidence_strength_score(evaluations: list[SingleSkillEvidenceEvaluation]) -> float:
    """
    Calculate average evidence strength across all evaluated skills.
    Only skills that appear in the resume or JD are averaged.
    """
    if not evaluations:
        return 0.0
    total_score = sum(EVIDENCE_SCORES.get(e.overall_level, 0) for e in evaluations)
    # Scale from 0-90 to 0-100 scale
    avg_score = (total_score / len(evaluations)) * (100.0 / 90.0)
    return round(min(100.0, max(0.0, avg_score)), 1)

def calculate_communication_score(evaluations: list[SingleSkillEvidenceEvaluation]) -> float:
    """
    Evaluate how effectively the candidate communicates actual experience
    by measuring the proportion of evidence dimensions satisfied across non-missing skills.
    """
    present_evals = [e for e in evaluations if e.overall_level != EvidenceLevel.MISSING]
    if not present_evals:
        return 0.0
        
    total_dimensions_checked = 0
    total_possible_dimensions = len(present_evals) * 6
    
    for e in present_evals:
        if e.action_demonstrated: total_dimensions_checked += 1
        if e.technical_context: total_dimensions_checked += 1
        if e.implementation_depth: total_dimensions_checked += 1
        if e.ownership_clarity: total_dimensions_checked += 1
        if e.outcome_described: total_dimensions_checked += 1
        if e.measurability: total_dimensions_checked += 1
        
    score = (total_dimensions_checked / total_possible_dimensions) * 100.0 if total_possible_dimensions > 0 else 0.0
    return round(min(100.0, max(0.0, score)), 1)

def calculate_unsupported_claims_score(evaluations: list[SingleSkillEvidenceEvaluation], resume_analysis: ResumeAnalysis) -> float:
    """
    Measure proportion of listed candidate skills that lack supporting evidence.
    Lower unsupported claims proportion gives a BETTER (higher) score on a 0-100 scale where 100 = 0% unsupported.
    Unsupported claim = listed in Skills section or identified by AI but classified as Mentioned Only or Weak without outcomes/depth.
    """
    if not evaluations:
        return 100.0
        
    unsupported_count = sum(1 for e in evaluations if e.overall_level in [EvidenceLevel.MENTIONED_ONLY, EvidenceLevel.WEAK])
    total_count = len(evaluations)
    
    unsupported_ratio = unsupported_count / total_count if total_count > 0 else 0.0
    # Score is 100 minus the unsupported percentage
    score = 100.0 - (unsupported_ratio * 100.0)
    return round(min(100.0, max(0.0, score)), 1)
