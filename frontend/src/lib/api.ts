import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./auth-storage";
import type {
  Application,
  AuthTokens,
  Company,
  Job,
  JobFilters,
  PaginatedResponse,
  SavedJob,
  User,
} from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseError(res: Response): Promise<ApiError> {
  let details: Record<string, unknown> | undefined;
  let message = `API error: ${res.status}`;
  try {
    const body = await res.json();
    details = body;
    if (typeof body.detail === "string") {
      message = body.detail;
    } else if (body.detail && Array.isArray(body.detail)) {
      message = body.detail.map(String).join(", ");
    } else {
      const firstKey = Object.keys(body)[0];
      if (firstKey && Array.isArray(body[firstKey])) {
        message = `${firstKey}: ${body[firstKey].join(", ")}`;
      }
    }
  } catch {
    // ignore JSON parse errors
  }
  return new ApiError(message, res.status, details);
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const res = await fetch(`${API_BASE}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = (await res.json()) as { access: string; refresh?: string };
  setTokens(data.access, data.refresh ?? refresh);
  return data.access;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (res.status === 401 && auth && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, {
        ...fetchOptions,
        headers,
      });
    }
  }

  if (!res.ok) {
    throw await parseError(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// --- Auth ---

export async function login(
  email: string,
  password: string,
): Promise<{ user: User; tokens: AuthTokens }> {
  const data = await apiFetch<{
    access: string;
    refresh: string;
    user: User;
  }>("/auth/login/", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });
  setTokens(data.access, data.refresh);
  return { user: data.user, tokens: { access: data.access, refresh: data.refresh } };
}

export async function register(payload: {
  email: string;
  password: string;
  password_confirm: string;
  role: string;
  full_name: string;
}): Promise<{ user: User; tokens: AuthTokens }> {
  const data = await apiFetch<{
    user: User;
    tokens: AuthTokens;
  }>("/auth/register/", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
  setTokens(data.tokens.access, data.tokens.refresh);
  return data;
}

export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  if (refresh) {
    try {
      await apiFetch("/auth/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
      });
    } catch {
      // still clear local tokens
    }
  }
  clearTokens();
}

export async function getCurrentUser(): Promise<User> {
  return apiFetch<User>("/auth/me/");
}

// --- Jobs ---

export async function getJobs(
  filters: JobFilters = {},
): Promise<PaginatedResponse<Job>> {
  const query = buildQuery({
    search: filters.search,
    location: filters.location,
    job_type: filters.job_type || undefined,
    experience_level: filters.experience_level || undefined,
    company: filters.company,
    salary_min: filters.salary_min,
    salary_max: filters.salary_max,
    ordering: filters.ordering,
    page: filters.page,
  });
  return apiFetch<PaginatedResponse<Job>>(`/jobs/${query}`);
}

export async function getMyJobs(
  page?: string,
): Promise<PaginatedResponse<Job>> {
  const query = buildQuery({ mine: "1", page });
  return apiFetch<PaginatedResponse<Job>>(`/jobs/${query}`);
}

export async function getJob(id: number): Promise<Job> {
  return apiFetch<Job>(`/jobs/${id}/`, { auth: false });
}

export async function createJob(payload: {
  title: string;
  description: string;
  salary?: string;
  location: string;
  job_type: string;
  experience_level: string;
  company_id: number;
}): Promise<Job> {
  return apiFetch<Job>("/jobs/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteJob(id: number): Promise<void> {
  return apiFetch<void>(`/jobs/${id}/`, { method: "DELETE" });
}

// --- Companies ---

export async function getMyCompanies(): Promise<PaginatedResponse<Company>> {
  return apiFetch<PaginatedResponse<Company>>("/companies/?mine=1");
}

export async function createCompany(payload: {
  name: string;
  website?: string;
  description?: string;
}): Promise<Company> {
  return apiFetch<Company>("/companies/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// --- Applications ---

export async function applyForJob(
  jobId: number,
  coverLetter: string,
): Promise<Application> {
  return apiFetch<Application>("/applications/", {
    method: "POST",
    body: JSON.stringify({ job_id: jobId, cover_letter: coverLetter }),
  });
}

export async function getMyApplications(): Promise<
  PaginatedResponse<Application>
> {
  return apiFetch<PaginatedResponse<Application>>("/applications/me/");
}

// --- Saved jobs ---

export async function getSavedJobs(): Promise<PaginatedResponse<SavedJob>> {
  return apiFetch<PaginatedResponse<SavedJob>>("/saved-jobs/");
}

export async function saveJob(jobId: number): Promise<SavedJob> {
  return apiFetch<SavedJob>("/saved-jobs/", {
    method: "POST",
    body: JSON.stringify({ job_id: jobId }),
  });
}

export async function unsaveJob(savedJobId: number): Promise<void> {
  return apiFetch<void>(`/saved-jobs/${savedJobId}/`, { method: "DELETE" });
}
