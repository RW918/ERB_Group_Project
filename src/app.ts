import express from "express";
import session from "express-session";
import passport from "passport";
import type { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import { previewRouter } from "./routes/preview.js";
import { applicationsRouter } from "./routes/applications.js";
import { configurePassport } from "./auth/passport.js";
import { authRouter } from "./routes/auth.js";
import { requireAuth } from "./middleware/auth.js";
import { notFound } from "./controllers/not-found.js";

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

// Every applications screen needs a session; signed-out visitors land on /login.
app.use(requireAuth, applicationsRouter);

// Lane 1 mounts here:  app.use("/admin", adminRouter);

// Design prototype screens not rebuilt as real pages yet (login preview is a
// screen list; admin lands with the admin branch). Gated behind login.
app.use("/preview", requireAuth, previewRouter);

app.use(notFound);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).send("Something broke");
});
