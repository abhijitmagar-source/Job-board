"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { toast } from "sonner";
import { ApiError, confirmPasswordReset } from "@/lib/api";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await confirmPasswordReset({
        uid,
        token,
        new_password: password,
        new_password_confirm: confirm,
      });
      toast.success("Password reset successfully!");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Reset failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!uid || !token) {
    return (
      <div className="card p-6 text-center">
        <p className="text-red-600">Invalid reset link.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-brand-600 hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <div>
        <label htmlFor="password" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
          New password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="input"
        />
      </div>
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Set new password
      </h1>
      <Suspense fallback={<p className="mt-8 text-slate-500">Loading…</p>}>
        <div className="mt-8">
          <ResetForm />
        </div>
      </Suspense>
    </div>
  );
}
