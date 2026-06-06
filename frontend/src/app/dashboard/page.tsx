"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardSkeleton } from "@/components/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  getAdminDashboard,
  getCandidateDashboard,
  getRecruiterDashboard,
} from "@/lib/api";
import { getUserDisplayName } from "@/types";
import type { AdminDashboard, CandidateDashboard, RecruiterDashboard } from "@/types";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<
    CandidateDashboard | RecruiterDashboard | AdminDashboard | null
  >(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const fetcher =
      user.role === "recruiter"
        ? getRecruiterDashboard
        : user.role === "admin"
          ? getAdminDashboard
          : getCandidateDashboard;
    fetcher()
      .then(setStats)
      .catch(() => toast.error("Failed to load dashboard stats."))
      .finally(() => setStatsLoading(false));
  }, [user]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  const isRecruiter = user.role === "recruiter";
  const isAdmin = user.role === "admin";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Welcome back, {getUserDisplayName(user)}
      </p>

      {!statsLoading && stats && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isRecruiter && "applicants_total" in stats && (
            <>
              <StatCard label="Total jobs" value={(stats as RecruiterDashboard).jobs_total} />
              <StatCard label="Active jobs" value={(stats as RecruiterDashboard).jobs_active} />
              <StatCard label="Companies" value={(stats as RecruiterDashboard).companies_count} />
              <StatCard label="Applicants" value={(stats as RecruiterDashboard).applicants_total} />
            </>
          )}
          {!isRecruiter && !isAdmin && "applications_pending" in stats && (
            <>
              <StatCard label="Applications" value={(stats as CandidateDashboard).applications_total} />
              <StatCard label="Pending" value={(stats as CandidateDashboard).applications_pending} />
              <StatCard label="Shortlisted" value={(stats as CandidateDashboard).applications_shortlisted} />
              <StatCard label="Saved jobs" value={(stats as CandidateDashboard).saved_jobs_count} />
            </>
          )}
          {isAdmin && "users_total" in stats && (
            <>
              <StatCard label="Users" value={(stats as AdminDashboard).users_total} />
              <StatCard label="Jobs" value={(stats as AdminDashboard).jobs_total} />
              <StatCard label="Companies" value={(stats as AdminDashboard).companies_count} />
              <StatCard label="Applications" value={(stats as AdminDashboard).applications_total} />
            </>
          )}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {isAdmin ? (
          <DashboardCard
            title="Admin panel"
            description="Manage users, companies, jobs, and applications."
            href="/admin"
          />
        ) : isRecruiter ? (
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
            <DashboardCard
              title="Manage companies"
              description="Update company profiles and logos."
              href="/dashboard/companies"
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
            <DashboardCard
              title="My profile"
              description="Update resume, skills, and contact info."
              href="/dashboard/profile"
            />
          </>
        )}
        <DashboardCard
          title="Browse jobs"
          description="Search and filter open roles."
          href="/jobs"
        />
      </div>

      {!statsLoading && stats && "recent_applications" in stats && stats.recent_applications.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Recent activity
          </h2>
          <div className="mt-4 space-y-3">
            {stats.recent_applications.map((app) => (
              <div key={app.id} className="card p-4 text-sm">
                <p className="text-slate-700 dark:text-slate-300">
                  <span className="font-medium">{app.job__title}</span>
                  {"job__company__name" in app && (
                    <>
                      {" at "}
                      {app.job__company__name}
                    </>
                  )}
                  {"applicant__email" in app && (
                    <>
                      {" — applicant "}
                      {app.applicant__email}
                    </>
                  )}
                  <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                    {app.status}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-6">
      <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-brand-600 dark:text-brand-400">{value}</p>
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
      className="card p-6 transition hover:border-brand-500 hover:shadow-md"
    >
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </Link>
  );
}