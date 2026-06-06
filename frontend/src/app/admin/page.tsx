"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardSkeleton } from "@/components/Skeleton";
import { useAuth } from "@/context/AuthContext";
import {
  getAdminApplications,
  getAdminCompanies,
  getAdminDashboard,
  getAdminJobs,
  getAdminUsers,
} from "@/lib/api";
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

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    setLoading(true);
    const loaders: Record<Tab, () => Promise<void>> = {
      overview: async () => setStats(await getAdminDashboard()),
      users: async () => setUsers((await getAdminUsers()).results),
      companies: async () => setCompanies((await getAdminCompanies()).results),
      jobs: async () => setJobs((await getAdminJobs()).results),
      applications: async () =>
        setApplications((await getAdminApplications()).results),
    };
    loaders[tab]()
      .catch(() => {})
      .finally(() => setLoading(false));
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
          <DataTable
            headers={["Email", "Role", "Joined"]}
            rows={users.map((u) => [u.email, u.role, u.date_joined?.slice(0, 10) ?? ""])}
          />
        )}

        {!loading && tab === "companies" && (
          <DataTable
            headers={["Name", "Location", "Owner"]}
            rows={companies.map((c) => [c.name, c.location, c.owner_email ?? ""])}
          />
        )}

        {!loading && tab === "jobs" && (
          <DataTable
            headers={["Title", "Company", "Location", "Active"]}
            rows={jobs.map((j) => [
              j.title,
              j.company.name,
              j.location,
              j.is_active ? "Yes" : "No",
            ])}
          />
        )}

        {!loading && tab === "applications" && (
          <DataTable
            headers={["Job", "Status", "Applied"]}
            rows={applications.map((a) => [
              a.job.title,
              a.status_display,
              a.applied_at.slice(0, 10),
            ])}
          />
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

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-slate-900 dark:text-slate-100">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
