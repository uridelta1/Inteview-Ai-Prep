import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import api from "../../api/axios.js";
import { Card } from "../../components/UI.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import AdminNav from "../../components/AdminNav.jsx";

const ACTIONS = ["", "login", "logout", "ai_question_gen", "ai_evaluation", "resume_analysis", "jd_analysis"];

export default function AdminLogs() {
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-logs", action, page],
    queryFn: () => api.get("/admin/logs", { params: { action, page, limit: 25 } }).then((r) => r.data),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 font-display text-2xl font-semibold">System logs</h1>
      <p className="mb-6 text-sm text-ink/60">Login activity and AI request audit trail.</p>
      <AdminNav />

      <div className="mb-4">
        <select
          className="focus-ring rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
        >
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a ? a.replaceAll("_", " ") : "All actions"}
            </option>
          ))}
        </select>
      </div>

      <Card>
        {isLoading ? (
          <LoadingSpinner label="Loading logs" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase text-ink/40">
                    <th className="pb-2">User</th>
                    <th className="pb-2">Action</th>
                    <th className="pb-2">IP</th>
                    <th className="pb-2">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {data.logs.map((log) => (
                    <tr key={log._id}>
                      <td className="py-2">{log.user?.name || "Unknown"}</td>
                      <td className="py-2 capitalize">{log.action.replaceAll("_", " ")}</td>
                      <td className="py-2 font-mono text-xs text-ink/50">{log.ip || "—"}</td>
                      <td className="py-2 text-xs text-ink/50">
                        {format(new Date(log.createdAt), "MMM d, h:mm a")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-ink/50">
                Page {data.page} of {data.pages || 1}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-ink/15 px-3 py-1.5 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  disabled={page >= (data.pages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-ink/15 px-3 py-1.5 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
