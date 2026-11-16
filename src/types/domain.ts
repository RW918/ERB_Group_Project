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

export interface Application {
  id: number;
  user_id: number;
  company_id: number;
  position: string;
  status: Status;
  interview_date: Date | null;
  note: string | null;
  posting_url: string | null;
  location: string | null;
  salary: string | null;
  deadline: Date | null;
  created_at: Date;
}

/** An application joined with the labels the list view needs. */
export interface ApplicationRow extends Application {
  company_name: string;
  username: string;
}
