import { Router } from "express";
import { index, save } from "../controllers/admin.js";
import { requirePermission } from "../middleware/auth.js";

/**
 * Admin — the /admin/users screen (issue 12). Every route requires the
 * manage-users permission: signed-out visitors go to /login, signed-in users
 * without the grant see the 没有权限 page.
 */
export const adminRouter = Router();

adminRouter.get("/users", requirePermission("can_manage_users"), index);
adminRouter.post("/users", requirePermission("can_manage_users"), save);
