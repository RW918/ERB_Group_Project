import type { Knex } from "knex";
import { STATUSES } from "../src/types/domain.js";

/**
 * JobTrack initial schema — squashed from the draft migrations before first deploy.
 * Source of truth: draft/erd.sql. Readable version: docs/erd.md.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const up = async (knex: Knex) => {
  /** Every table carries the same `created_at`; keep it one line per table. */
  const createdAt = (t: Knex.CreateTableBuilder) =>
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

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
    t.integer("role_id").notNullable().references("roles.id");
    createdAt(t);
  });

  await knex.schema.createTable("companies", (t) => {
    t.increments("id").primary();
    t.string("name", 100).notNullable().unique();
    createdAt(t);
  });

  await knex.schema.createTable("jobs", (t) => {
    t.increments("id").primary();
    t.integer("company_id").notNullable().references("companies.id");
    t.string("title", 100).notNullable();
    t.text("posting_url");
    t.string("location", 100);
    t.string("salary", 100);
    t.date("deadline");
    createdAt(t);
    t.index("company_id", "jobs_company_id_idx");
  });

  await knex.schema.createTable("applications", (t) => {
    t.increments("id").primary();
    t.integer("user_id").notNullable().references("users.id").onDelete("CASCADE");
    t.integer("job_id").notNullable().references("jobs.id").onDelete("CASCADE");
    t.string("status", 20).notNullable().defaultTo("applied")
      .checkIn(STATUSES as unknown as string[], "applications_status_check");
    t.date("interview_date");
    t.text("note");
    createdAt(t);
    t.unique(["user_id", "job_id"], { indexName: "applications_user_job_unique" });
    for (const col of ["user_id", "job_id", "status"]) {
      t.index(col, `applications_${col}_idx`);
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex: Knex) => {
  for (const table of ["applications", "jobs", "companies", "users", "roles"]) {
    await knex.schema.dropTableIfExists(table);
  }
};
