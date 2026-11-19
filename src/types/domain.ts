export const STATUSES = ["applied", "interviewing", "offer", "rejected"] as const;

export type Status = (typeof STATUSES)[number];

export interface Role {
  id: number;
  name: "user" | "admin";
  can_view_all_applications: boolean;
  can_manage_users: boolean;
}

export interface User {
  id: number;
  username: string;
  password_hash: string;
  role_id: number;
  created_at: Date;
}

export interface Company {
  id: number;
  name: string;
  created_at: Date;
}

export interface Job {
  id: number;
  company_id: number;
  title: string;
  posting_url: string | null;
  location: string | null;
  salary: string | null;
  deadline: string | null;
  created_at: Date;
}

export interface Application {
  id: number;
  user_id: number;
  job_id: number;
  status: Status;
  interview_date: string | null;
  note: string | null;
  created_at: Date;
  updated_at: Date;
}

/** An application joined with everything the list and detail views render. */
export interface ApplicationRow extends Application {
  company_id: number;
  company_name: string;
  title: string;
  posting_url: string | null;
  location: string | null;
  salary: string | null;
  deadline: string | null;
  owner_username: string;
}

/** One validated application form submission (all strings trimmed, dates ISO). */
export interface ApplicationInput {
  company: string;
  title: string;
  status: Status;
  interview_date: string | null;
  note: string | null;
  posting_url: string | null;
  location: string | null;
  salary: string | null;
  deadline: string | null;
}
