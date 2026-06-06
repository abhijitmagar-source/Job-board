"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  count: number;
  pageSize?: number;
  basePath?: string;
}

export function Pagination({ count, pageSize = 20, basePath = "/jobs" }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? "1");
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Page {currentPage} of {totalPages} · {count} results
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
