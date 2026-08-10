import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Bell, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { Card, EmptyState } from "../components/UI.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/dashboard/notifications").then((r) => r.data.notifications),
  });

  const markRead = async (notifId) => {
    await api.put(`/dashboard/notifications/${notifId}/read`);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
  };

  const markAllRead = async () => {
    await api.put("/dashboard/notifications/read-all");
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
  };

  if (isLoading) return <LoadingSpinner label="Loading notifications" />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Notifications</h1>
        {data.length > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm font-medium text-signal">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" description="No notifications yet." />
      ) : (
        <div className="space-y-2">
          {data.map((n) => (
            <Card key={n._id} className={!n.isRead ? "border-signal/30 bg-signal/5" : ""}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="mt-0.5 text-sm text-ink/60">{n.message}</p>
                  <p className="mt-1 text-xs text-ink/40">{format(new Date(n.createdAt), "MMM d, yyyy · h:mm a")}</p>
                </div>
                {!n.isRead && (
                  <button onClick={() => markRead(n._id)} className="shrink-0 text-xs font-medium text-signal">
                    Mark read
                  </button>
                )}
              </div>
              {n.link && (
                <Link to={n.link} className="mt-2 inline-block text-xs font-semibold text-signal">
                  View →
                </Link>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
