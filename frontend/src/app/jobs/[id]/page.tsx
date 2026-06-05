"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  applyForJob,
  getJob,
  getSavedJobs,
  saveJob,
  unsaveJob,
} from "@/lib/api";
import { ApiError } from "@/lib/api";
import { formatLabel, formatSalary } from "@/types";
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
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    getJob(Number(id))
      .then(setJob)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user?.role || user.role !== "job_seeker") return;
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
    setActionMessage("");
    try {
      await applyForJob(Number(id), coverLetter);
      setApplied(true);
      setActionMessage("Application submitted successfully.");
    } catch (err) {
      setActionMessage(
        err instanceof ApiError ? err.message : "Failed to apply.",
      );
    } finally {
      setApplying(false);
    }
  };

  const toggleSave = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setActionMessage("");
    try {
      if (savedJobId) {
        await unsaveJob(savedJobId);
        setSavedJobId(null);
        setActionMessage("Job removed from saved list.");
      } else {
        const saved = await saveJob(Number(id));
        setSavedJobId(saved.id);
        setActionMessage("Job saved.");
      }
    } catch (err) {
      setActionMessage(
        err instanceof ApiError ? err.message : "Could not update saved job.",
      );
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-slate-500">
        Loading job…
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

      <article className="mt-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>
          <p className="mt-2 text-lg text-slate-600">{job.company.name}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {job.location}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {formatLabel(job.job_type)}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {formatLabel(job.experience_level)}
            </span>
            <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700">
              {formatSalary(job.salary)}
            </span>
          </div>
        </header>

        <div className="mt-8 whitespace-pre-wrap text-slate-700 leading-relaxed">
          {job.description}
        </div>

        {user?.role === "job_seeker" && job.is_active !== false && (
          <div className="mt-8 space-y-4 border-t border-slate-200 pt-8">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={toggleSave}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {savedJobId ? "Unsave job" : "Save job"}
              </button>
            </div>

            {!applied ? (
              <form onSubmit={handleApply} className="space-y-3">
                <label htmlFor="cover" className="block text-sm font-medium text-slate-700">
                  Cover letter
                </label>
                <textarea
                  id="cover"
                  required
                  rows={5}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the recruiter why you're a great fit…"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  disabled={applying}
                  className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  {applying ? "Submitting…" : "Apply now"}
                </button>
              </form>
            ) : (
              <p className="text-sm font-medium text-green-700">
                You have applied for this job.
              </p>
            )}
          </div>
        )}

        {!user && job.is_active !== false && (
          <div className="mt-8 border-t border-slate-200 pt-8">
            <p className="text-sm text-slate-600">
              <Link href="/login" className="text-brand-600 hover:underline">
                Log in
              </Link>{" "}
              as a job seeker to apply or save this job.
            </p>
          </div>
        )}

        {actionMessage && (
          <p className="mt-4 text-sm text-slate-600">{actionMessage}</p>
        )}
      </article>
    </div>
  );
}
