import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { loadSessionUser, findUserWithRole, type SessionUser } from "./session.js";
import { verifyPassword } from "./password.js";

/**
 * Passport local strategy against the seeded accounts.
 *
 * - Verification uses the scrypt helpers in password.ts (timingSafeEqual).
 * - serializeUser stores only the id; deserializeUser reloads the *effective*
 *   permissions on every request, so /admin/users changes apply immediately.
 */
export function configurePassport() {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      // express.urlencoded turns repeated fields into arrays/objects; malformed
      // credentials must fail the login, never reach scrypt and throw a 500.
      if (typeof username !== "string" || typeof password !== "string") {
        return done(null, false);
      }
      try {
        const row = await findUserWithRole(username);
        if (!row || !(await verifyPassword(password, row.password_hash))) {
          return done(null, false);
        }
        const user = await loadSessionUser(row.id);
        return done(null, user ?? false);
      } catch (error) {
        return done(error as Error);
      }
    }),
  );

  passport.serializeUser((user: Express.User, done) => done(null, user.id));

  passport.deserializeUser(async (id: number, done) => {
    try {
      done(null, (await loadSessionUser(id)) ?? false);
    } catch (error) {
      done(error as Error);
    }
  });
}
