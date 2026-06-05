"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  count: number;
  pageSize?: number;
}

export function Pagination({ count, pageSize = 20 }: PaginationProps) {
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
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-sm text-slate-600">
        Page {currentPage} of {totalPages} · {count} jobs
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
