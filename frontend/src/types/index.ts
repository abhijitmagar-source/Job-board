/**
 * Shared TypeScript types — aligned with Django serializers.
 */

export type UserRole = "candidate" | "recruiter" | "admin";

export type JobType =
  | "full_time"
  | "part_time"
  | "contract"
  | "remote"
  | "hybrid";

export type ExperienceLevel = "entry" | "mid" | "senior" | "lead";

export type JobCategory =
  | "engineering"
  | "design"
  | "product"
  | "marketing"
  | "sales"
  | "operations"
  | "finance"
  | "hr"
  | "other";

export type ApplicationStatus =
  | "pending"
  | "reviewed"
  | "shortlisted"
  | "rejected"
  | "hired";

export interface CandidateProfile {
  full_name: string;
  phone: string;
  skills: string;
  experience: string;
  education: string;
  resume_url: string;
  profile_image_url: string;
  updated_at: string;
}

export interface RecruiterProfile {
  name: string;
  company: string;
  position: string;
  phone: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  is_active?: boolean;
  date_joined?: string;
  candidate_profile?: CandidateProfile;
  recruiter_profile?: RecruiterProfile;
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
  location: string;
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
  skills: string;
  location: string;
  category: JobCategory;
  job_type: JobType;
  experience_level: ExperienceLevel;
  is_featured?: boolean;
  is_active?: boolean;
  company: { id: number; name: string; logo_url?: string; location?: string };
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
  resume_url: string;
  applied_at: string;
  updated_at: string;
}

export interface JobApplicant {
  id: number;
  applicant: {
    id: number;
    email: string;
    candidate_profile?: CandidateProfile;
  };
  status: ApplicationStatus;
  status_display: string;
  cover_letter: string;
  resume_url: string;
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
  category?: JobCategory | "";
  company?: string;
  skills?: string;
  salary_min?: string;
  salary_max?: string;
  is_featured?: string;
  ordering?: string;
  page?: string;
  page_size?: string;
}

export interface CandidateDashboard {
  applications_total: number;
  applications_pending: number;
  applications_shortlisted: number;
  saved_jobs_count: number;
  recent_applications: Array<{
    id: number;
    status: string;
    applied_at: string;
    job__title: string;
    job__company__name: string;
  }>;
}

export interface RecruiterDashboard {
  jobs_total: number;
  jobs_active: number;
  companies_count: number;
  applicants_total: number;
  applicants_pending: number;
  recent_applications: Array<{
    id: number;
    status: string;
    applied_at: string;
    job__title: string;
    applicant__email: string;
  }>;
}

export interface AdminDashboard {
  users_total: number;
  candidates_count: number;
  recruiters_count: number;
  companies_count: number;
  jobs_total: number;
  jobs_active: number;
  applications_total: number;
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

export const CATEGORY_OPTIONS: { value: JobCategory; label: string }[] = [
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "product", label: "Product" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "operations", label: "Operations" },
  { value: "finance", label: "Finance" },
  { value: "hr", label: "Human Resources" },
  { value: "other", label: "Other" },
];

export const ORDERING_OPTIONS = [
  { value: "-created_at", label: "Newest first" },
  { value: "created_at", label: "Oldest first" },
  { value: "-salary", label: "Salary (high to low)" },
  { value: "salary", label: "Salary (low to high)" },
  { value: "title", label: "Title (A–Z)" },
];

export const APPLICATION_STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" },
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

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function getUserDisplayName(user: User): string {
  if (user.role === "recruiter") {
    return user.recruiter_profile?.name ?? user.email;
  }
  return user.candidate_profile?.full_name ?? user.email;
}
