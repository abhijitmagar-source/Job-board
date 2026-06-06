"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  ApiError,
  getProfile,
  updateProfile,
  uploadProfileImage,
  uploadResume,
} from "@/lib/api";
import type { CandidateProfile, RecruiterProfile } from "@/types";

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | RecruiterProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user?.role === "admin") router.replace("/admin");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getProfile()
      .then(setProfile)
      .catch(() => toast.error("Failed to load profile."))
      .finally(() => setPageLoading(false));
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await updateProfile(profile);
      setProfile(updated);
      await refreshUser();
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "resume" | "image",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (type === "resume") {
        const result = await uploadResume(file);
        setProfile((p) => p && { ...p, resume_url: result.url });
        toast.success("Resume uploaded!");
      } else {
        const result = await uploadProfileImage(file);
        setProfile((p) => p && { ...p, profile_image_url: result.url });
        toast.success("Profile image uploaded!");
      }
      await refreshUser();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed.");
    }
  };

  if (loading || pageLoading || !user || !profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center text-slate-500">
        Loading profile…
      </div>
    );
  }

  const isCandidate = user.role === "candidate";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">My Profile</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{user.email}</p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-5 p-6">
        {isCandidate ? (
          <>
            <Field
              label="Full name"
              value={(profile as CandidateProfile).full_name}
              onChange={(v) => setProfile({ ...profile, full_name: v } as CandidateProfile)}
            />
            <Field
              label="Phone"
              value={(profile as CandidateProfile).phone}
              onChange={(v) => setProfile({ ...profile, phone: v } as CandidateProfile)}
            />
            <Field
              label="Skills"
              value={(profile as CandidateProfile).skills}
              onChange={(v) => setProfile({ ...profile, skills: v } as CandidateProfile)}
              placeholder="Python, React, SQL…"
            />
            <TextArea
              label="Experience"
              value={(profile as CandidateProfile).experience}
              onChange={(v) => setProfile({ ...profile, experience: v } as CandidateProfile)}
            />
            <TextArea
              label="Education"
              value={(profile as CandidateProfile).education}
              onChange={(v) => setProfile({ ...profile, education: v } as CandidateProfile)}
            />
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
                Resume
              </label>
              {(profile as CandidateProfile).resume_url && (
                <a
                  href={(profile as CandidateProfile).resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-600 hover:underline"
                >
                  View current resume
                </a>
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileUpload(e, "resume")}
                className="mt-2 block w-full text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
                Profile image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "image")}
                className="block w-full text-sm"
              />
            </div>
          </>
        ) : (
          <>
            <Field
              label="Name"
              value={(profile as RecruiterProfile).name}
              onChange={(v) => setProfile({ ...profile, name: v } as RecruiterProfile)}
            />
            <Field
              label="Company"
              value={(profile as RecruiterProfile).company}
              onChange={(v) => setProfile({ ...profile, company: v } as RecruiterProfile)}
            />
            <Field
              label="Position"
              value={(profile as RecruiterProfile).position}
              onChange={(v) => setProfile({ ...profile, position: v } as RecruiterProfile)}
            />
            <Field
              label="Phone"
              value={(profile as RecruiterProfile).phone}
              onChange={(v) => setProfile({ ...profile, phone: v } as RecruiterProfile)}
            />
          </>
        )}

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">{label}</label>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </div>
  );
}
