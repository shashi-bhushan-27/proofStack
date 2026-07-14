"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { analysisApi, interrogationApi } from "@/lib/api";
import { useAuth } from "@/providers/providers";
import {
  getScoreColor,
  getScoreVerdict,
  getEvidenceLevelColor,
  getEvidenceLevelLabel,
  getPriorityColor,
  formatDate,
} from "@/lib/utils";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Loader2,
  Send,
  Lock,
  ChevronRight,
  Filter,
  FileText,
  Briefcase,
} from "lucide-react";

export default function AnalysisReportPage() {
  const params = useParams();
  const analysisId = params.id as string;
  const { isAuthenticated } = useAuth();

  const [analysis, setAnalysis] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected skill evidence item for inspection & interrogation
  const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>("all");

  // Interrogation Chat State
  const [interrogationSession, setInterrogationSession] = useState<any | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Fetch full analysis detail
  useEffect(() => {
    async function fetchDetail() {
      try {
        const token = localStorage.getItem(`guest_token_${analysisId}`);
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await analysisApi.get(analysisId);
        setAnalysis(res.data);
        if (res.data.skill_evidences && res.data.skill_evidences.length > 0) {
          setSelectedSkill(res.data.skill_evidences[0]);
        }
      } catch (err: any) {
        setError(err?.detail || "Could not load analysis report.");
      } finally {
        setIsLoading(false);
      }
    }
    if (analysisId) fetchDetail();
  }, [analysisId]);

  // Start Interrogation for selected skill
  const handleStartInterrogation = async (evidenceId: string) => {
    if (!isAuthenticated) {
      setChatError("Please sign in or create a free account to unlock AI Interrogation interviews.");
      return;
    }
    setIsStartingChat(true);
    setChatError(null);
    try {
      const res = await interrogationApi.start(analysisId, { skill_evidence_id: evidenceId });
      setInterrogationSession(res.data);
    } catch (err: any) {
      setChatError(err?.detail || "Could not start AI interrogation session.");
    } finally {
      setIsStartingChat(false);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !interrogationSession) return;
    setIsSendingMsg(true);
    setChatError(null);

    const textToSend = chatMessage;
    setChatMessage("");

    try {
      await interrogationApi.sendMessage(interrogationSession.id, { content: textToSend });
      // Reload session
      const res = await interrogationApi.getSession(interrogationSession.id);
      setInterrogationSession(res.data);
    } catch (err: any) {
      setChatError(err?.detail || "Failed to send message.");
    } finally {
      setIsSendingMsg(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#020617] text-white">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex min-h-screen flex-col bg-[#020617] text-white">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <XCircle className="h-12 w-12 text-rose-500 mb-4" />
          <h1 className="text-xl font-bold">Failed to load report</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-md">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Filter skills
  const filteredSkills = (analysis.skill_evidences || []).filter((se: any) =>
    filterLevel === "all" ? true : se.evidence_level === filterLevel
  );

  // Helper to get requirement name
  const getReqInfo = (reqId: string) => {
    return (
      (analysis.job_requirements || []).find((r: any) => r.id === reqId) || {
        skill_name: "Unknown Skill",
        importance: "optional",
        category: "tool",
      }
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-white">
      <Header />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        {/* Header summary banner */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                <ShieldCheck className="h-4 w-4" /> Evidence Intelligence Report • {formatDate(analysis.created_at)}
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
                Resume Fit Evaluation
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Evaluating candidate evidence against <strong className="text-slate-200">{analysis.job_requirements?.length || 0} extracted job competencies</strong>.
              </p>
            </div>

            {/* Score box */}
            <div className="flex items-center gap-6 rounded-xl border border-indigo-500/30 bg-slate-950/80 px-6 py-4">
              <div className="text-center">
                <span className={`text-4xl font-black ${getScoreColor(analysis.overall_score || 0)}`}>
                  {analysis.overall_score || 0}
                  <span className="text-lg text-slate-500">/100</span>
                </span>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                  Overall Fit Score
                </span>
              </div>
              <div className="border-l border-slate-800 pl-6 max-w-[200px]">
                <p className="text-xs font-semibold text-slate-200">
                  {getScoreVerdict(analysis.overall_score || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Sub-scores grid */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
            {[
              { label: "Required Skill Coverage", score: analysis.required_coverage_score || 0 },
              { label: "Evidence Strength Avg", score: analysis.evidence_strength_score || 0 },
              { label: "Communication Score", score: analysis.communication_score || 0 },
              { label: "Supported Claims Ratio", score: analysis.unsupported_claims_score || 0 },
            ].map((sub, idx) => (
              <div key={idx} className="rounded-xl bg-slate-950/50 p-3.5 border border-slate-800/60">
                <span className="text-xs text-slate-400 block mb-1">{sub.label}</span>
                <span className={`text-xl font-bold ${getScoreColor(sub.score)}`}>{sub.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main 2-column layout: Evidence Matrix (Left) & Skill Detail / Interrogation (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Skill Evidence Table */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Filter className="h-5 w-5 text-indigo-400" /> Skill Evidence Matrix
              </h2>

              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All Evidence Levels ({analysis.skill_evidences?.length || 0})</option>
                <option value="strong">Strong Evidence</option>
                <option value="moderate">Moderate Evidence</option>
                <option value="weak">Weak Evidence</option>
                <option value="mentioned_only">Mentioned Only</option>
                <option value="missing">Missing from Resume</option>
              </select>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden divide-y divide-slate-800/60">
              {filteredSkills.map((se: any) => {
                const req = getReqInfo(se.job_requirement_id);
                const isSelected = selectedSkill?.id === se.id;

                return (
                  <div
                    key={se.id}
                    onClick={() => {
                      setSelectedSkill(se);
                      setInterrogationSession(null);
                    }}
                    className={`p-4 cursor-pointer transition-all flex items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-slate-800/80 border-l-4 border-l-indigo-500"
                        : "hover:bg-slate-900/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">{req.skill_name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          req.importance === "required"
                            ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                        }`}>
                          {req.importance.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {se.classification_explanation}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getEvidenceLevelColor(se.evidence_level)}`}>
                        {getEvidenceLevelLabel(se.evidence_level)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Skill Details & Interrogation Panel */}
          <div className="lg:col-span-5 space-y-6">
            {selectedSkill ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-6 sticky top-24">
                {/* Selected skill header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold block">Inspecting Skill</span>
                    <h3 className="text-xl font-bold text-white mt-0.5">
                      {getReqInfo(selectedSkill.job_requirement_id).skill_name}
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getEvidenceLevelColor(selectedSkill.evidence_level)}`}>
                    {getEvidenceLevelLabel(selectedSkill.evidence_level)} ({selectedSkill.score} pts)
                  </span>
                </div>

                {/* 6 Dimensions checklist */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    6-Dimension Verification
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: "Action Demonstrated", pass: selectedSkill.action_demonstrated },
                      { label: "Technical Context", pass: selectedSkill.technical_context },
                      { label: "Implementation Depth", pass: selectedSkill.implementation_depth },
                      { label: "Ownership Clarity", pass: selectedSkill.ownership_clarity },
                      { label: "Outcome Described", pass: selectedSkill.outcome_described },
                      { label: "Measurability", pass: selectedSkill.measurability },
                    ].map((d, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded-lg border ${
                          d.pass
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            : "bg-slate-950/60 border-slate-800 text-slate-500"
                        }`}
                      >
                        {d.pass ? <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" /> : <XCircle className="h-3.5 w-3.5 flex-shrink-0" />}
                        <span className="font-medium line-clamp-1">{d.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supporting Text Snippet */}
                {selectedSkill.supporting_text && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Best Supporting Resume Snippet
                    </h4>
                    <div className="rounded-xl bg-slate-950/80 p-3.5 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed">
                      &quot;{selectedSkill.supporting_text}&quot;
                    </div>
                  </div>
                )}

                {/* Classification Explanation */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Why This Rating?
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedSkill.classification_explanation}
                  </p>
                </div>

                {/* AI Interrogation Chat Trigger / Area */}
                <div className="pt-4 border-t border-slate-800">
                  {!interrogationSession ? (
                    <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-slate-900 p-4 text-center">
                      <Sparkles className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-white">Strengthen This Evidence</h4>
                      <p className="text-xs text-slate-300 mt-1 mb-3 leading-relaxed">
                        Launch an AI interview to uncover your technical depth and generate a verified STAR bullet point.
                      </p>
                      <button
                        onClick={() => handleStartInterrogation(selectedSkill.id)}
                        disabled={isStartingChat}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                      >
                        {isStartingChat ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Starting AI Interview...
                          </>
                        ) : !isAuthenticated ? (
                          <>
                            <Lock className="h-3.5 w-3.5" /> Sign In to Interrogate
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" /> Launch Interrogation Chat
                          </>
                        )}
                      </button>
                      {chatError && <p className="mt-2 text-xs text-rose-400">{chatError}</p>}
                    </div>
                  ) : (
                    /* Active Interrogation Chat Window */
                    <div className="rounded-xl border border-indigo-500/30 bg-slate-950/90 flex flex-col h-[350px]">
                      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-900/60">
                        <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" /> Interrogating: {interrogationSession.skill_name}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          {interrogationSession.status}
                        </span>
                      </div>

                      {/* Messages scroll */}
                      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                        {(interrogationSession.messages || []).map((msg: any, idx: number) => (
                          <div
                            key={idx}
                            className={`flex flex-col ${
                              msg.role === "user" ? "items-end" : "items-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] rounded-xl p-3 ${
                                msg.role === "user"
                                  ? "bg-indigo-600 text-white rounded-br-none"
                                  : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700"
                              }`}
                            >
                              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Input form */}
                      {interrogationSession.status === "active" && (
                        <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-800 flex gap-2">
                          <input
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Type exact technical implementation details..."
                            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={isSendingMsg || !chatMessage.trim()}
                            className="flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-500 disabled:opacity-50"
                          >
                            {isSendingMsg ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select any skill from the left matrix to inspect exact evidence dimensions.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations Section */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" /> Actionable Improvement Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.recommendations.map((rec: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(rec.priority)}`}>
                        {rec.priority} Priority
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{rec.category}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{rec.title}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rec.description}</p>
                  </div>

                  {rec.example_text && (
                    <div className="rounded-lg bg-slate-900 p-3 border border-slate-800 font-mono text-[11px] text-emerald-300">
                      <span className="text-[10px] text-slate-500 uppercase block mb-1 font-sans">
                        Illustrative STAR Example:
                      </span>
                      &quot;{rec.example_text}&quot;
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
