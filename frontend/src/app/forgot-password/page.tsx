"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { ApiError, requestPasswordReset } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
      toast.success("If an account exists, a reset link has been sent.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Reset password
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {sent ? (
        <div className="card mt-8 p-6 text-center">
          <p className="text-slate-700 dark:text-slate-300">
            Check your email for a password reset link.
          </p>
          <Link href="/login" className="mt-4 inline-block text-brand-600 hover:underline">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card mt-8 space-y-4 p-6">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Sending…" : "Send reset link"}
          </button>
          <Link href="/login" className="block text-center text-sm text-brand-600 hover:underline">
            Back to login
          </Link>
        </form>
      )}
    </div>
  );
}
