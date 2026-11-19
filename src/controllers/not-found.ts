import type { NextFunction, Request, Response } from "express";

/**
 * 404 page — used by the global fallthrough and the applications controller.
 * Signed-out visitors have nothing to show behind the shell, so they go to
 * /login; signed-in visitors get the app shell with a modal dialog.
 */
export function notFound(req: Request, res: Response, _next: NextFunction) {
  const wantsHtml = req.method === "GET" && (req.headers.accept ?? "").includes("text/html");
  if (!wantsHtml) return res.status(404).send("Not found");
  if (!req.isAuthenticated || !req.isAuthenticated()) return res.redirect("/login");
  res.status(404).render("not-found", { user: req.user });
}
