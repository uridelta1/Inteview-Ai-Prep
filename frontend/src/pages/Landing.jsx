import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, FileText, TrendingUp, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";

export default function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="bg-ink text-paper">
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-20 text-center">
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-paper/15 px-3 py-1 text-xs font-medium text-paper/70">
          <span className="rec-dot" />
          Live AI interviewer, ready in seconds
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-balance font-display text-4xl font-semibold leading-tight sm:text-6xl"
        >
          Practice interviews that actually prepare you.
        </motion.h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-paper/70">
          Upload your resume, pick a role, and let InterviewAI run a realistic
          mock interview — then get a scored breakdown of exactly what to fix.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="flex items-center gap-2 rounded-lg bg-signal px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal-dark"
          >
            Start a mock interview <ArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-paper/20 px-5 py-3 text-sm font-semibold text-paper hover:bg-paper/5"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="border-t border-paper/10 bg-paper py-16 text-ink">
        <div className="mx-auto grid max-w-5xl gap-6 px-6 sm:grid-cols-3">
          {[
            {
              icon: FileText,
              title: "Resume-aware questions",
              desc: "Every question set is generated from your actual skills, projects, and target role.",
            },
            {
              icon: Mic,
              title: "Realistic mock interviews",
              desc: "Technical, HR, or mixed rounds — set the difficulty and length that match your prep stage.",
            },
            {
              icon: TrendingUp,
              title: "Track real progress",
              desc: "Every session scores accuracy, communication, and confidence, with trends over time.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl2 border border-ink/10 bg-white p-6 shadow-card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-signal/10 text-signal">
                <Icon size={18} />
              </div>
              <h3 className="font-display text-base font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-ink/60">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
