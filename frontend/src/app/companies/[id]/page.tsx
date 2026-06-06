"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { JobCard } from "@/components/JobCard";
import { JobCardSkeleton } from "@/components/Skeleton";
import { getCompany, getJobs } from "@/lib/api";
import type { Company, Job } from "@/types";

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const companyId = Number(id);
    Promise.all([
      getCompany(companyId),
      getJobs({ company: String(companyId) }),
    ])
      .then(([companyData, jobsData]) => {
        setCompany(companyData);
        setJobs(jobsData.results);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <JobCardSkeleton />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-red-600">{error || "Company not found."}</p>
        <Link href="/jobs" className="mt-4 inline-block text-brand-600">
          Browse jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="card p-8">
        <div className="flex items-start gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700">
            {company.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-brand-600">
                {company.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {company.name}
            </h1>
            {company.location && (
              <p className="mt-1 text-slate-600 dark:text-slate-400">{company.location}</p>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-brand-600 hover:underline"
              >
                {company.website}
              </a>
            )}
          </div>
        </div>
        {company.description && (
          <p className="mt-6 leading-relaxed text-slate-700 dark:text-slate-300">
            {company.description}
          </p>
        )}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Open positions ({jobs.length})
        </h2>
        <div className="mt-4 space-y-3">
          {jobs.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400">No open positions right now.</p>
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} showApply />)
          )}
        </div>
      </section>
    </div>
  );
}
