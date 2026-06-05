"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { JobCard } from "@/components/JobCard";
import { JobFiltersPanel } from "@/components/JobFilters";
import { Pagination } from "@/components/Pagination";
import { getJobs } from "@/lib/api";
import type { Job, JobFilters } from "@/types";

function JobsContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const queryKey = searchParams.toString();

  const filters: JobFilters = {
    search: searchParams.get("search") ?? undefined,
    location: searchParams.get("location") ?? undefined,
    job_type: (searchParams.get("job_type") ?? undefined) as JobFilters["job_type"],
    experience_level: (searchParams.get("experience_level") ??
      undefined) as JobFilters["experience_level"],
    salary_min: searchParams.get("salary_min") ?? undefined,
    salary_max: searchParams.get("salary_max") ?? undefined,
    ordering: searchParams.get("ordering") ?? undefined,
    page: searchParams.get("page") ?? undefined,
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getJobs(filters)
      .then((data) => {
        if (!cancelled) {
          setJobs(data.results);
          setCount(data.count);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when URL query changes
  }, [queryKey]);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside>
        <JobFiltersPanel />
      </aside>

      <div className="space-y-4">
        {loading && (
          <p className="text-center text-slate-500 py-12">Loading jobs…</p>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
            <p className="text-lg font-medium text-slate-900">No jobs found</p>
            <p className="mt-2 text-sm text-slate-600">
              Try adjusting your search or filters.
            </p>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <>
            <p className="text-sm text-slate-600">{count} jobs found</p>
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            <Pagination count={count} />
          </>
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Browse Jobs</h1>
        <p className="mt-2 text-slate-600">
          Search and filter open roles across companies.
        </p>
      </div>

      <Suspense fallback={<p className="text-slate-500">Loading filters…</p>}>
        <JobsContent />
      </Suspense>
    </div>
  );
}
