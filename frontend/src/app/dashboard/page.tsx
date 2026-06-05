"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center text-slate-500">
        Loading…
      </div>
    );
  }

  const isRecruiter = user.role === "recruiter";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Welcome back, {user.profile?.full_name ?? user.email}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {isRecruiter ? (
          <>
            <DashboardCard
              title="My job postings"
              description="View and manage jobs you've posted."
              href="/dashboard/jobs"
            />
            <DashboardCard
              title="Post a new job"
              description="Create a listing for one of your companies."
              href="/dashboard/jobs/new"
            />
          </>
        ) : (
          <>
            <DashboardCard
              title="My applications"
              description="Track jobs you've applied to."
              href="/dashboard/applications"
            />
            <DashboardCard
              title="Saved jobs"
              description="Jobs you've bookmarked for later."
              href="/dashboard/saved"
            />
          </>
        )}
        <DashboardCard
          title="Browse jobs"
          description="Search and filter open roles."
          href="/jobs"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-500 hover:shadow-md"
    >
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </Link>
  );
}
