import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import api from "../../api/axios.js";
import { Card } from "../../components/UI.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import AdminNav from "../../components/AdminNav.jsx";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: () => api.get("/admin/users", { params: { search } }).then((r) => r.data),
  });

  const toggleStatus = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}/status`, { isActive: !user.isActive });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`User ${user.isActive ? "deactivated" : "activated"}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "candidate" : "admin";
    try {
      await api.put(`/admin/users/${user._id}/role`, { role: newRole });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`Role changed to ${newRole}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 font-display text-2xl font-semibold">Users</h1>
      <p className="mb-6 text-sm text-ink/60">Manage candidate and admin accounts.</p>
      <AdminNav />

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-3 py-2">
        <Search size={16} className="text-ink/40" />
        <input
          placeholder="Search by name or email…"
          className="w-full text-sm outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        {isLoading ? (
          <LoadingSpinner label="Loading users" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs uppercase text-ink/40">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {data.users.map((u) => (
                  <tr key={u._id}>
                    <td className="py-2.5 font-medium">{u.name}</td>
                    <td className="py-2.5 text-ink/60">{u.email}</td>
                    <td className="py-2.5 capitalize">{u.role}</td>
                    <td className="py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.isActive ? "bg-sage/10 text-sage" : "bg-coral/10 text-coral"
                        }`}
                      >
                        {u.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => toggleRole(u)} className="mr-3 text-xs font-medium text-signal">
                        Make {u.role === "admin" ? "candidate" : "admin"}
                      </button>
                      <button onClick={() => toggleStatus(u)} className="text-xs font-medium text-coral">
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
