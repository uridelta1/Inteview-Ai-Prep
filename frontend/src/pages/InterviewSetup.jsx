import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mic, Loader2 } from "lucide-react";
import api from "../api/axios.js";
import { Card } from "../components/UI.jsx";

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "MERN Stack Developer",
  "Java Developer",
  "Python Developer",
  "Data Analyst",
  "Full Stack Developer",
  "DevOps Engineer",
];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "Frontend Developer",
    experienceLevel: "fresher",
    difficulty: "medium",
    interviewType: "mixed",
    numberOfQuestions: 5,
    jobDescription: "",
    useResume: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/interviews", form);
      toast.success("Interview ready — good luck!");
      navigate(`/interview/${data.interview._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create interview");
    } finally {
      setSubmitting(false);
    }
  };

  const selectClass = "focus-ring w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm bg-white";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal/10 text-signal">
          <Mic size={18} />
        </span>
        <h1 className="font-display text-2xl font-semibold">Set up your mock interview</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/70">Target role</label>
            <select className={selectClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink/70">Experience level</label>
              <select
                className={selectClass}
                value={form.experienceLevel}
                onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
              >
                <option value="fresher">Fresher</option>
                <option value="junior">Junior (0-2 yrs)</option>
                <option value="mid">Mid (2-5 yrs)</option>
                <option value="senior">Senior (5+ yrs)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink/70">Difficulty</label>
              <select
                className={selectClass}
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink/70">Interview type</label>
              <select
                className={selectClass}
                value={form.interviewType}
                onChange={(e) => setForm({ ...form, interviewType: e.target.value })}
              >
                <option value="technical">Technical</option>
                <option value="hr">HR</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink/70">Number of questions</label>
              <select
                className={selectClass}
                value={form.numberOfQuestions}
                onChange={(e) => setForm({ ...form, numberOfQuestions: Number(e.target.value) })}
              >
                {[3, 5, 8, 10, 15].map((n) => (
                  <option key={n} value={n}>{n} questions</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink/70">
              Job description <span className="font-normal text-ink/40">(optional)</span>
            </label>
            <textarea
              rows={4}
              placeholder="Paste a job description to tailor questions further…"
              className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm"
              value={form.jobDescription}
              onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={form.useResume}
              onChange={(e) => setForm({ ...form, useResume: e.target.checked })}
            />
            Use my uploaded resume to personalize questions
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-signal py-3 text-sm font-semibold text-white hover:bg-signal-dark disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generating questions…
              </>
            ) : (
              "Start interview"
            )}
          </button>
        </form>
      </Card>
    </div>
  );
}
