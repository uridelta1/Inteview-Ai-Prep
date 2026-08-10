import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? "bg-ink text-paper" : "text-ink/60 hover:bg-ink/5"}`;

export default function AdminNav() {
  return (
    <div className="mb-6 flex flex-wrap gap-1">
      <NavLink to="/admin" end className={linkClass}>Overview</NavLink>
      <NavLink to="/admin/users" className={linkClass}>Users</NavLink>
      <NavLink to="/admin/analytics" className={linkClass}>Analytics</NavLink>
      <NavLink to="/admin/logs" className={linkClass}>System logs</NavLink>
    </div>
  );
}
