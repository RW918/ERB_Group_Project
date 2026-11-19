import type { NextFunction, Request, Response } from "express";
import type { Permission } from "../auth/session.js";

/**
 * Route guards — the "grant" requirement. Permissions are checked per request
 * against the deserialized user, never cached in the session, so revoking on
 * /admin/users blocks the account at its next request.
 */

/** Redirects signed-out visitors to the login page. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  return res.redirect("/login");
}

/**
 * Blocks visitors whose effective permissions don't include `permission`.
 * Signed-out visitors go to /login; signed-in visitors without the permission
 * get the 没有权限 page (403).
 */
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) return res.redirect("/login");
    if (req.user && req.user[permission]) return next();
    return res.status(403).render("forbidden", { user: req.user ?? null });
  };
}
