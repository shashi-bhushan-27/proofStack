"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { resumeApi, analysisApi } from "@/lib/api";
import { formatFileSize, getStatusInfo } from "@/lib/utils";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Building2,
  Briefcase,
} from "lucide-react";

export default function NewAnalysisWizard() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 State: Resume upload
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Step 2 State: Job Description
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jdText, setJdText] = useState("");
  const [jdError, setJdError] = useState<string | null>(null);

  // Step 3 & 4 State: Analysis creation & live polling
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Handle File Upload
  const handleFileUpload = async (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf" && !selectedFile.name.endsWith(".pdf")) {
      setUploadError("Please upload a valid PDF file (.pdf)");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10 MB limit");
      return;
    }

    setFile(selectedFile);
    setUploadError(null);
    setIsUploading(true);

    try {
      const res = await resumeApi.upload(selectedFile);
      setResumeId(res.data.id);
      setStep(2);
    } catch (err: any) {
      setUploadError(err?.detail || "Failed to upload resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Validate Step 2 and proceed to Step 3
  const handleProceedToReview = () => {
    if (!jobTitle.trim() || jobTitle.trim().length < 2) {
      setJdError("Please enter a valid job title (at least 2 characters).");
      return;
    }
    if (!jdText.trim() || jdText.trim().length < 100) {
      setJdError("Please paste a complete job description (at least 100 characters).");
      return;
    }
    setJdError(null);
    setStep(3);
  };

  // Step 3: Create Analysis
  const handleStartAnalysis = async () => {
    if (!resumeId) return;
    setIsSubmitting(true);
    setAnalysisError(null);

    try {
      const res = await analysisApi.create({
        resume_id: resumeId,
        job_title: jobTitle.trim(),
        company_name: companyName.trim() || undefined,
        job_description_text: jdText.trim(),
      } as any);

      const createdId = res.data.analysis.id;
      if (res.data.guest_token) {
        localStorage.setItem(`guest_token_${createdId}`, res.data.guest_token);
      }
      setAnalysisId(createdId);
      setAnalysisStatus(res.data.analysis.status || "pending");
      setStep(4);
    } catch (err: any) {
      setAnalysisError(err?.detail || "Failed to start analysis. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4: Poll analysis status every 2 seconds until completed or failed
  useEffect(() => {
    if (step !== 4 || !analysisId) return;

    const token = localStorage.getItem(`guest_token_${analysisId}`);
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const interval = setInterval(async () => {
      try {
        const res = await analysisApi.get(analysisId, token || undefined);
        const currentStatus = res.data.status;
        setAnalysisStatus(currentStatus);

        if (currentStatus === "completed") {
          clearInterval(interval);
          setTimeout(() => {
            router.push(`/analysis/${analysisId}`);
          }, 1000);
        } else if (currentStatus === "failed") {
          clearInterval(interval);
          setAnalysisError("Analysis pipeline failed. Please ensure the resume text is legible and try again.");
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [step, analysisId, router]);

  const currentStepInfo = getStatusInfo(analysisStatus);

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-white">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Progress Header */}
          <div className="mb-10 text-center">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Evaluate Candidate Resume Fit
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Upload resume PDF and paste target job description to verify actual skill evidence.
            </p>

            {/* Step indicator pills */}
            <div className="mt-6 flex items-center justify-center gap-2 sm:gap-4">
              {[
                { s: 1, label: "1. Upload Resume" },
                { s: 2, label: "2. Target Job" },
                { s: 3, label: "3. Review & Start" },
                { s: 4, label: "4. Live Analysis" },
              ].map((item) => (
                <div
                  key={item.s}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    step === item.s
                      ? "bg-indigo-600 text-white border border-indigo-500"
                      : step > item.s
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-900 text-slate-500 border border-slate-800"
                  }`}
                >
                  {step > item.s ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{item.s}</span>}
                  <span className="hidden sm:inline">{item.label.split(". ")[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 1: Upload Resume */}
          {step === 1 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 shadow-xl backdrop-blur-md animate-fade-in">
              <h2 className="text-lg font-bold text-white mb-2">Upload Candidate Resume (PDF)</h2>
              <p className="text-xs text-slate-400 mb-6">
                We extract all text across summaries, work history, and project sections using PyMuPDF.
              </p>

              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/60 p-10 text-center hover:border-indigo-500 hover:bg-slate-950/80 cursor-pointer transition-all">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  disabled={isUploading}
                />
                <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400 mb-4">
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <UploadCloud className="h-8 w-8" />
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  {isUploading ? "Uploading & extracting text..." : "Click or drag your PDF resume here"}
                </p>
                <p className="mt-1 text-xs text-slate-500">Max size: 10 MB. PDF files only.</p>
              </label>

              {uploadError && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {resumeId && file && !isUploading && (
                <div className="mt-6 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-emerald-200">{file.name}</p>
                      <p className="text-xs text-emerald-400/80">{formatFileSize(file.size)} • Extracted ready</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                  >
                    Next Step <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Job Description */}
          {step === 2 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 shadow-xl backdrop-blur-md animate-fade-in">
              <h2 className="text-lg font-bold text-white mb-2">Target Job Description Details</h2>
              <p className="text-xs text-slate-400 mb-6">
                Paste the exact job requirements so our AI can categorize required vs preferred skills.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Job Title <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Senior Python / ML Engineer"
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Company Name (Optional)
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. proofStack AI"
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Job Description Text <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={8}
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste full job description including requirements, qualifications, and responsibilities here..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                  <div className="mt-1 text-right text-xs text-slate-500">
                    {jdText.length} characters (at least 100 recommended)
                  </div>
                </div>
              </div>

              {jdError && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{jdError}</span>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <button
                  onClick={handleProceedToReview}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  Review Summary <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review Input */}
          {step === 3 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 shadow-xl backdrop-blur-md animate-fade-in">
              <h2 className="text-lg font-bold text-white mb-2">Review & Start Evaluation</h2>
              <p className="text-xs text-slate-400 mb-6">
                Verify your resume and target job details before launching our 7-stage evaluation engine.
              </p>

              <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-5 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Resume File:</span>
                  <span className="font-semibold text-indigo-300">{file?.name || "Uploaded PDF"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Target Role:</span>
                  <span className="font-semibold text-white">{jobTitle}</span>
                </div>
                {companyName && (
                  <div className="flex justify-between py-2 border-b border-slate-800/80">
                    <span className="text-slate-400">Company:</span>
                    <span className="font-semibold text-white">{companyName}</span>
                  </div>
                )}
                <div className="py-2">
                  <span className="text-slate-400 block mb-1">Job Description Snippet:</span>
                  <p className="text-xs text-slate-300 line-clamp-3 bg-slate-900 p-2.5 rounded border border-slate-800/80 font-mono">
                    {jdText}
                  </p>
                </div>
              </div>

              {analysisError && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{analysisError}</span>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Edit JD
                </button>
                <button
                  onClick={handleStartAnalysis}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Launching Pipeline...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Start Evidence Evaluation
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Live Polling */}
          {step === 4 && (
            <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-8 sm:p-12 shadow-2xl backdrop-blur-xl text-center animate-fade-in">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 shadow-inner">
                {analysisStatus === "completed" ? (
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                ) : analysisStatus === "failed" ? (
                  <AlertCircle className="h-10 w-10 text-rose-400" />
                ) : (
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
                )}
              </div>

              <h2 className="text-xl font-bold text-white">
                {analysisStatus === "completed"
                  ? "Evaluation Complete! Redirecting..."
                  : analysisStatus === "failed"
                  ? "Analysis Failed"
                  : "Scanning Resume Evidence Matrix..."}
              </h2>
              <p className={`mt-2 text-sm font-medium ${currentStepInfo.color}`}>
                {currentStepInfo.label}
              </p>

              {/* Progress bar stages */}
              <div className="mt-8 max-w-md mx-auto space-y-2">
                <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-700"
                    style={{ width: `${((currentStepInfo.step + 1) / 8) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Stage {Math.max(1, currentStepInfo.step)} / 7</span>
                  <span>{currentStepInfo.step >= 7 ? "100%" : `${Math.round(((currentStepInfo.step + 1) / 8) * 100)}%`}</span>
                </div>
              </div>

              {analysisError && (
                <div className="mt-6 rounded-lg bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-300">
                  {analysisError}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
