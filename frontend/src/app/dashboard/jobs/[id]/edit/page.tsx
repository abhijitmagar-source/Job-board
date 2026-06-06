"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { JobCardSkeleton } from "@/components/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { ApiError, getJob, updateJob } from "@/lib/api";
import {
  CATEGORY_OPTIONS,
  EXPERIENCE_OPTIONS,
  JOB_TYPE_OPTIONS,
  type ExperienceLevel,
  type JobCategory,
  type JobType,
} from "@/types";

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    salary: "",
    location: "",
    skills: "",
    category: "engineering" as JobCategory,
    job_type: "full_time" as JobType,
    experience_level: "mid" as ExperienceLevel,
  });

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
    if (!authLoading && user && user.role !== "recruiter") {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== "recruiter") return;
    getJob(Number(id))
      .then((job) => {
        setForm({
          title: job.title,
          description: job.description,
          salary: job.salary ?? "",
          location: job.location,
          skills: job.skills ?? "",
          category: job.category,
          job_type: job.job_type,
          experience_level: job.experience_level,
        });
      })
      .catch((err: Error) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [user, id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateJob(Number(id), {
        title: form.title,
        description: form.description,
        salary: form.salary || undefined,
        skills: form.skills || undefined,
        location: form.location,
        category: form.category,
        job_type: form.job_type,
        experience_level: form.experience_level,
      });
      toast.success("Job updated!");
      router.push("/dashboard/jobs");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user || loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <JobCardSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/dashboard/jobs" className="text-sm text-brand-600 hover:underline">
        ← My jobs
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
        Edit job
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
            Job title
          </label>
          <input
            id="title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="location" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
            Location
          </label>
          <input
            id="location"
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="job_type" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
              Job type
            </label>
            <select
              id="job_type"
              value={form.job_type}
              onChange={(e) =>
                setForm({ ...form, job_type: e.target.value as JobType })
              }
              className="input"
            >
              {JOB_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="experience_level" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
              Experience
            </label>
            <select
              id="experience_level"
              value={form.experience_level}
              onChange={(e) =>
                setForm({
                  ...form,
                  experience_level: e.target.value as ExperienceLevel,
                })
              }
              className="input"
            >
              {EXPERIENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
            Category
          </label>
          <select
            id="category"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value as JobCategory })
            }
            className="input"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="skills" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
            Required skills
          </label>
          <input
            id="skills"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="salary" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
            Salary (optional)
          </label>
          <input
            id="salary"
            type="number"
            min="0"
            value={form.salary}
            onChange={(e) => setForm({ ...form, salary: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
            Description
          </label>
          <textarea
            id="description"
            required
            rows={8}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input"
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
