/**
 * users — one row per account, exactly one role each.
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.createTable("users", (t) => {
    t.increments("id").primary();
    t.string("username", 50).notNullable().unique();
    t.text("password_hash").notNullable();
    t.integer("role_id").notNullable().references("id").inTable("roles");
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.dropTable("users");
};
