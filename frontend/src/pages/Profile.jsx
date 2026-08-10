import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Card } from "../components/UI.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

export default function Profile() {
  const { setUser } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("/users/profile").then((r) => r.data.user),
  });

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || "",
        skills: (data.skills || []).join(", "),
        experience: data.experience || "",
        education: data.education || "",
        linkedin: data.linkedin || "",
        github: data.github || "",
      });
    }
  }, [data]);

  if (isLoading || !form) return <LoadingSpinner label="Loading profile" />;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: res } = await api.put("/users/profile", {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setUser(res.user);
      localStorage.setItem("user", JSON.stringify(res.user));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPw(true);
    try {
      await api.put("/users/change-password", pw);
      toast.success("Password changed. Please log in again.");
      setPw({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPw(false);
    }
  };

  const field = (label, key, placeholder = "") => (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink/70">{label}</label>
      <input
        className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm"
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 font-display text-2xl font-semibold">Your profile</h1>

      <Card className="mb-6">
        <form onSubmit={handleSave} className="space-y-4">
          {field("Full name", "name")}
          <p className="text-sm text-ink/50">{data.email} (email can't be changed)</p>
          {field("Skills (comma separated)", "skills", "React, Node.js, MongoDB")}
          {field("Experience", "experience", "e.g. 2 years")}
          {field("Education", "education", "e.g. B.Tech Computer Science")}
          {field("LinkedIn URL", "linkedin")}
          {field("GitHub URL", "github")}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-white hover:bg-signal-dark disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-base font-semibold">Change password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <input
            type="password"
            required
            placeholder="Current password"
            className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm"
            value={pw.currentPassword}
            onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="New password"
            className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm"
            value={pw.newPassword}
            onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
          />
          <button
            type="submit"
            disabled={changingPw}
            className="rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-semibold hover:bg-ink/5 disabled:opacity-60"
          >
            {changingPw ? "Updating…" : "Change password"}
          </button>
        </form>
      </Card>
    </div>
  );
}
