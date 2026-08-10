import { Link, NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Mic, LayoutDashboard, FileText, User, LogOut, ShieldCheck, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? "bg-ink text-paper" : "text-ink/70 hover:bg-ink/5"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => api.get("/dashboard").then((r) => r.data),
    enabled: !!user,
    staleTime: 60_000,
  });

  const unread = data?.stats?.unreadNotifications || 0;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal text-white">
            <Mic size={16} />
          </span>
          InterviewAI
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          <NavLink to="/dashboard" className={navLinkClass}>
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>
          <NavLink to="/resume" className={navLinkClass}>
            <FileText size={16} /> Resume
          </NavLink>
          <NavLink to="/interview/new" className={navLinkClass}>
            <Mic size={16} /> New Interview
          </NavLink>
          <NavLink to="/reports" className={navLinkClass}>
            <FileText size={16} /> Reports
          </NavLink>
          {user.role === "admin" && (
            <NavLink to="/admin" className={navLinkClass}>
              <ShieldCheck size={16} /> Admin
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-2">
          <NavLink to="/notifications" className="relative rounded-lg p-2 text-ink/70 hover:bg-ink/5">
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[10px] font-semibold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </NavLink>
          <NavLink to="/profile" className="rounded-lg p-2 text-ink/70 hover:bg-ink/5">
            <User size={18} />
          </NavLink>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-ink/70 hover:bg-coral/10 hover:text-coral"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>
    </header>
  );
}
