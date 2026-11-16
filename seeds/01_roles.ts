import type { Knex } from "knex";

/**
 * Seeded roles. The admin role carries both permissions; the user role carries
 * neither. Idempotent: safe to run against a shared database.
 */
export const seed = async (knex: Knex) => {
  await knex("roles")
    .insert([
      { name: "user", can_view_all_applications: false, can_manage_users: false },
      { name: "admin", can_view_all_applications: true, can_manage_users: true },
    ])
    .onConflict("name")
    .ignore();
};
