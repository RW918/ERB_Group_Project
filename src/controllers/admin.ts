import type { RequestHandler } from "express";
import { db } from "../db/client.js";
import { isValidId } from "../utils/ids.js";
import type { Role } from "../types/domain.js";

/**
 * Admin users screen (issue 12) — the visible "grant" demo.
 *
 * Permissions are role-default with per-user override (see docs/erd.md): the
 * two switches write the nullable override columns, a role change resets them
 * so the account falls back to its new role. Deserialization reloads the
 * effective permissions every request, so changes apply on the next request
 * without a re-login.
 */

export class AdminError extends Error {}

interface AdminUserRow {
  id: number;
  username: string;
  created_at: Date;
  role_id: number;
  role: Role["name"];
  can_view_all_applications: boolean | null;
  can_manage_users: boolean | null;
  effective_view_all: boolean;
  effective_manage_users: boolean;
}

async function listUsers(): Promise<AdminUserRow[]> {
  return db("users as u")
    .join("roles as r", "r.id", "u.role_id")
    .select({
      id: "u.id",
      username: "u.username",
      created_at: "u.created_at",
      role_id: "u.role_id",
      role: "r.name",
      can_view_all_applications: "u.can_view_all_applications",
      can_manage_users: "u.can_manage_users",
      effective_view_all: db.raw(
        "coalesce(u.can_view_all_applications, r.can_view_all_applications)",
      ),
      effective_manage_users: db.raw(
        "coalesce(u.can_manage_users, r.can_manage_users)",
      ),
    })
    .orderBy("u.id");
}

/** GET /admin/users */
export const index: RequestHandler = async (_req, res, next) => {
  try {
    const users = await listUsers();
    res.render("admin/users", {
      title: "用户与权限",
      active: "admin",
      user: _req.user,
      users: users.map((row) => ({
        ...row,
        initial: row.username.slice(0, 1).toUpperCase(),
        self: row.id === _req.user!.id,
        created: row.created_at.toISOString().slice(0, 10),
      })),
      error: typeof _req.query.error === "string" ? _req.query.error : null,
    });
  } catch (error) {
    next(error);
  }
};

/** Per-user form fields: `role[u3]` etc. — the `u` prefix keeps qs from
 *  collapsing numeric keys (ids 1,2,3) into an array, which would shift every
 *  row's values onto the wrong user. */
type FieldMap = Record<string, string | string[] | undefined>;

function pick(map: unknown, id: number): string | string[] | undefined {
  return (map as FieldMap)[`u${id}`];
}

/**
 * POST /admin/users — one save applies every row of the panel.
 *
 * Body shape (per user id): `role[<id>]`, plus `has_view[<id>]` /
 * `can_view[<id>]` and `has_manage[<id>]` / `can_manage[<id>]` — the `has_*`
 * markers distinguish an unchecked switch from a field the form didn't show.
 */
export const save: RequestHandler = async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const roles = (body.role ?? {}) as FieldMap;
    const hasView = (body.has_view ?? {}) as FieldMap;
    const canView = (body.can_view ?? {}) as FieldMap;
    const hasManage = (body.has_manage ?? {}) as FieldMap;
    const canManage = (body.can_manage ?? {}) as FieldMap;

    const ids = Object.keys(roles)
      .filter((key) => /^u\d+$/.test(key))
      .map((key) => Number(key.slice(1)))
      .filter(isValidId);
    if (ids.length === 0) return res.redirect("/admin/users");

    await db.transaction(async (trx) => {
      for (const id of ids) {
        const target = await trx("users").where({ id }).first();
        if (!target) continue;

        const roleName = String(pick(roles, id) ?? "");
        const role = await trx("roles").where({ name: roleName }).first();
        if (!role) continue;

        const roleChanged = role.id !== target.role_id;

        const viewOverride = pick(hasView, id) !== undefined
          ? pick(canView, id) !== undefined
          : roleChanged ? null : target.can_view_all_applications;
        const manageOverride = pick(hasManage, id) !== undefined
          ? pick(canManage, id) !== undefined
          : roleChanged ? null : target.can_manage_users;

        // Never let an admin revoke their own manage permission — that is a
        // lock-out with no one left to undo it. View-all may still be toggled.
        const safeManage = id === req.user!.id ? true : manageOverride;

        await trx("users").where({ id }).update({
          role_id: role.id,
          can_view_all_applications: viewOverride,
          can_manage_users: safeManage,
        });
      }
    });

    res.redirect("/admin/users");
  } catch (error) {
    if (error instanceof AdminError) {
      const message = encodeURIComponent(error.message);
      return res.redirect(`/admin/users?error=${message}`);
    }
    next(error);
  }
};
