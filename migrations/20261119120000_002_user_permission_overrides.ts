import type { Knex } from "knex";

/**
 * Per-user permission overrides (issue 13, the "grant" rubric).
 *
 * The role's booleans stay the default; a user may be granted or revoked either
 * permission individually. `NULL` means "fall back to the role", so the admin
 * page can show an effective value and clear the override when a role changes.
 * Guards read `COALESCE(user.col, role.col)` — see src/middleware/auth.ts.
 *
 * Matches draft/erd.sql; docs/erd.md explains the rule.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex: Knex) => {
  await knex.schema.alterTable("users", (t) => {
    t.boolean("can_view_all_applications")
      .comment("per-user override; NULL falls back to the role's default");
    t.boolean("can_manage_users")
      .comment("per-user override; NULL falls back to the role's default");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex: Knex) => {
  await knex.schema.alterTable("users", (t) => {
    t.dropColumn("can_view_all_applications");
    t.dropColumn("can_manage_users");
  });
};
