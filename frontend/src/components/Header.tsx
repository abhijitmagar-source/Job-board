"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navLink =
  "text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors";

export function Header() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-brand-700">
          Job Board
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/jobs"
            className={`${navLink} ${pathname.startsWith("/jobs") ? "text-brand-600" : ""}`}
          >
            Browse Jobs
          </Link>

          {!loading && user && (
            <Link
              href="/dashboard"
              className={`${navLink} ${pathname.startsWith("/dashboard") ? "text-brand-600" : ""}`}
            >
              Dashboard
            </Link>
          )}

          {!loading && !user && (
            <>
              <Link href="/login" className={navLink}>
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Sign up
              </Link>
            </>
          )}

          {!loading && user && (
            <div className="flex items-center gap-4">
              <span className="hidden text-sm text-slate-500 sm:inline">
                {user.profile?.full_name ?? user.email}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="text-sm font-medium text-slate-600 hover:text-red-600"
              >
                Log out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
