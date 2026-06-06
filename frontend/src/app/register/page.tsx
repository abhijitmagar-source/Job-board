"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
function RegisterForm() {
  const { register, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  type RegisterRole = "candidate" | "recruiter";
  const initialRole: RegisterRole =
    roleParam === "recruiter" ? "recruiter" : "candidate";

  const [form, setForm] = useState<{
    email: string;
    password: string;
    password_confirm: string;
    full_name: string;
    role: RegisterRole;
  }>({
    email: "",
    password: "",
    password_confirm: "",
    full_name: "",
    role: initialRole,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  if (user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await register(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create account</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-600 hover:underline">
          Log in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4 p-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="full_name" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
            Full name
          </label>
          <input
            id="full_name"
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="role" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
            I am a
          </label>
          <select
            id="role"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value as RegisterRole })
            }
            className="input"
          >
            <option value="candidate">Candidate</option>
            <option value="recruiter">Recruiter</option>
          </select>
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="password_confirm" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
            Confirm password
          </label>
          <input
            id="password_confirm"
            type="password"
            required
            minLength={8}
            value={form.password_confirm}
            onChange={(e) => setForm({ ...form, password_confirm: e.target.value })}
            className="input"
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Creating account…" : "Sign up"}
        </button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="px-4 py-12 text-center text-slate-500">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
