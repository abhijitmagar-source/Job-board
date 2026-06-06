"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { JobCardSkeleton } from "@/components/Skeleton";
import { useAuth } from "@/context/AuthContext";
import {
  ApiError,
  applyForJob,
  getJob,
  getSavedJobs,
  saveJob,
  unsaveJob,
} from "@/lib/api";
import { formatDate, formatLabel, formatSalary } from "@/types";
import type { Job } from "@/types";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [savedJobId, setSavedJobId] = useState<number | null>(null);

  useEffect(() => {
    getJob(Number(id))
      .then(setJob)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user || user.role !== "candidate") return;
    getSavedJobs()
      .then((data) => {
        const match = data.results.find((s) => s.job.id === Number(id));
        if (match) setSavedJobId(match.id);
      })
      .catch(() => {});
  }, [user, id]);

  const handleApply = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    setApplying(true);
    try {
      const resumeUrl = user.candidate_profile?.resume_url;
      await applyForJob(Number(id), coverLetter, resumeUrl);
      setApplied(true);
      toast.success("Application submitted successfully!");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to apply.");
    } finally {
      setApplying(false);
    }
  };

  const toggleSave = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      if (savedJobId) {
        await unsaveJob(savedJobId);
        setSavedJobId(null);
        toast.success("Job removed from saved list.");
      } else {
        const saved = await saveJob(Number(id));
        setSavedJobId(saved.id);
        toast.success("Job saved!");
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update saved job.");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <JobCardSkeleton />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-red-600">{error || "Job not found."}</p>
        <Link href="/jobs" className="mt-4 inline-block text-brand-600">
          Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/jobs" className="text-sm text-brand-600 hover:underline">
        ← Back to jobs
      </Link>

      <article className="card mt-6 p-8">
        <header className="flex gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700">
            {job.company.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={job.company.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-brand-600">
                {job.company.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {job.title}
            </h1>
            <Link
              href={`/companies/${job.company.id}`}
              className="mt-1 text-lg text-slate-600 hover:text-brand-600 dark:text-slate-400"
            >
              {job.company.name}
            </Link>
            <p className="mt-1 text-sm text-slate-500">
              Posted {formatDate(job.created_at)}
            </p>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700">
            {job.location}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700">
            {formatLabel(job.job_type)}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700">
            {formatLabel(job.experience_level)}
          </span>
          {job.category && (
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700">
              {formatLabel(job.category)}
            </span>
          )}
          <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            {formatSalary(job.salary)}
          </span>
        </div>

        {job.skills && (
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Required skills
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{job.skills}</p>
          </div>
        )}

        <div className="mt-8 whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
          {job.description}
        </div>

        {user?.role === "candidate" && job.is_active !== false && (
          <div className="mt-8 space-y-4 border-t border-slate-200 pt-8 dark:border-slate-700">
            <div className="flex gap-3">
              <button type="button" onClick={toggleSave} className="btn-secondary">
                {savedJobId ? "Unsave job" : "Save job"}
              </button>
            </div>

            {!applied ? (
              <form onSubmit={handleApply} className="space-y-3">
                <label htmlFor="cover" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Cover letter
                </label>
                <textarea
                  id="cover"
                  required
                  rows={5}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the recruiter why you're a great fit…"
                  className="input"
                />
                {user.candidate_profile?.resume_url && (
                  <p className="text-xs text-slate-500">
                    Your resume will be attached automatically.
                  </p>
                )}
                <button type="submit" disabled={applying} className="btn-primary">
                  {applying ? "Submitting…" : "Apply now"}
                </button>
              </form>
            ) : (
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                You have applied for this job.
              </p>
            )}
          </div>
        )}

        {!user && job.is_active !== false && (
          <div className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <Link href="/login" className="text-brand-600 hover:underline">
                Log in
              </Link>{" "}
              as a candidate to apply or save this job.
            </p>
          </div>
        )}
      </article>
    </div>
  );
}
