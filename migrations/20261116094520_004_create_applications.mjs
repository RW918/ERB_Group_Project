/**
 * applications — the aggregate root. Status is constrained to the four domain
 * values; indexes support the owner filter and the stats aggregate.
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.createTable("applications", (t) => {
    t.increments("id").primary();
    t.integer("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    t.integer("company_id").notNullable().references("id").inTable("companies");
    t.string("position", 100).notNullable();
    t.string("status", 20).notNullable().defaultTo("applied");
    t.date("interview_date").nullable();
    t.text("note").nullable();
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    t.index(["user_id"], "applications_user_id_idx");
    t.index(["company_id"], "applications_company_id_idx");
    t.index(["status"], "applications_status_idx");
  });

  await knex.raw(`
    ALTER TABLE applications
    ADD CONSTRAINT applications_status_check
    CHECK (status IN ('applied', 'interviewing', 'offer', 'rejected'))
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.dropTable("applications");
};
