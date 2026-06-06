"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { JobCard } from "@/components/JobCard";
import { JobFiltersPanel } from "@/components/JobFilters";
import { Pagination } from "@/components/Pagination";
import { JobCardSkeleton } from "@/components/Skeleton";
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
    skills: searchParams.get("skills") ?? undefined,
    company: searchParams.get("company") ?? undefined,
    job_type: (searchParams.get("job_type") ?? undefined) as JobFilters["job_type"],
    experience_level: (searchParams.get("experience_level") ??
      undefined) as JobFilters["experience_level"],
    category: (searchParams.get("category") ?? undefined) as JobFilters["category"],
    salary_min: searchParams.get("salary_min") ?? undefined,
    salary_max: searchParams.get("salary_max") ?? undefined,
    is_featured: searchParams.get("is_featured") ?? undefined,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside>
        <JobFiltersPanel />
      </aside>

      <div className="space-y-4">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <EmptyState
            title="No jobs found"
            description="Try adjusting your search or filters to find more opportunities."
          />
        )}

        {!loading && jobs.length > 0 && (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {count} jobs found
            </p>
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} showApply />
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Browse Jobs
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Search and filter open roles across companies.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <JobsContent />
      </Suspense>
    </div>
  );
}
