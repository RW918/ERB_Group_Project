import type { NextFunction, Request, Response } from "express";

/** 404 page — used by the global fallthrough and the applications controller. */
export function notFound(_req: Request, res: Response, _next: NextFunction) {
  res.status(404).render("not-found");
}
