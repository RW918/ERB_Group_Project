import { Router } from "express";
import * as applications from "../controllers/applications.js";
import { requireAuth } from "../middleware/auth.js";

/**
 * Applications — one router per lane, mounted at "/" in app.ts (the dashboard
 * is the index screen). REST-shaped: DELETE is the AJAX endpoint the confirm
 * dialog calls; create and update are form POSTs. Guards sit per route so
 * unmatched paths still fall through to the 404 handler.
 */
export const applicationsRouter = Router();

applicationsRouter.get("/", requireAuth, applications.dashboard);
applicationsRouter.post("/applications", requireAuth, applications.create);
applicationsRouter.get("/applications/:id", requireAuth, applications.show);
applicationsRouter.post("/applications/:id", requireAuth, applications.update);
applicationsRouter.delete("/applications/:id", requireAuth, applications.destroy);
