import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../../api/axios.js";
import { Card } from "../../components/UI.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import AdminNav from "../../components/AdminNav.jsx";

export default function AdminAnalytics() {
  const { data: analytics, isLoading: loadingA } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => api.get("/admin/analytics").then((r) => r.data.analytics),
  });
  const { data: aiUsage, isLoading: loadingU } = useQuery({
    queryKey: ["admin-ai-usage"],
    queryFn: () => api.get("/admin/ai-usage").then((r) => r.data),
  });

  if (loadingA || loadingU) return <LoadingSpinner label="Loading analytics" />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 font-display text-2xl font-semibold">Analytics</h1>
      <p className="mb-6 text-sm text-ink/60">Growth trends and AI usage across the platform.</p>
      <AdminNav />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-display text-base font-semibold">Signups over time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.signupsOverTime.map((d) => ({ date: d._id, count: d.count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E4DE" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#2F5FED" fill="#2F5FED22" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="mb-3 font-display text-base font-semibold">Interviews over time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.interviewsOverTime.map((d) => ({ date: d._id, count: d.count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E4DE" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#F0A93E" fill="#F0A93E22" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="mb-3 font-display text-base font-semibold">AI API usage by action</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase text-ink/40">
                <th className="pb-2">Action</th>
                <th className="pb-2">Calls</th>
                <th className="pb-2">Avg latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {aiUsage.usageByAction.map((u) => (
                <tr key={u._id}>
                  <td className="py-2 capitalize">{u._id.replaceAll("_", " ")}</td>
                  <td className="py-2 font-mono">{u.count}</td>
                  <td className="py-2 font-mono">{Math.round(u.avgLatencyMs || 0)}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
