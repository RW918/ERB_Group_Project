import path from "node:path";

/**
 * Runtime configuration. Everything here comes from the environment; `.env` is
 * loaded by `node --env-file-if-exists` (see package.json scripts), so there is
 * no dotenv dependency.
 */
export const config = {
  port: Number(process.env.PORT ?? 3000),
  sessionSecret: process.env.SESSION_SECRET ?? "dev-only-change-me",
  viewsDir: path.join(import.meta.dirname, "views"),
  publicDir: path.join(import.meta.dirname, "..", "public"),
};
