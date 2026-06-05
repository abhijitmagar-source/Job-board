/**
 * Shared TypeScript types — aligned with Django serializers (Phases 2–5).
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

export interface User {
  id: number;
  email: string;
  role: UserRole;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  salary: string | null;
  location: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  company: { id: number; name: string };
  created_at: string;
}
