import { Router } from "express";
import passport from "passport";

/**
 * Login and logout. The local strategy failureRedirect carries `?error=1`,
 * which the login view turns into the error state the wireframe draws.
 */
export const authRouter = Router();

authRouter.get("/login", (req, res) => {
  // "already logged in → redirect" state from the wireframe spec.
  if (req.isAuthenticated()) return res.redirect("/");
  return res.render("login", { error: req.query.error === "1" });
});

authRouter.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login?error=1",
    successRedirect: "/",
  }),
);

// Logout mutates the session, so it is a POST (no prefetch/CSRF-GET logout).
// The sidebar renders it as a small form around the icon button — works
// without JS; SameSite=lax already keeps cross-site POSTs from carrying the
// session cookie.
authRouter.post("/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);
    return res.redirect("/login");
  });
});
