"""Database models package — imports all models for Alembic discovery."""

from app.models.user import User
from app.models.resume import Resume
from app.models.job_description import JobDescription
from app.models.analysis import Analysis, AnalysisStatus
from app.models.job_requirement import JobRequirement, SkillImportance, SkillCategory
from app.models.resume_skill import ResumeSkill
from app.models.skill_evidence import SkillEvidence, EvidenceLevel
from app.models.recommendation import Recommendation, RecommendationPriority
from app.models.interrogation import InterrogationSession, InterrogationMessage, InterrogationStatus, MessageRole

__all__ = [
    "User",
    "Resume",
    "JobDescription",
    "Analysis",
    "AnalysisStatus",
    "JobRequirement",
    "SkillImportance",
    "SkillCategory",
    "ResumeSkill",
    "SkillEvidence",
    "EvidenceLevel",
    "Recommendation",
    "RecommendationPriority",
    "InterrogationSession",
    "InterrogationMessage",
    "InterrogationStatus",
    "MessageRole",
]
