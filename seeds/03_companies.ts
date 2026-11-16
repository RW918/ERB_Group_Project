import type { Knex } from "knex";

/**
 * Demo companies. Idempotent on the unique name.
 */
export const seed = async (knex: Knex) => {
  await knex("companies")
    .insert([{ name: "Example Ltd" }, { name: "Northwind Studio" }, { name: "Violet Labs" }])
    .onConflict("name")
    .ignore();
};
