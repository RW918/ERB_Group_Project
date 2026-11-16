import express from "express";
import session from "express-session";
import passport from "passport";
import type { NextFunction, Request, Response } from "express";
import { config } from "./config.js";

export const app = express();

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

app.get("/healthz", (_req, res) => {
  res.json({ ok: true });
});

app.get("/", (_req, res) => {
  res.render("hello");
});

// Lane 1 mounts here:  app.use("/", authRouter); app.use("/admin", adminRouter);
// Lane 2 mounts here:  app.use("/applications", applicationsRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).send("Not found");
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).send("Something broke");
});
