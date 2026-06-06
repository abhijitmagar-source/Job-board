"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/context/AuthContext";
import {
  ApiError,
  createCompany,
  getMyCompanies,
  updateCompany,
  uploadCompanyLogo,
} from "@/lib/api";
import type { Company } from "@/types";

export default function CompaniesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", website: "", description: "", location: "" });

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
    if (!authLoading && user && user.role !== "recruiter") {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== "recruiter") return;
    getMyCompanies()
      .then((data) => setCompanies(data.results))
      .catch(() => toast.error("Failed to load companies."))
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const company = await createCompany(form);
      setCompanies((prev) => [...prev, company]);
      setForm({ name: "", website: "", description: "", location: "" });
      setShowForm(false);
      toast.success("Company created!");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Create failed.");
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const updated = await updateCompany(editingId, form);
      setCompanies((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
      setEditingId(null);
      setForm({ name: "", website: "", description: "", location: "" });
      toast.success("Company updated!");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed.");
    }
  };

  const startEdit = (company: Company) => {
    setEditingId(company.id);
    setShowForm(false);
    setForm({
      name: company.name,
      website: company.website ?? "",
      description: company.description ?? "",
      location: company.location ?? "",
    });
  };

  const handleLogoUpload = async (companyId: number, file: File) => {
    try {
      const updated = await uploadCompanyLogo(companyId, file);
      setCompanies((prev) => prev.map((c) => (c.id === companyId ? updated : c)));
      toast.success("Logo uploaded!");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed.");
    }
  };

  if (authLoading || loading) {
    return <div className="mx-auto max-w-4xl px-4 py-12 text-center text-slate-500">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">My Companies</h1>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancel" : "Add company"}
        </button>
      </div>

      {editingId && (
        <form onSubmit={handleUpdate} className="card mt-6 space-y-4 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Edit company</h2>
          <input
            required
            placeholder="Company name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
          <input
            placeholder="Website"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="input"
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input"
            rows={3}
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              Save changes
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ name: "", website: "", description: "", location: "" });
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="card mt-6 space-y-4 p-6">
          <input
            required
            placeholder="Company name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
          <input
            placeholder="Website"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="input"
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input"
            rows={3}
          />
          <button type="submit" className="btn-primary">
            Create company
          </button>
        </form>
      )}

      <div className="mt-8 space-y-4">
        {companies.length === 0 ? (
          <EmptyState
            title="No companies yet"
            description="Create a company to start posting jobs."
          />
        ) : (
          companies.map((company) => (
            <div key={company.id} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
                  {company.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-brand-600">
                      {company.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/companies/${company.id}`}
                    className="text-lg font-semibold text-slate-900 hover:text-brand-600 dark:text-slate-100"
                  >
                    {company.name}
                  </Link>
                  {company.location && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">{company.location}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => startEdit(company)}
                      className="text-sm text-brand-600 hover:underline"
                    >
                      Edit details
                    </button>
                    <label className="cursor-pointer text-sm text-brand-600 hover:underline">
                      Upload logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(company.id, file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
