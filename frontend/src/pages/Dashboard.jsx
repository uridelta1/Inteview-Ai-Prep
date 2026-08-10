import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { Mic, TrendingUp, Trophy, Target, ArrowRight } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Card, ScoreBadge, EmptyState } from "../components/UI.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/dashboard").then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner label="Loading your dashboard" />;

  const { stats, progressChart, recentInterviews } = data;

  const chartData = progressChart.map((p) => ({
    date: format(new Date(p.date), "MMM d"),
    Overall: p.overallScore,
    Technical: p.technicalScore,
    Communication: p.communicationScore,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="text-sm text-ink/60">Here's how your interview prep is going.</p>
        </div>
        <Link
          to="/interview/new"
          className="flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-white hover:bg-signal-dark"
        >
          <Mic size={16} /> New mock interview
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Mic} label="Total interviews" value={stats.totalInterviews} />
        <StatCard icon={Target} label="Completed" value={stats.totalCompleted} />
        <StatCard icon={TrendingUp} label="Average score" value={`${stats.averageScore}/100`} />
        <StatCard
          icon={Trophy}
          label="Best score"
          value={stats.bestPerformance ? `${stats.bestPerformance.score}/100` : "—"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-display text-base font-semibold">Progress over time</h2>
          {chartData.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No interviews yet"
              description="Complete your first mock interview to start tracking progress."
            />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E4DE" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="Overall" stroke="#2F5FED" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Technical" stroke="#F0A93E" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Communication" stroke="#3FA672" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-display text-base font-semibold">Strong areas</h2>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {stats.topStrongAreas.length ? (
              stats.topStrongAreas.map((a) => (
                <span key={a} className="rounded-full bg-sage/10 px-2.5 py-1 text-xs font-medium text-sage">
                  {a}
                </span>
              ))
            ) : (
              <p className="text-sm text-ink/40">Not enough data yet</p>
            )}
          </div>
          <h2 className="mb-3 font-display text-base font-semibold">Weak areas</h2>
          <div className="flex flex-wrap gap-1.5">
            {stats.topWeakAreas.length ? (
              stats.topWeakAreas.map((a) => (
                <span key={a} className="rounded-full bg-coral/10 px-2.5 py-1 text-xs font-medium text-coral">
                  {a}
                </span>
              ))
            ) : (
              <p className="text-sm text-ink/40">Not enough data yet</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Recent interviews</h2>
          <Link to="/reports" className="flex items-center gap-1 text-sm font-medium text-signal">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {recentInterviews.length === 0 ? (
          <EmptyState
            icon={Mic}
            title="No interviews yet"
            description="Start your first AI mock interview to see it here."
            action={
              <Link to="/interview/new" className="mt-2 text-sm font-semibold text-signal">
                Start now
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-ink/10">
            {recentInterviews.map((i) => (
              <div key={i._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{i.role}</p>
                  <p className="text-xs capitalize text-ink/50">
                    {i.interviewType} · {i.difficulty} · {format(new Date(i.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {i.status === "completed" ? (
                    <>
                      <ScoreBadge score={i.report?.overallScore ?? 0} />
                      <Link to={`/reports/${i.report?._id || i.report}`} className="text-sm font-medium text-signal">
                        Report
                      </Link>
                    </>
                  ) : (
                    <Link to={`/interview/${i._id}`} className="text-sm font-medium text-signal">
                      Resume
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-signal/10 text-signal">
        <Icon size={18} />
      </div>
      <div>
        <p className="font-mono text-lg font-semibold leading-none">{value}</p>
        <p className="text-xs text-ink/50">{label}</p>
      </div>
    </Card>
  );
}
