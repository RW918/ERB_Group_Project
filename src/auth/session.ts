import type { Role } from "../types/domain.js";
import { db } from "../db/client.js";

/**
 * The user object the session carries. Deserialized fresh on every request, so
 * a permission change on /admin/users takes effect on the visitor's next
 * request without a re-login (the "grant" requirement).
 */
export interface SessionUser {
  id: number;
  username: string;
  role: Role["name"];
  initial: string;
  /** Effective permissions: per-user override first, role default otherwise. */
  can_view_all_applications: boolean;
  can_manage_users: boolean;
}

/** Permission names the guard middleware accepts. */
export type Permission = "can_view_all_applications" | "can_manage_users";

interface UserRow {
  id: number;
  username: string;
  role: Role["name"];
  can_view_all_applications: boolean;
  can_manage_users: boolean;
}

/** The effective-permission read lives in one query so every caller agrees. */
const SELECT_SESSION_USER = (where: string, binding: string | number) =>
  db("users as u")
    .join("roles as r", "r.id", "u.role_id")
    .select(
      "u.id",
      "u.username",
      "r.name as role",
      db.raw("coalesce(u.can_view_all_applications, r.can_view_all_applications) as can_view_all_applications"),
      db.raw("coalesce(u.can_manage_users, r.can_manage_users) as can_manage_users"),
    )
    .whereRaw(where, binding);

/** Row → session shape; also derives the avatar initial from the username. */
function toSessionUser(row: UserRow): SessionUser {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    initial: row.username.slice(0, 1).toUpperCase(),
    can_view_all_applications: Boolean(row.can_view_all_applications),
    can_manage_users: Boolean(row.can_manage_users),
  };
}

/** Full user row by username — used by the local strategy before verification.
 *
 *  Select explicit columns: an unqualified `select *` over this join returns
 *  two `id` columns, and node-postgres lets the later (roles.id) overwrite the
 *  users.id — which silently authenticated every account as id 1. */
export async function findUserWithRole(username: string) {
  return db("users as u")
    .join("roles as r", "r.id", "u.role_id")
    .select("u.id", "u.username", "u.password_hash")
    .where("u.username", username)
    .first();
}

export async function loadSessionUser(id: number): Promise<SessionUser | undefined> {
  const row = await SELECT_SESSION_USER("u.id = ?", id).first();
  return row ? toSessionUser(row) : undefined;
}
