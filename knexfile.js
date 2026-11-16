/**
 * Knex configuration — ESM default export (knex reads it with `import()` because
 * package.json declares "type": "module").
 *
 * Connection values come from the environment; `npm run migrate` loads `.env`
 * through `node --env-file-if-exists`, so no dotenv dependency.
 *
 * @type {import("knex").Knex.Config}
 */
export default {
  client: "pg",
  connection: process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.PGHOST ?? "127.0.0.1",
        port: Number(process.env.PGPORT ?? 5432),
        database: process.env.PGDATABASE ?? "jobtrack",
        user: process.env.PGUSER ?? "postgres",
        password: process.env.PGPASSWORD ?? "",
      },
  pool: { min: 0, max: 5 },
  migrations: {
    directory: "./migrations",
    tableName: "knex_migrations",
    extension: "mjs",
  },
  seeds: {
    directory: "./seeds",
    extension: "mjs",
  },
};
