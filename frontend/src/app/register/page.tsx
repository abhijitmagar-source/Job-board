"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import type { UserRole } from "@/types";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirm: "",
    full_name: "",
    role: "job_seeker" as UserRole,
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
      <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-600 hover:underline">
          Log in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="full_name" className="mb-1 block text-sm text-slate-600">
            Full name
          </label>
          <input
            id="full_name"
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-slate-600">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label htmlFor="role" className="mb-1 block text-sm text-slate-600">
            I am a
          </label>
          <select
            id="role"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value as UserRole })
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="job_seeker">Job seeker</option>
            <option value="recruiter">Recruiter</option>
          </select>
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-slate-600">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label
            htmlFor="password_confirm"
            className="mb-1 block text-sm text-slate-600"
          >
            Confirm password
          </label>
          <input
            id="password_confirm"
            type="password"
            required
            minLength={8}
            value={form.password_confirm}
            onChange={(e) =>
              setForm({ ...form, password_confirm: e.target.value })
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Sign up"}
        </button>
      </form>
    </div>
  );
}
