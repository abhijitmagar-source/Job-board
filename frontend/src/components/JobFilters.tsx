"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import {
  EXPERIENCE_OPTIONS,
  JOB_TYPE_OPTIONS,
  ORDERING_OPTIONS,
  type JobFilters,
} from "@/types";

export function JobFiltersPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const current: JobFilters = {
    search: searchParams.get("search") ?? "",
    location: searchParams.get("location") ?? "",
    job_type: (searchParams.get("job_type") ?? "") as JobFilters["job_type"],
    experience_level: (searchParams.get("experience_level") ??
      "") as JobFilters["experience_level"],
    salary_min: searchParams.get("salary_min") ?? "",
    salary_max: searchParams.get("salary_max") ?? "",
    ordering: searchParams.get("ordering") ?? "-created_at",
  };

  const [draft, setDraft] = useState(current);

  const applyFilters = useCallback(
    (overrides: Partial<JobFilters> = {}) => {
      const next = { ...draft, ...overrides };
      const params = new URLSearchParams();
      if (next.search) params.set("search", next.search);
      if (next.location) params.set("location", next.location);
      if (next.job_type) params.set("job_type", next.job_type);
      if (next.experience_level)
        params.set("experience_level", next.experience_level);
      if (next.salary_min) params.set("salary_min", next.salary_min);
      if (next.salary_max) params.set("salary_max", next.salary_max);
      if (next.ordering && next.ordering !== "-created_at") {
        params.set("ordering", next.ordering);
      }
      router.push(`/jobs?${params.toString()}`);
    },
    [draft, router],
  );

  const clearFilters = () => {
    setDraft({
      search: "",
      location: "",
      job_type: "",
      experience_level: "",
      salary_min: "",
      salary_max: "",
      ordering: "-created_at",
    });
    router.push("/jobs");
  };

  return (
    <form
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        applyFilters();
      }}
    >
      <h2 className="text-lg font-semibold text-slate-900">Search & Filter</h2>

      <div>
        <label htmlFor="search" className="mb-1 block text-sm text-slate-600">
          Keywords
        </label>
        <input
          id="search"
          type="search"
          placeholder="Title, company, location…"
          value={draft.search}
          onChange={(e) => setDraft({ ...draft, search: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div>
        <label htmlFor="location" className="mb-1 block text-sm text-slate-600">
          Location
        </label>
        <input
          id="location"
          type="text"
          placeholder="City or region"
          value={draft.location}
          onChange={(e) => setDraft({ ...draft, location: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="job_type" className="mb-1 block text-sm text-slate-600">
            Job type
          </label>
          <select
            id="job_type"
            value={draft.job_type}
            onChange={(e) =>
              setDraft({
                ...draft,
                job_type: e.target.value as JobFilters["job_type"],
              })
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Any</option>
            {JOB_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="experience_level"
            className="mb-1 block text-sm text-slate-600"
          >
            Experience
          </label>
          <select
            id="experience_level"
            value={draft.experience_level}
            onChange={(e) =>
              setDraft({
                ...draft,
                experience_level: e.target.value as JobFilters["experience_level"],
              })
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Any</option>
            {EXPERIENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="salary_min" className="mb-1 block text-sm text-slate-600">
            Min salary
          </label>
          <input
            id="salary_min"
            type="number"
            min="0"
            placeholder="50000"
            value={draft.salary_min}
            onChange={(e) =>
              setDraft({ ...draft, salary_min: e.target.value })
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="salary_max" className="mb-1 block text-sm text-slate-600">
            Max salary
          </label>
          <input
            id="salary_max"
            type="number"
            min="0"
            placeholder="150000"
            value={draft.salary_max}
            onChange={(e) =>
              setDraft({ ...draft, salary_max: e.target.value })
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="ordering" className="mb-1 block text-sm text-slate-600">
          Sort by
        </label>
        <select
          id="ordering"
          value={draft.ordering}
          onChange={(e) => {
            const ordering = e.target.value;
            setDraft({ ...draft, ordering });
            applyFilters({ ordering });
          }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {ORDERING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
