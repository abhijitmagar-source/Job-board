"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";
import { JobCardSkeleton } from "@/components/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { ApiError, getJob, getJobApplicants, updateApplicationStatus } from "@/lib/api";
import { APPLICATION_STATUS_OPTIONS, formatDate } from "@/types";
import type { Job, JobApplicant } from "@/types";

export default function JobApplicantsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "recruiter")) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== "recruiter") return;
    const jobId = Number(id);
    Promise.all([
      getJob(jobId),
      getJobApplicants(jobId, statusFilter || undefined),
    ])
      .then(([jobData, applicantsData]) => {
        setJob(jobData);
        setApplicants(applicantsData.results);
      })
      .catch(() => toast.error("Failed to load applicants."))
      .finally(() => setLoading(false));
  }, [user, id, statusFilter]);

  const handleStatusChange = async (applicationId: number, status: string) => {
    try {
      const updated = await updateApplicationStatus(applicationId, status);
      setApplicants((prev) =>
        prev.map((a) => (a.id === applicationId ? updated : a)),
      );
      toast.success("Status updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <JobCardSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/dashboard/jobs" className="text-sm text-brand-600 hover:underline">
        ← Back to my jobs
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
        Applicants — {job?.title}
      </h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        {applicants.length} applicant{applicants.length !== 1 ? "s" : ""}
      </p>

      <div className="mt-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="">All statuses</option>
          {APPLICATION_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {applicants.length === 0 ? (
          <EmptyState
            title="No applicants yet"
            description="When candidates apply, they'll appear here."
          />
        ) : (
          applicants.map((app) => (
            <div key={app.id} className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {app.applicant.candidate_profile?.full_name ?? app.applicant.email}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {app.applicant.email}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Applied {formatDate(app.applied_at)}
                  </p>
                </div>
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  className="input w-auto text-sm"
                >
                  {APPLICATION_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {app.cover_letter && (
                <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">
                  {app.cover_letter}
                </p>
              )}

              <div className="mt-4 flex gap-3">
                {app.resume_url && (
                  <a
                    href={app.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="btn-primary text-sm"
                  >
                    Download resume
                  </a>
                )}
                {app.applicant.candidate_profile?.resume_url && !app.resume_url && (
                  <a
                    href={app.applicant.candidate_profile.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="btn-secondary text-sm"
                  >
                    Download profile resume
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
