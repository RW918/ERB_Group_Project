/**
 * Demo applications for alice only, so the ownership rule is visible: bob's
 * list stays empty until he adds his own.
 */
export const seed = async (knex) => {
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
    },
    {
      user_id: alice.id,
      company_id: companyId["Northwind Studio"],
      position: "Frontend Developer",
      status: "applied",
      note: null,
    },
    {
      user_id: alice.id,
      company_id: companyId["Violet Labs"],
      position: "Backend Intern",
      status: "rejected",
      note: "Rejected after the take-home.",
    },
  ]);
};
