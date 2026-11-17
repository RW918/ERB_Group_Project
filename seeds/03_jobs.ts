import type { Knex } from "knex";

/**
 * Demo job adverts. One row per posting, shared by every user who tracks it.
 * Idempotent: skips when any job already exists.
 */
export const seed = async (knex: Knex) => {
  const existing = await knex("jobs").first();
  if (existing) return;

  const companies = await knex("companies").select("id", "name");
  const companyId = Object.fromEntries(companies.map((c) => [c.name, c.id]));

  await knex("jobs").insert([
    {
      company_id: companyId["Example Ltd"],
      title: "Junior Developer",
      posting_url: "https://example.com/jobs/junior-dev",
      location: "Hong Kong",
      salary: "HKD 20k-25k/month",
      deadline: "2026-12-15",
    },
    {
      company_id: companyId["Northwind Studio"],
      title: "Frontend Developer",
      posting_url: "https://northwind.example/careers/frontend",
      location: "Remote",
      salary: null,
      deadline: "2026-12-01",
    },
    {
      company_id: companyId["Violet Labs"],
      title: "Backend Intern",
      posting_url: null,
      location: "Hong Kong",
      salary: null,
      deadline: null,
    },
  ]);
};
