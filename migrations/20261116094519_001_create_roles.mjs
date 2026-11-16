/**
 * roles — the two permission bundles. See docs/../draft/erd.sql for the source.
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.createTable("roles", (t) => {
    t.increments("id").primary();
    t.string("name", 20).notNullable().unique();
    t.boolean("can_view_all_applications").notNullable().defaultTo(false);
    t.boolean("can_manage_users").notNullable().defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.dropTable("roles");
};
