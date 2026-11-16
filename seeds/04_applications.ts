import type { Knex } from "knex";

/**
 * Demo applications for alice only, so the ownership rule is visible: bob's
 * list stays empty until he adds his own.
 */
export const seed = async (knex: Knex) => {
  const alice = await knex("users").where({ username: "alice" }).first();
  if (!alice) return;

  const existing = await knex("applications").where({ user_id: alice.id }).first();
  if (existing) return;

  const companies = await knex("companies").select("id", "name");
  const companyId = Object.fromEntries(companies.map((c) => [c.name, c.id]));

  await knex("applications").insert([
    {
      user_id: alice.id,
      company_id: companyId["Example Ltd"],
      position: "Junior Developer",
      status: "interviewing",
      interview_date: "2026-11-30",
      note: "Second round with the platform team.",
      posting_url: "https://example.com/jobs/junior-dev",
      location: "Hong Kong",
      salary: "HKD 20k-25k/month",
      deadline: "2026-12-15",
    },
    {
      user_id: alice.id,
      company_id: companyId["Northwind Studio"],
      position: "Frontend Developer",
      status: "applied",
      note: null,
      posting_url: "https://northwind.example/careers/frontend",
      location: "Remote",
      salary: null,
      deadline: "2026-12-01",
    },
    {
      user_id: alice.id,
      company_id: companyId["Violet Labs"],
      position: "Backend Intern",
      status: "rejected",
      note: "Rejected after the take-home.",
      posting_url: null,
      location: "Hong Kong",
      salary: null,
      deadline: null,
    },
  ]);
};
