"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { JobCard } from "@/components/JobCard";
import { useAuth } from "@/context/AuthContext";
import { getSavedJobs, unsaveJob } from "@/lib/api";
import { ApiError } from "@/lib/api";
import type { SavedJob } from "@/types";

export default function SavedJobsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
    if (!authLoading && user && user.role !== "job_seeker") {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const loadSaved = () => {
    getSavedJobs()
      .then((data) => setSaved(data.results))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user || user.role !== "job_seeker") return;
    loadSaved();
  }, [user]);

  const handleUnsave = async (savedJobId: number) => {
    try {
      await unsaveJob(savedJobId);
      setSaved((prev) => prev.filter((s) => s.id !== savedJobId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to unsave.");
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/dashboard" className="text-sm text-brand-600 hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Saved jobs</h1>

      {loading && <p className="mt-8 text-slate-500">Loading…</p>}
      {error && <p className="mt-8 text-sm text-red-600">{error}</p>}

      {!loading && saved.length === 0 && (
        <p className="mt-8 text-slate-600">
          No saved jobs yet.{" "}
          <Link href="/jobs" className="text-brand-600 hover:underline">
            Browse jobs
          </Link>
        </p>
      )}

      <div className="mt-6 space-y-3">
        {saved.map((item) => (
          <div key={item.id} className="relative">
            <JobCard job={{ ...item.job, is_saved: true }} />
            <button
              type="button"
              onClick={() => handleUnsave(item.id)}
              className="absolute right-4 top-4 text-xs font-medium text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
