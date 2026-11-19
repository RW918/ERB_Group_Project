import { Router } from "express";
import * as applications from "../controllers/applications.js";

/**
 * Applications — one router per lane, mounted at "/" in app.ts (the dashboard
 * is the index screen). REST-shaped: DELETE is the AJAX endpoint the confirm
 * dialog calls; create and update are form POSTs.
 */
export const applicationsRouter = Router();

applicationsRouter.get("/", applications.dashboard);
applicationsRouter.post("/applications", applications.create);
applicationsRouter.get("/applications/:id", applications.show);
applicationsRouter.post("/applications/:id", applications.update);
applicationsRouter.delete("/applications/:id", applications.destroy);
