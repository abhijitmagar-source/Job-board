/**
 * Shared TypeScript types — aligned with Django serializers.
 */

export type UserRole = "recruiter" | "job_seeker";

export type JobType =
  | "full_time"
  | "part_time"
  | "contract"
  | "remote"
  | "hybrid";

export type ExperienceLevel = "entry" | "mid" | "senior" | "lead";

export type ApplicationStatus =
  | "pending"
  | "reviewed"
  | "shortlisted"
  | "rejected"
  | "hired";

export interface Profile {
  full_name: string;
  phone: string;
  resume_url: string;
  bio: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  date_joined?: string;
  profile?: Profile;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface Company {
  id: number;
  name: string;
  website: string;
  description: string;
  logo_url: string;
  owner_email?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  salary: string | null;
  location: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  is_active?: boolean;
  company: { id: number; name: string; logo_url?: string };
  posted_by_email?: string;
  is_saved?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Application {
  id: number;
  job: Job;
  status: ApplicationStatus;
  status_display: string;
  cover_letter: string;
  applied_at: string;
  updated_at: string;
}

export interface SavedJob {
  id: number;
  job: Job;
  saved_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface JobFilters {
  search?: string;
  location?: string;
  job_type?: JobType | "";
  experience_level?: ExperienceLevel | "";
  company?: string;
  salary_min?: string;
  salary_max?: string;
  ordering?: string;
  page?: string;
}

export const JOB_TYPE_OPTIONS: { value: JobType; label: string }[] = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

export const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "entry", label: "Entry" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

export const ORDERING_OPTIONS = [
  { value: "-created_at", label: "Newest first" },
  { value: "created_at", label: "Oldest first" },
  { value: "-salary", label: "Salary (high to low)" },
  { value: "salary", label: "Salary (low to high)" },
  { value: "title", label: "Title (A–Z)" },
];

export function formatSalary(salary: string | null): string {
  if (!salary) return "Salary not listed";
  const num = Number(salary);
  if (Number.isNaN(num)) return salary;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatLabel(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
