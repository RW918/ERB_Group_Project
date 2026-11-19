import type { Knex } from "knex";

/**
 * Demo companies — the twelve the design boards show. Companies are shared, so
 * every name that any demo job points at is created here. Idempotent on the
 * unique name.
 */
export const seed = async (knex: Knex) => {
  const names = [
    "Example Ltd",
    "Northwind Studio",
    "Violet Labs",
    "恒生银行",
    "Pixel Works",
    "Harbour AI",
    "Lumen 科技",
    "Cobalt Design",
    "星野资本",
    "Atlas Freight",
    "Nova Health",
    "Paperplane",
  ];

  await knex("companies")
    .insert(names.map((name) => ({ name })))
    .onConflict("name")
    .ignore();
};
