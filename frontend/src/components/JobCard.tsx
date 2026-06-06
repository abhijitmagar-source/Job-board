import Link from "next/link";
import type { Job } from "@/types";
import { formatDate, formatLabel, formatSalary } from "@/types";

interface JobCardProps {
  job: Job;
  showStatus?: boolean;
  showApply?: boolean;
}

export function JobCard({ job, showStatus, showApply }: JobCardProps) {
  return (
    <article className="card group p-5 transition hover:border-brand-500 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
          {job.company.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.company.logo_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-lg font-bold text-brand-600">
              {job.company.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                href={`/jobs/${job.id}`}
                className="text-lg font-semibold text-slate-900 group-hover:text-brand-600 dark:text-slate-100"
              >
                {job.title}
              </Link>
              <Link
                href={`/companies/${job.company.id}`}
                className="mt-0.5 block text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400"
              >
                {job.company.name}
              </Link>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {job.is_featured && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  Featured
                </span>
              )}
              {showStatus && job.is_active === false && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  Inactive
                </span>
              )}
              {job.is_saved && (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                  Saved
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
              {job.location}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
              {formatLabel(job.experience_level)}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
              {formatLabel(job.job_type)}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-brand-700 dark:text-brand-400">
              {formatSalary(job.salary)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Posted {formatDate(job.created_at)}
            </p>
          </div>

          {showApply && (
            <Link href={`/jobs/${job.id}`} className="btn-primary mt-4 inline-block">
              Apply
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
