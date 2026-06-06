"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { getUserDisplayName } from "@/types";

const navLink =
  "text-sm font-medium text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400";

export function Header() {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) =>
    pathname.startsWith(path) ? "text-brand-600 dark:text-brand-400" : "";

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-brand-700 dark:text-brand-400">
          JobBoard
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/jobs" className={`${navLink} ${isActive("/jobs")}`}>
            Browse Jobs
          </Link>

          {!loading && user && (
            <Link href="/dashboard" className={`${navLink} ${isActive("/dashboard")}`}>
              Dashboard
            </Link>
          )}

          {!loading && user?.role === "admin" && (
            <Link href="/admin" className={`${navLink} ${isActive("/admin")}`}>
              Admin
            </Link>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {!loading && !user && (
            <>
              <Link href="/login" className={navLink}>
                Log in
              </Link>
              <Link href="/register" className="btn-primary">
                Sign up
              </Link>
            </>
          )}

          {!loading && user && (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/profile"
                className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400"
              >
                {getUserDisplayName(user)}
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="text-sm font-medium text-slate-600 hover:text-red-600 dark:text-slate-300"
              >
                Log out
              </button>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-slate-200 px-4 py-4 md:hidden dark:border-slate-700">
          <div className="flex flex-col gap-3">
            <Link href="/jobs" onClick={closeMenu} className={navLink}>
              Browse Jobs
            </Link>
            {!loading && user && (
              <Link href="/dashboard" onClick={closeMenu} className={navLink}>
                Dashboard
              </Link>
            )}
            {!loading && user?.role === "admin" && (
              <Link href="/admin" onClick={closeMenu} className={navLink}>
                Admin
              </Link>
            )}
            {!loading && !user && (
              <>
                <Link href="/login" onClick={closeMenu} className={navLink}>
                  Log in
                </Link>
                <Link href="/register" onClick={closeMenu} className="btn-primary text-center">
                  Sign up
                </Link>
              </>
            )}
            {!loading && user && (
              <>
                <Link href="/dashboard/profile" onClick={closeMenu} className={navLink}>
                  {getUserDisplayName(user)}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                  className="text-left text-sm font-medium text-red-600"
                >
                  Log out
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
