import type { Knex } from "knex";

/**
 * Demo applications for alice only, so the ownership rule is visible: bob's
 * list stays empty until he adds his own. Each row is one (user, job) pair.
 */
export const seed = async (knex: Knex) => {
  const alice = await knex("users").where({ username: "alice" }).first();
  if (!alice) return;

  const existing = await knex("applications").where({ user_id: alice.id }).first();
  if (existing) return;

  const jobs = await knex("jobs").select("id", "title");
  const jobId = Object.fromEntries(jobs.map((j) => [j.title, j.id]));

  await knex("applications").insert([
    {
      user_id: alice.id,
      job_id: jobId["Junior Developer"],
      status: "interviewing",
      interview_date: "2026-11-30",
      note: "Second round with the platform team.",
    },
    {
      user_id: alice.id,
      job_id: jobId["Frontend Developer"],
      status: "applied",
      note: null,
    },
    {
      user_id: alice.id,
      job_id: jobId["Backend Intern"],
      status: "rejected",
      note: "Rejected after the take-home.",
    },
  ]);
};
