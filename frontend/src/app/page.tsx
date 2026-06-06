"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { JobCard } from "@/components/JobCard";
import { JobCardSkeleton } from "@/components/Skeleton";
import { getJobs } from "@/lib/api";
import type { Job } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [featured, setFeatured] = useState<Job[]>([]);
  const [latest, setLatest] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    Promise.all([
      getJobs({ is_featured: "true", page_size: "4" }),
      getJobs({ page_size: "6", ordering: "-created_at" }),
    ])
      .then(([featuredData, latestData]) => {
        setFeatured(featuredData.results);
        setLatest(latestData.results);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (location) params.set("location", location);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-4 py-20 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-200">
            Your career, elevated
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Discover roles at companies that matter
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-brand-100">
            Search thousands of curated opportunities. Apply in seconds. Track
            every application from one dashboard.
          </p>

          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-xl sm:flex-row"
          >
            <input
              type="search"
              placeholder="Job title, skills, or company"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-xl border-0 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="sm:w-40 rounded-xl border-0 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-8 py-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Search jobs
            </button>
          </form>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/jobs" className="btn-secondary !border-white/30 !bg-white/10 !text-white hover:!bg-white/20">
              Browse all jobs
            </Link>
            <Link href="/register" className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
              Create free account
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-white py-10 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-8 px-4 text-center">
          {[
            { label: "Open roles", value: "500+" },
            { label: "Companies", value: "120+" },
            { label: "Hires made", value: "2,400+" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Featured jobs
            </h2>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Hand-picked opportunities from top employers
            </p>
          </div>
          <Link href="/jobs?is_featured=true" className="text-sm font-medium text-brand-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)
            : featured.length > 0
              ? featured.map((job) => <JobCard key={job.id} job={job} showApply />)
              : latest.slice(0, 4).map((job) => <JobCard key={job.id} job={job} showApply />)}
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="bg-slate-50 py-16 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Latest openings
              </h2>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Fresh roles posted this week
              </p>
            </div>
            <Link href="/jobs" className="text-sm font-medium text-brand-600 hover:underline">
              See more →
            </Link>
          </div>
          <div className="space-y-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)
              : latest.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <FeatureCard
            title="For candidates"
            description="Build your profile, upload your resume, and apply to roles that match your skills."
            items={["Smart search & filters", "One-click apply", "Application tracking", "Save jobs for later"]}
            cta="Join as candidate"
            href="/register"
          />
          <FeatureCard
            title="For recruiters"
            description="Post jobs, manage your company profile, and review applicants with full visibility."
            items={["Post & manage jobs", "Applicant tracking", "Status management", "Company branding"]}
            cta="Join as recruiter"
            href="/register"
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  items,
  cta,
  href,
}: {
  title: string;
  description: string;
  items: string[];
  cta: string;
  href: string;
}) {
  return (
    <div className="card p-8">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{description}</p>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <span className="text-brand-600">✓</span>
            {item}
          </li>
        ))}
      </ul>
      <Link href={href} className="btn-primary mt-6 inline-block">
        {cta}
      </Link>
    </div>
  );
}
