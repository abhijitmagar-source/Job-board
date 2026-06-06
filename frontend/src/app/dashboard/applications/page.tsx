"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMyApplications } from "@/lib/api";
import { APPLICATION_STATUS_OPTIONS, formatLabel } from "@/types";
import type { Application, ApplicationStatus } from "@/types";

export default function ApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
    if (!authLoading && user && user.role !== "candidate") {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== "candidate") return;
    setLoading(true);
    getMyApplications(statusFilter || undefined)
      .then((data) => setApplications(data.results))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, statusFilter]);

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/dashboard" className="text-sm text-brand-600 hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
        My applications
      </h1>

      <div className="mt-6">
        <label htmlFor="status" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
          Filter by status
        </label>
        <select
          id="status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "")}
          className="input max-w-xs"
        >
          <option value="">All statuses</option>
          {APPLICATION_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="mt-8 text-slate-500">Loading…</p>}
      {error && <p className="mt-8 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {!loading && applications.length === 0 && (
        <p className="mt-8 text-slate-600 dark:text-slate-400">
          No applications yet.{" "}
          <Link href="/jobs" className="text-brand-600 hover:underline">
            Browse jobs
          </Link>
        </p>
      )}

      <div className="mt-6 space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link
                  href={`/jobs/${app.job.id}`}
                  className="text-lg font-semibold text-slate-900 hover:text-brand-600 dark:text-slate-100"
                >
                  {app.job.title}
                </Link>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {app.job.company.name}
                </p>
              </div>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                {formatLabel(app.status)}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Applied {new Date(app.applied_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
