import { Router } from "express";

/**
 * Design prototype routes. These render UI screens that haven't been rebuilt
 * as real pages yet, with fixed demo data — currently the admin users screen,
 * which lands with the auth lane's admin branch. Delete this router then.
 */
export const previewRouter = Router();

const user = {
  id: 1,
  username: "admin",
  initial: "A",
  role: "admin" as const,
  can_view_all_applications: true,
  can_manage_users: true,
};

const users = [
  {
    username: "admin",
    email: "admin@jobtrack.dev",
    roleLabel: "管理员",
    canViewAll: true,
    canManageUsers: true,
    self: true,
    initial: "A",
    tint: "#EEF0FF",
    tintInk: "#4F46E5",
  },
  {
    username: "carol",
    email: "carol@jobtrack.dev",
    roleLabel: "普通用户",
    canViewAll: true,
    canManageUsers: false,
    self: false,
    initial: "C",
    tint: "#FEF3C7",
    tintInk: "#B45309",
  },
  {
    username: "alice",
    email: "alice@jobtrack.dev",
    roleLabel: "普通用户",
    canViewAll: false,
    canManageUsers: false,
    self: false,
    initial: "A",
    tint: "#D9FBE9",
    tintInk: "#047857",
  },
  {
    username: "bob",
    email: "bob@jobtrack.dev",
    roleLabel: "普通用户",
    canViewAll: false,
    canManageUsers: false,
    self: false,
    initial: "B",
    tint: "#E0F2FE",
    tintInk: "#0369A1",
  },
];

previewRouter.get("/", (_req, res) => {
  res.render("preview/index");
});

previewRouter.get("/admin", (_req, res) => {
  res.render("preview/admin", { user, users });
});
