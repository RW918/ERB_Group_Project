import express from "express";
import session from "express-session";
import passport from "passport";
import type { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import { previewRouter } from "./routes/preview.js";
import { configurePassport } from "./auth/passport.js";
import { authRouter } from "./routes/auth.js";
import { requireAuth } from "./middleware/auth.js";

export const app = express();

// Render (and any reverse proxy) terminates TLS and forwards the real host.
app.set("trust proxy", 1);
app.set("views", config.viewsDir);
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
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

app.get("/", (_req, res) => {
  res.render("hello");
});

// The design prototype router; gated behind login so the redirect flow works
// end to end. Delete it once the real lane routers take over.
app.use("/preview", requireAuth, previewRouter);

// Lane 2 mounts here:  app.use("/applications", applicationsRouter);
// Lane 1 mounts here:  app.use("/admin", adminRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).send("Not found");
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).send("Something broke");
});
