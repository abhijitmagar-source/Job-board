"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { JobCard } from "@/components/JobCard";
import { useAuth } from "@/context/AuthContext";
import { deleteJob, getMyJobs } from "@/lib/api";
import { ApiError } from "@/lib/api";
import type { Job } from "@/types";

export default function RecruiterJobsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
    if (!authLoading && user && user.role !== "recruiter") {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== "recruiter") return;
    getMyJobs()
      .then((data) => setJobs(data.results))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!confirm("Deactivate this job listing?")) return;
    try {
      await deleteJob(id);
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, is_active: false } : j)),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to deactivate.");
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-brand-600 hover:underline">
            ← Dashboard
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">My job postings</h1>
        </div>
        <Link
          href="/dashboard/jobs/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Post job
        </Link>
      </div>

      {loading && <p className="mt-8 text-slate-500">Loading…</p>}
      {error && <p className="mt-8 text-sm text-red-600">{error}</p>}

      {!loading && jobs.length === 0 && (
        <p className="mt-8 text-slate-600">
          No jobs posted yet.{" "}
          <Link href="/dashboard/jobs/new" className="text-brand-600 hover:underline">
            Create your first listing
          </Link>
        </p>
      )}

      <div className="mt-6 space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="relative">
            <JobCard job={job} showStatus />
            {job.is_active !== false && (
              <button
                type="button"
                onClick={() => handleDelete(job.id)}
                className="absolute right-4 top-4 text-xs font-medium text-red-600 hover:underline"
              >
                Deactivate
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
