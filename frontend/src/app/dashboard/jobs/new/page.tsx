"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  createCompany,
  createJob,
  getMyCompanies,
} from "@/lib/api";
import { ApiError } from "@/lib/api";
import {
  EXPERIENCE_OPTIONS,
  JOB_TYPE_OPTIONS,
  type Company,
  type ExperienceLevel,
  type JobType,
} from "@/types";

export default function NewJobPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    salary: "",
    location: "",
    job_type: "full_time" as JobType,
    experience_level: "mid" as ExperienceLevel,
    company_id: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
    if (!authLoading && user && user.role !== "recruiter") {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== "recruiter") return;
    getMyCompanies()
      .then((data) => {
        setCompanies(data.results);
        if (data.results.length === 1) {
          setForm((f) => ({ ...f, company_id: String(data.results[0].id) }));
        }
      })
      .catch((err: Error) => setError(err.message));
  }, [user]);

  const handleCreateCompany = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const company = await createCompany({ name: companyName });
      setCompanies((prev) => [...prev, company]);
      setForm((f) => ({ ...f, company_id: String(company.id) }));
      setShowCompanyForm(false);
      setCompanyName("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create company.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createJob({
        title: form.title,
        description: form.description,
        salary: form.salary || undefined,
        location: form.location,
        job_type: form.job_type,
        experience_level: form.experience_level,
        company_id: Number(form.company_id),
      });
      router.push("/dashboard/jobs");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create job.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/dashboard/jobs" className="text-sm text-brand-600 hover:underline">
        ← My jobs
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Post a new job</h1>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {companies.length === 0 && !showCompanyForm && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          You need a company before posting jobs.{" "}
          <button
            type="button"
            onClick={() => setShowCompanyForm(true)}
            className="font-medium text-brand-600 hover:underline"
          >
            Create one now
          </button>
        </div>
      )}

      {showCompanyForm && (
        <form onSubmit={handleCreateCompany} className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">New company</h2>
          <input
            required
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">
              Create company
            </button>
            <button
              type="button"
              onClick={() => setShowCompanyForm(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="company_id" className="mb-1 block text-sm text-slate-600">
            Company
          </label>
          <div className="flex gap-2">
            <select
              id="company_id"
              required
              value={form.company_id}
              onChange={(e) => setForm({ ...form, company_id: e.target.value })}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowCompanyForm(true)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600"
            >
              + New
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="mb-1 block text-sm text-slate-600">
            Job title
          </label>
          <input
            id="title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="location" className="mb-1 block text-sm text-slate-600">
            Location
          </label>
          <input
            id="location"
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="job_type" className="mb-1 block text-sm text-slate-600">
              Job type
            </label>
            <select
              id="job_type"
              value={form.job_type}
              onChange={(e) =>
                setForm({ ...form, job_type: e.target.value as JobType })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {JOB_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="experience_level" className="mb-1 block text-sm text-slate-600">
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
          <label htmlFor="salary" className="mb-1 block text-sm text-slate-600">
            Salary (optional)
          </label>
          <input
            id="salary"
            type="number"
            min="0"
            value={form.salary}
            onChange={(e) => setForm({ ...form, salary: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm text-slate-600">
            Description
          </label>
          <textarea
            id="description"
            required
            rows={8}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || companies.length === 0}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? "Posting…" : "Post job"}
        </button>
      </form>
    </div>
  );
}
