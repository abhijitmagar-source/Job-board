import Link from "next/link";
import type { Job } from "@/types";
import { formatLabel, formatSalary } from "@/types";

interface JobCardProps {
  job: Job;
  showStatus?: boolean;
}

export function JobCard({ job, showStatus }: JobCardProps) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-500 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{job.company.name}</p>
        </div>
        {showStatus && job.is_active === false && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            Inactive
          </span>
        )}
        {job.is_saved && (
          <span className="shrink-0 rounded-full bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
            Saved
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
          {job.location}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
          {formatLabel(job.job_type)}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
          {formatLabel(job.experience_level)}
        </span>
      </div>

      <p className="mt-3 text-sm font-medium text-brand-700">
        {formatSalary(job.salary)}
      </p>
    </Link>
  );
}
