import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { FileText } from "lucide-react";
import api from "../api/axios.js";
import { Card, ScoreBadge, EmptyState } from "../components/UI.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function Reports() {
  const { data, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => api.get("/reports").then((r) => r.data.reports),
  });

  if (isLoading) return <LoadingSpinner label="Loading reports" />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 font-display text-2xl font-semibold">Your reports</h1>

      {data.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports yet"
          description="Complete a mock interview to generate your first performance report."
          action={
            <Link to="/interview/new" className="mt-2 text-sm font-semibold text-signal">
              Start an interview
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {data.map((r) => (
            <Link key={r._id} to={`/reports/${r._id}`}>
              <Card className="flex items-center justify-between transition hover:border-signal/40">
                <div>
                  <p className="font-medium">{r.interview.role}</p>
                  <p className="text-xs capitalize text-ink/50">
                    {r.interview.interviewType} · {r.interview.difficulty} ·{" "}
                    {format(new Date(r.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <ScoreBadge score={r.overallScore} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
