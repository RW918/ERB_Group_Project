import knex from "knex";

/**
 * Runtime database handle. Connection values mirror knexfile.js — keep the two
 * in step, or move to a single shared JSON config if they start to drift.
 */
export const db = knex({
  client: "pg",
  connection: process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.PGHOST ?? "127.0.0.1",
        port: Number(process.env.PGPORT ?? 5432),
        database: process.env.PGDATABASE ?? "jobtrack",
        user: process.env.PGUSER ?? "postgres",
        password: process.env.PGPASSWORD ?? "",
      },
  pool: { min: 0, max: 5 },
});
