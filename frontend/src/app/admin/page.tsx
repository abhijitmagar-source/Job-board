"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardSkeleton } from "@/components/Skeleton";
import { useAuth } from "@/context/AuthContext";
import {
  deleteAdminApplication,
  deleteAdminCompany,
  deleteAdminJob,
  deleteAdminUser,
  getAdminApplications,
  getAdminCompanies,
  getAdminDashboard,
  getAdminJobs,
  getAdminUsers,
  updateAdminApplication,
  updateAdminJob,
  updateAdminUser,
} from "@/lib/api";
import { ApiError } from "@/lib/api";
import { APPLICATION_STATUS_OPTIONS } from "@/types";
import type { AdminDashboard, Application, Company, Job, User } from "@/types";

type Tab = "overview" | "users" | "companies" | "jobs" | "applications";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<AdminDashboard | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  const loadTab = async (currentTab: Tab) => {
    setLoading(true);
    try {
      if (currentTab === "overview") setStats(await getAdminDashboard());
      if (currentTab === "users") setUsers((await getAdminUsers()).results);
      if (currentTab === "companies") setCompanies((await getAdminCompanies()).results);
      if (currentTab === "jobs") setJobs((await getAdminJobs()).results);
      if (currentTab === "applications") {
        setApplications((await getAdminApplications()).results);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    loadTab(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tab]);

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "companies", label: "Companies" },
    { id: "jobs", label: "Jobs" },
    { id: "applications", label: "Applications" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        Admin Dashboard
      </h1>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "border-b-2 border-brand-600 text-brand-600"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {loading && <p className="text-slate-500">Loading…</p>}

        {!loading && tab === "overview" && stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total users" value={stats.users_total} />
            <StatCard label="Candidates" value={stats.candidates_count} />
            <StatCard label="Recruiters" value={stats.recruiters_count} />
            <StatCard label="Active jobs" value={stats.jobs_active} />
            <StatCard label="Total jobs" value={stats.jobs_total} />
            <StatCard label="Companies" value={stats.companies_count} />
            <StatCard label="Applications" value={stats.applications_total} />
          </div>
        )}

        {!loading && tab === "users" && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Active</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={async (e) => {
                          try {
                            await updateAdminUser(u.id, { role: e.target.value });
                            setUsers((prev) =>
                              prev.map((item) =>
                                item.id === u.id ? { ...item, role: e.target.value as User["role"] } : item,
                              ),
                            );
                            toast.success("User role updated.");
                          } catch (err) {
                            toast.error(err instanceof ApiError ? err.message : "Update failed.");
                          }
                        }}
                        className="input !py-1 text-xs"
                      >
                        <option value="candidate">Candidate</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await updateAdminUser(u.id, { is_active: false });
                            setUsers((prev) => prev.filter((item) => item.id !== u.id));
                            toast.success("User deactivated.");
                          } catch (err) {
                            toast.error(err instanceof ApiError ? err.message : "Update failed.");
                          }
                        }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Deactivate
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm(`Delete ${u.email}?`)) return;
                          try {
                            await deleteAdminUser(u.id);
                            setUsers((prev) => prev.filter((item) => item.id !== u.id));
                            toast.success("User deleted.");
                          } catch (err) {
                            toast.error(err instanceof ApiError ? err.message : "Delete failed.");
                          }
                        }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === "companies" && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Owner</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3">{c.name}</td>
                    <td className="px-4 py-3">{c.location}</td>
                    <td className="px-4 py-3">{c.owner_email}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm(`Delete ${c.name}?`)) return;
                          try {
                            await deleteAdminCompany(c.id);
                            setCompanies((prev) => prev.filter((item) => item.id !== c.id));
                            toast.success("Company deleted.");
                          } catch (err) {
                            toast.error(err instanceof ApiError ? err.message : "Delete failed.");
                          }
                        }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === "jobs" && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Company</th>
                  <th className="px-4 py-3 text-left">Featured</th>
                  <th className="px-4 py-3 text-left">Active</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3">{j.title}</td>
                    <td className="px-4 py-3">{j.company.name}</td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={j.is_featured ?? false}
                        onChange={async (e) => {
                          try {
                            await updateAdminJob(j.id, { is_featured: e.target.checked });
                            setJobs((prev) =>
                              prev.map((item) =>
                                item.id === j.id
                                  ? { ...item, is_featured: e.target.checked }
                                  : item,
                              ),
                            );
                          } catch (err) {
                            toast.error(err instanceof ApiError ? err.message : "Update failed.");
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">{j.is_active ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await updateAdminJob(j.id, { is_active: false });
                            setJobs((prev) =>
                              prev.map((item) =>
                                item.id === j.id ? { ...item, is_active: false } : item,
                              ),
                            );
                            toast.success("Job deactivated.");
                          } catch (err) {
                            toast.error(err instanceof ApiError ? err.message : "Update failed.");
                          }
                        }}
                        className="mr-3 text-xs text-amber-600 hover:underline"
                      >
                        Deactivate
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm(`Delete ${j.title}?`)) return;
                          try {
                            await deleteAdminJob(j.id);
                            setJobs((prev) => prev.filter((item) => item.id !== j.id));
                            toast.success("Job deleted.");
                          } catch (err) {
                            toast.error(err instanceof ApiError ? err.message : "Delete failed.");
                          }
                        }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === "applications" && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left">Job</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Applied</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3">{a.job.title}</td>
                    <td className="px-4 py-3">
                      <select
                        value={a.status}
                        onChange={async (e) => {
                          try {
                            await updateAdminApplication(a.id, { status: e.target.value });
                            setApplications((prev) =>
                              prev.map((item) =>
                                item.id === a.id
                                  ? { ...item, status: e.target.value as Application["status"] }
                                  : item,
                              ),
                            );
                            toast.success("Status updated.");
                          } catch (err) {
                            toast.error(err instanceof ApiError ? err.message : "Update failed.");
                          }
                        }}
                        className="input !py-1 text-xs"
                      >
                        {APPLICATION_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">{a.applied_at.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm("Delete this application?")) return;
                          try {
                            await deleteAdminApplication(a.id);
                            setApplications((prev) => prev.filter((item) => item.id !== a.id));
                            toast.success("Application deleted.");
                          } catch (err) {
                            toast.error(err instanceof ApiError ? err.message : "Delete failed.");
                          }
                        }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-6">
      <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-brand-600 dark:text-brand-400">{value}</p>
    </div>
  );
}
