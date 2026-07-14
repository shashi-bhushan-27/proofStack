// TypeScript type definitions for proofStack frontend

// ==========================================
// Auth Types
// ==========================================
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  subscription_tier?: string;
  subscription_status?: string;
  daily_analyses_count?: number;
  created_at: string;
}


export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

// ==========================================
// Resume Types
// ==========================================
export interface Resume {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  page_count: number | null;
  created_at: string;
}

// ==========================================
// Job Description Types
// ==========================================
export interface JobDescription {
  id: string;
  job_title: string;
  company_name: string | null;
  raw_text: string;
  created_at: string;
}

// ==========================================
// Analysis Types
// ==========================================
export type AnalysisStatus =
  | "pending"
  | "extracting_resume"
  | "analyzing_requirements"
  | "matching_skills"
  | "finding_evidence"
  | "evaluating_strength"
  | "generating_recommendations"
  | "completed"
  | "failed";

export type SkillImportance = "required" | "preferred" | "optional";

export type SkillCategory =
  | "language"
  | "framework"
  | "database"
  | "cloud"
  | "devops"
  | "ai_ml"
  | "tool"
  | "soft_skill"
  | "domain";

export type EvidenceLevel =
  | "missing"
  | "mentioned_only"
  | "weak"
  | "moderate"
  | "strong";

export type RecommendationPriority = "critical" | "high" | "medium" | "low";

export interface ScoreBreakdown {
  overall_score: number;
  required_coverage_score: number;
  evidence_strength_score: number;
  communication_score: number;
  unsupported_claims_score: number;
  preferred_coverage_score: number;
}

export interface Analysis {
  id: string;
  resume_id: string;
  job_description_id: string;
  status: AnalysisStatus;
  overall_score: number | null;
  required_coverage_score: number | null;
  evidence_strength_score: number | null;
  communication_score: number | null;
  unsupported_claims_score: number | null;
  scoring_breakdown: ScoreBreakdown | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  // Joined data
  job_title?: string;
  company_name?: string | null;
  resume_filename?: string;
}

export interface AnalysisDetail extends Analysis {
  resume: Resume;
  job_description: JobDescription;
  skills: SkillEvidence[];
  recommendations: Recommendation[];
}

// ==========================================
// Skill Evidence Types
// ==========================================
export interface SkillLocation {
  section: string;
  text: string;
  project?: string;
  company?: string;
}

export interface SkillEvidence {
  id: string;
  analysis_id: string;
  job_requirement_id: string;
  resume_skill_id: string | null;
  skill_name: string;
  normalized_skill_name: string;
  importance: SkillImportance;
  category: SkillCategory;
  evidence_level: EvidenceLevel;
  evidence_sources: SkillLocation[];
  supporting_text: string | null;
  classification_explanation: string;
  action_demonstrated: boolean;
  technical_context: boolean;
  implementation_depth: boolean;
  ownership_clarity: boolean;
  outcome_described: boolean;
  measurability: boolean;
  score: number;
  source_text: string;
  context_explanation: string | null;
}

// ==========================================
// Recommendation Types
// ==========================================
export interface Recommendation {
  id: string;
  analysis_id: string;
  skill_evidence_id: string | null;
  priority: RecommendationPriority;
  category: string;
  title: string;
  description: string;
  example_text: string | null;
  skill_name?: string;
}

// ==========================================
// Interrogation Types
// ==========================================
export interface InterrogationMessage {
  id: string;
  session_id: string;
  role: "ai" | "user";
  content: string;
  created_at: string;
}

export interface InterrogationSession {
  id: string;
  analysis_id: string;
  skill_evidence_id: string;
  skill_name: string;
  status: "active" | "completed" | "cancelled";
  generated_bullet: string | null;
  messages: InterrogationMessage[];
  created_at: string;
}

// ==========================================
// Dashboard Types
// ==========================================
export interface DashboardStats {
  total_analyses: number;
  average_score: number | null;
  strongest_skill: string | null;
  most_common_gap: string | null;
  recent_analyses: Analysis[];
}

// ==========================================
// API Response Types
// ==========================================
export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

// ==========================================
// Form Types
// ==========================================
export interface AnalysisFormData {
  resumeId: string;
  resumeFilename: string;
  jobTitle: string;
  companyName?: string;
  jobDescription: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}
