import express from "express";
import session from "express-session";
import passport from "passport";
import type { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import compression from "compression";
import { applicationsRouter } from "./routes/applications.js";
import { adminRouter } from "./routes/admin.js";
import { configurePassport } from "./auth/passport.js";
import { authRouter } from "./routes/auth.js";
import { notFound } from "./controllers/not-found.js";

export const app = express();

// Render (and any reverse proxy) terminates TLS and forwards the real host.
app.set("trust proxy", 1);
app.set("views", config.viewsDir);
app.set("view engine", "ejs");
// Cache-bust static assets per deploy: Render injects the commit, so a new
// deployment references a new URL and neither Cloudflare nor the browser can
// keep serving the previous app.css/app.js.
app.locals.assetVersion = process.env.RENDER_GIT_COMMIT?.slice(0, 7) ?? "dev";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// gzip for rendered views and static assets; Render's free tier has a slow
// first byte, so shipping app.css (40 KB → ~8 KB) is worth the middleware.
app.use(compression());
app.use(express.static(config.publicDir));

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax" },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    // Render injects the deployed commit; null locally.
    commit: process.env.RENDER_GIT_COMMIT?.slice(0, 7) ?? null,
  });
});

app.use(authRouter);

app.use(applicationsRouter);

app.use("/admin", adminRouter);

app.use(notFound);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).send("Something broke");
});
