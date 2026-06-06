import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./auth-storage";
import type {
  AdminDashboard,
  Application,
  AuthTokens,
  CandidateDashboard,
  CandidateProfile,
  Company,
  Job,
  JobApplicant,
  JobFilters,
  PaginatedResponse,
  RecruiterDashboard,
  RecruiterProfile,
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

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh/`, {
            refresh,
          });
          setTokens(data.access, data.refresh ?? refresh);
          if (original.headers) {
            original.headers.Authorization = `Bearer ${data.access}`;
          }
          return client(original);
        } catch {
          clearTokens();
        }
      }
    }
    throw parseAxiosError(error);
  },
);

function parseAxiosError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const body = error.response?.data as Record<string, unknown> | undefined;
  let message = error.message || `API error: ${status}`;
  if (body) {
    if (typeof body.detail === "string") {
      message = body.detail;
    } else {
      const firstKey = Object.keys(body)[0];
      const val = body[firstKey];
      if (Array.isArray(val)) {
        message = `${firstKey}: ${val.join(", ")}`;
      }
    }
  }
  return new ApiError(message, status, body);
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
  const { data } = await client.post("/auth/login/", { email, password });
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
  const { data } = await client.post("/auth/register/", payload);
  setTokens(data.tokens.access, data.tokens.refresh);
  return data;
}

export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  if (refresh) {
    try {
      await client.post("/auth/logout/", { refresh });
    } catch {
      // still clear local tokens
    }
  }
  clearTokens();
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await client.get<User>("/auth/me/");
  return data;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await client.post("/auth/password-reset/", {
    email,
    reset_url: typeof window !== "undefined" ? `${window.location.origin}/reset-password` : "",
  });
}

export async function confirmPasswordReset(payload: {
  uid: string;
  token: string;
  new_password: string;
  new_password_confirm: string;
}): Promise<void> {
  await client.post("/auth/password-reset/confirm/", payload);
}

// --- Profile ---

export async function getProfile(): Promise<CandidateProfile | RecruiterProfile> {
  const { data } = await client.get("/auth/profile/me/");
  return data;
}

export async function updateProfile(
  payload: Partial<CandidateProfile & RecruiterProfile>,
): Promise<CandidateProfile | RecruiterProfile> {
  const { data } = await client.patch("/auth/profile/me/", payload);
  return data;
}

export async function uploadResume(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await client.post("/auth/upload/resume/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function uploadProfileImage(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await client.post("/auth/upload/profile-image/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// --- Dashboard ---

export async function getCandidateDashboard(): Promise<CandidateDashboard> {
  const { data } = await client.get("/auth/dashboard/candidate/");
  return data;
}

export async function getRecruiterDashboard(): Promise<RecruiterDashboard> {
  const { data } = await client.get("/auth/dashboard/recruiter/");
  return data;
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const { data } = await client.get("/auth/dashboard/admin/");
  return data;
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
    category: filters.category || undefined,
    company: filters.company,
    skills: filters.skills,
    salary_min: filters.salary_min,
    salary_max: filters.salary_max,
    is_featured: filters.is_featured,
    ordering: filters.ordering,
    page: filters.page,
    page_size: filters.page_size,
  });
  const { data } = await client.get<PaginatedResponse<Job>>(`/jobs/${query}`);
  return data;
}

export async function getMyJobs(page?: string): Promise<PaginatedResponse<Job>> {
  const query = buildQuery({ mine: "1", page });
  const { data } = await client.get<PaginatedResponse<Job>>(`/jobs/${query}`);
  return data;
}

export async function getJob(id: number): Promise<Job> {
  const { data } = await client.get<Job>(`/jobs/${id}/`);
  return data;
}

export async function createJob(payload: {
  title: string;
  description: string;
  salary?: string;
  skills?: string;
  location: string;
  category?: string;
  job_type: string;
  experience_level: string;
  company_id: number;
  is_featured?: boolean;
}): Promise<Job> {
  const { data } = await client.post<Job>("/jobs/", payload);
  return data;
}

export async function updateJob(
  id: number,
  payload: Partial<{
    title: string;
    description: string;
    salary: string;
    skills: string;
    location: string;
    category: string;
    job_type: string;
    experience_level: string;
    is_featured: boolean;
  }>,
): Promise<Job> {
  const { data } = await client.patch<Job>(`/jobs/${id}/`, payload);
  return data;
}

export async function deleteJob(id: number): Promise<void> {
  await client.delete(`/jobs/${id}/`);
}

// --- Companies ---

export async function getCompanies(
  page?: string,
): Promise<PaginatedResponse<Company>> {
  const query = buildQuery({ page });
  const { data } = await client.get<PaginatedResponse<Company>>(`/companies/${query}`);
  return data;
}

export async function getCompany(id: number): Promise<Company> {
  const { data } = await client.get<Company>(`/companies/${id}/`);
  return data;
}

export async function getMyCompanies(): Promise<PaginatedResponse<Company>> {
  const { data } = await client.get<PaginatedResponse<Company>>("/companies/?mine=1");
  return data;
}

export async function createCompany(payload: {
  name: string;
  website?: string;
  description?: string;
  location?: string;
}): Promise<Company> {
  const { data } = await client.post<Company>("/companies/", payload);
  return data;
}

export async function updateCompany(
  id: number,
  payload: Partial<Company>,
): Promise<Company> {
  const { data } = await client.patch<Company>(`/companies/${id}/`, payload);
  return data;
}

export async function uploadCompanyLogo(id: number, file: File): Promise<Company> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await client.post<Company>(`/companies/${id}/upload-logo/`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// --- Applications ---

export async function applyForJob(
  jobId: number,
  coverLetter: string,
  resumeUrl?: string,
): Promise<Application> {
  const { data } = await client.post<Application>("/applications/", {
    job_id: jobId,
    cover_letter: coverLetter,
    resume_url: resumeUrl,
  });
  return data;
}

export async function getMyApplications(
  status?: string,
): Promise<PaginatedResponse<Application>> {
  const query = buildQuery({ status });
  const { data } = await client.get<PaginatedResponse<Application>>(
    `/applications/me${query}`,
  );
  return data;
}

export async function getJobApplicants(
  jobId: number,
  status?: string,
): Promise<PaginatedResponse<JobApplicant>> {
  const query = buildQuery({ status });
  const { data } = await client.get<PaginatedResponse<JobApplicant>>(
    `/jobs/${jobId}/applicants${query}`,
  );
  return data;
}

export async function updateApplicationStatus(
  id: number,
  status: string,
): Promise<JobApplicant> {
  const { data } = await client.patch<JobApplicant>(`/applications/${id}/status/`, {
    status,
  });
  return data;
}

// --- Saved jobs ---

export async function getSavedJobs(): Promise<PaginatedResponse<SavedJob>> {
  const { data } = await client.get<PaginatedResponse<SavedJob>>("/saved-jobs/");
  return data;
}

export async function saveJob(jobId: number): Promise<SavedJob> {
  const { data } = await client.post<SavedJob>("/saved-jobs/", { job_id: jobId });
  return data;
}

export async function unsaveJob(savedJobId: number): Promise<void> {
  await client.delete(`/saved-jobs/${savedJobId}/`);
}

// --- Admin ---

export async function getAdminUsers(): Promise<PaginatedResponse<User>> {
  const { data } = await client.get("/auth/admin/users/");
  return data;
}

export async function getAdminCompanies(): Promise<PaginatedResponse<Company>> {
  const { data } = await client.get("/auth/admin/companies/");
  return data;
}

export async function getAdminJobs(): Promise<PaginatedResponse<Job>> {
  const { data } = await client.get("/auth/admin/jobs/");
  return data;
}

export async function getAdminApplications(): Promise<PaginatedResponse<Application>> {
  const { data } = await client.get("/auth/admin/applications/");
  return data;
}
