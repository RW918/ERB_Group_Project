import type { Knex } from "knex";

/**
 * `applications.updated_at` — the detail page's 记录信息 card shows both the
 * submission date and the last update (Penpot boards 07/08), and the dashboard
 * sorts by it. Written on every application update; the row's creation keeps
 * the column at NOW().
 *
 * Matches draft/erd.sql; docs/erd.md explains the rule.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex: Knex) => {
  await knex.schema.alterTable("applications", (t) => {
    t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now())
      .comment("refreshed on every UPDATE of the row");
  });
  // Existing rows start at their creation time, not at the migration moment.
  await knex("applications").update({ updated_at: knex.ref("created_at") });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex: Knex) => {
  await knex.schema.alterTable("applications", (t) => {
    t.dropColumn("updated_at");
  });
};
