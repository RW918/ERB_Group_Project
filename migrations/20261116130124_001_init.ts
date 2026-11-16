import type { Knex } from "knex";

/**
 * JobTrack initial schema — squashed from the draft migrations before first deploy.
 * Nothing has run migrate:latest yet, so there is no migration history to preserve.
 * Source of truth: draft/erd.sql. Readable version: docs/erd.md.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex: Knex) => {
  await knex.schema.createTable("roles", (t) => {
    t.increments("id").primary();
    t.string("name", 20).notNullable().unique();
    t.boolean("can_view_all_applications").notNullable().defaultTo(false);
    t.boolean("can_manage_users").notNullable().defaultTo(false);
  });

  await knex.schema.createTable("users", (t) => {
    t.increments("id").primary();
    t.string("username", 50).notNullable().unique();
    t.text("password_hash").notNullable();
    t.integer("role_id").notNullable().references("id").inTable("roles");
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("companies", (t) => {
    t.increments("id").primary();
    t.string("name", 100).notNullable().unique();
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("applications", (t) => {
    t.increments("id").primary();
    t.integer("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    t.integer("company_id").notNullable().references("id").inTable("companies");
    t.string("position", 100).notNullable();
    t.string("status", 20).notNullable().defaultTo("applied");
    t.date("interview_date").nullable();
    t.text("note").nullable();
    t.text("posting_url").nullable();
    t.string("location", 100).nullable();
    t.string("salary", 100).nullable();
    t.date("deadline").nullable();
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
export const down = async (knex: Knex) => {
  await knex.schema.dropTable("applications");
  await knex.schema.dropTable("companies");
  await knex.schema.dropTable("users");
  await knex.schema.dropTable("roles");
};
