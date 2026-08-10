import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UploadCloud, FileText, Sparkles, Target } from "lucide-react";
import api from "../api/axios.js";
import { Card, ScoreBadge, EmptyState } from "../components/UI.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function ResumePage() {
  const queryClient = useQueryClient();
  const fileInput = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [matching, setMatching] = useState(false);
  const [jd, setJd] = useState("");

  const { data: resume, isLoading } = useQuery({
    queryKey: ["resume"],
    queryFn: () => api.get("/resume/me").then((r) => r.data.resume),
  });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
    setUploading(true);
    try {
      await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Resume uploaded");
      queryClient.invalidateQueries({ queryKey: ["resume"] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await api.post(`/resume/${resume._id}/analyze`);
      toast.success("Resume analyzed");
      queryClient.invalidateQueries({ queryKey: ["resume"] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMatch = async () => {
    if (!jd.trim()) return toast.error("Paste a job description first");
    setMatching(true);
    try {
      await api.post(`/resume/${resume._id}/match-jd`, { jobDescription: jd });
      toast.success("Match analysis complete");
      queryClient.invalidateQueries({ queryKey: ["resume"] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Analysis failed");
    } finally {
      setMatching(false);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading resume" />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 font-display text-2xl font-semibold">Resume</h1>

      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-signal/10 text-signal">
              <FileText size={20} />
            </div>
            <div>
              <p className="font-medium">{resume ? resume.originalName : "No resume uploaded"}</p>
              <p className="text-xs text-ink/50">PDF or DOCX, up to 5MB</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input ref={fileInput} type="file" accept=".pdf,.docx" hidden onChange={handleUpload} />
            <button
              onClick={() => fileInput.current.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-lg border border-ink/15 px-4 py-2 text-sm font-semibold hover:bg-ink/5 disabled:opacity-60"
            >
              <UploadCloud size={16} /> {uploading ? "Uploading…" : resume ? "Replace" : "Upload"}
            </button>
            {resume && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex items-center gap-2 rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-white hover:bg-signal-dark disabled:opacity-60"
              >
                <Sparkles size={16} /> {analyzing ? "Analyzing…" : "Run ATS analysis"}
              </button>
            )}
          </div>
        </div>
      </Card>

      {!resume && (
        <EmptyState
          icon={FileText}
          title="Upload your resume to get started"
          description="We'll extract your skills and experience to generate personalized interview questions."
        />
      )}

      {resume?.analysis?.atsScore !== undefined && (
        <Card className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">ATS analysis</h2>
            <ScoreBadge score={resume.analysis.atsScore} size="lg" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <AnalysisList title="Missing skills" items={resume.analysis.missingSkills} tone="coral" />
            <AnalysisList title="Improvements" items={resume.analysis.improvements} tone="signal" />
            <AnalysisList title="Grammar suggestions" items={resume.analysis.grammarSuggestions} tone="ember" />
            <AnalysisList title="Formatting suggestions" items={resume.analysis.formattingSuggestions} tone="sage" />
          </div>
        </Card>
      )}

      {resume && (
        <Card>
          <h2 className="mb-1 flex items-center gap-2 font-display text-base font-semibold">
            <Target size={16} /> Job description matcher
          </h2>
          <p className="mb-3 text-sm text-ink/60">Paste a job description to see how well your resume matches.</p>
          <textarea
            rows={6}
            className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm"
            placeholder="Paste the job description here…"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
          />
          <button
            onClick={handleMatch}
            disabled={matching}
            className="mt-3 rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-white hover:bg-signal-dark disabled:opacity-60"
          >
            {matching ? "Analyzing…" : "Check match"}
          </button>

          {resume.jobDescriptionMatch?.matchPercentage !== undefined && (
            <div className="mt-6 border-t border-ink/10 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-ink/70">Match score</p>
                <ScoreBadge score={resume.jobDescriptionMatch.matchPercentage} size="lg" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <AnalysisList title="Missing skills" items={resume.jobDescriptionMatch.missingSkills} tone="coral" />
                <AnalysisList title="Key keywords" items={resume.jobDescriptionMatch.keywords} tone="signal" />
                <AnalysisList title="Suggestions" items={resume.jobDescriptionMatch.suggestions} tone="sage" />
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function AnalysisList({ title, items = [], tone }) {
  const toneClass = { coral: "text-coral", signal: "text-signal", ember: "text-ember", sage: "text-sage" }[tone];
  return (
    <div>
      <p className={`mb-1.5 text-xs font-semibold uppercase tracking-wide ${toneClass}`}>{title}</p>
      <ul className="space-y-1 text-sm text-ink/70">
        {items?.length ? items.map((it, i) => <li key={i}>• {it}</li>) : <li className="text-ink/30">None</li>}
      </ul>
    </div>
  );
}
