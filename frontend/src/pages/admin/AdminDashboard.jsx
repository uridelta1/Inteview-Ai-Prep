import { useQuery } from "@tanstack/react-query";
import { Users, Mic, TrendingUp, CheckCircle2 } from "lucide-react";
import api from "../../api/axios.js";
import { Card } from "../../components/UI.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import AdminNav from "../../components/AdminNav.jsx";

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => api.get("/admin/analytics").then((r) => r.data.analytics),
  });

  if (isLoading) return <LoadingSpinner label="Loading analytics" />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 font-display text-2xl font-semibold">Admin overview</h1>
      <p className="mb-6 text-sm text-ink/60">Platform-wide stats at a glance.</p>
      <AdminNav />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat icon={Users} label="Total users" value={data.totalUsers} />
        <Stat icon={Mic} label="Total interviews" value={data.totalInterviews} />
        <Stat icon={CheckCircle2} label="Completion rate" value={`${data.completionRate}%`} />
        <Stat icon={TrendingUp} label="Avg score" value={`${data.averageScore}/100`} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display text-base font-semibold">Interviews by role</h2>
          <div className="space-y-2">
            {data.interviewsByRole.map((r) => (
              <BarRow key={r._id} label={r._id} value={r.count} max={data.interviewsByRole[0]?.count || 1} />
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 font-display text-base font-semibold">Interviews by type</h2>
          <div className="space-y-2">
            {data.interviewsByType.map((t) => (
              <BarRow
                key={t._id}
                label={t._id}
                value={t.count}
                max={Math.max(...data.interviewsByType.map((x) => x.count), 1)}
                color="bg-ember"
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <Card className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-signal/10 text-signal">
        <Icon size={18} />
      </div>
      <div>
        <p className="font-mono text-lg font-semibold leading-none">{value}</p>
        <p className="text-xs text-ink/50">{label}</p>
      </div>
    </Card>
  );
}

function BarRow({ label, value, max, color = "bg-signal" }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="capitalize text-ink/70">{label}</span>
        <span className="font-mono text-xs text-ink/50">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-ink/5">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}
