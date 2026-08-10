import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, CheckCircle2, Flag } from "lucide-react";
import api from "../api/axios.js";
import { Card, ScoreBadge } from "../components/UI.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: interview, isLoading } = useQuery({
    queryKey: ["interview", id],
    queryFn: () => api.get(`/interviews/${id}`).then((r) => r.data.interview),
  });

  const [index, setIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [answeredIds, setAnsweredIds] = useState(new Set());
  const [completing, setCompleting] = useState(false);

  if (isLoading) return <LoadingSpinner label="Loading interview" />;

  const questions = interview.questions;
  const question = questions[index];
  const isLast = index === questions.length - 1;

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/interviews/${id}/answer`, {
        questionId: question._id,
        userText: answerText,
      });
      setEvaluation(data.answer.evaluation);
      setAnsweredIds((prev) => new Set(prev).add(question._id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Evaluation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setEvaluation(null);
    setAnswerText("");
    setIndex((i) => i + 1);
  };

  const handleFinish = async () => {
    setCompleting(true);
    try {
      const { data } = await api.post(`/interviews/${id}/complete`);
      toast.success("Report generated!");
      navigate(`/reports/${data.report._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete interview");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rec-dot" />
          <span className="text-sm font-medium text-ink/60">
            Question {index + 1} of {questions.length} · {interview.role}
          </span>
        </div>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full bg-signal transition-all"
            style={{ width: `${((index + (evaluation ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question._id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="mb-4">
            <span className="mb-2 inline-block rounded-full bg-ink/5 px-2.5 py-1 text-xs font-medium capitalize text-ink/60">
              {question.category} {question.topic ? `· ${question.topic}` : ""}
            </span>
            <h2 className="font-display text-lg font-semibold leading-snug">{question.text}</h2>
          </Card>

          {!evaluation ? (
            <Card>
              <form onSubmit={handleSubmitAnswer}>
                <textarea
                  autoFocus
                  rows={7}
                  placeholder="Type your answer as if you were speaking to the interviewer…"
                  className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={submitting || !answerText.trim()}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-white hover:bg-signal-dark disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Evaluating…
                    </>
                  ) : (
                    "Submit answer"
                  )}
                </button>
              </form>
            </Card>
          ) : (
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-base font-semibold">
                  <CheckCircle2 size={18} className="text-sage" /> Feedback
                </h3>
                <ScoreBadge score={evaluation.overallScore} max={10} size="lg" />
              </div>

              <div className="mb-4 grid grid-cols-5 gap-2 text-center">
                {[
                  ["Technical", evaluation.technicalAccuracy],
                  ["Communication", evaluation.communication],
                  ["Confidence", evaluation.confidence],
                  ["Problem solving", evaluation.problemSolving],
                  ["Clarity", evaluation.clarity],
                ].map(([label, val]) => (
                  <div key={label} className="rounded-lg bg-ink/5 py-2">
                    <p className="font-mono text-sm font-semibold">{val}</p>
                    <p className="text-[10px] text-ink/50">{label}</p>
                  </div>
                ))}
              </div>

              <p className="mb-3 text-sm text-ink/70">{evaluation.feedback}</p>

              <div className="mb-3 rounded-lg bg-signal/5 p-3 text-sm">
                <p className="mb-1 font-semibold text-signal">Model answer</p>
                <p className="text-ink/70">{evaluation.correctAnswer}</p>
              </div>

              <div className="mb-4">
                <p className="mb-1 text-sm font-semibold text-ember">Improve by</p>
                <ul className="space-y-0.5 text-sm text-ink/70">
                  {evaluation.improvementSuggestions?.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>

              {isLast ? (
                <button
                  onClick={handleFinish}
                  disabled={completing}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-60"
                >
                  {completing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Generating report…
                    </>
                  ) : (
                    <>
                      <Flag size={16} /> Finish interview & see report
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-signal py-2.5 text-sm font-semibold text-white hover:bg-signal-dark"
                >
                  Next question <ArrowRight size={16} />
                </button>
              )}
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
