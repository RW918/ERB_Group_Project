import type { Knex } from "knex";

/**
 * Demo applications for alice only, so the ownership rule is visible: bob's
 * list stays empty until he adds his own. Each row is one (user, job) pair.
 * Idempotent: skips when alice already tracks anything, so seeds never bring
 * back an application the demo deleted.
 */

interface DemoApplication {
  title: string;
  status: "applied" | "interviewing" | "offer" | "rejected";
  interviewDate?: string;
  note?: string;
}

const demoApplications: DemoApplication[] = [
  {
    title: "Junior Developer",
    status: "interviewing",
    interviewDate: "2026-11-30",
    note: "Second round with the platform team，准备系统设计题。",
  },
  { title: "Frontend Developer", status: "applied" },
  {
    title: "Backend Intern",
    status: "rejected",
    note: "Take-home 之后被拒，反馈是并发部分需要加强。",
  },
  { title: "数据分析实习生", status: "interviewing", interviewDate: "2026-12-03" },
  {
    title: "UI Engineer",
    status: "offer",
    interviewDate: "2026-11-18",
    note: "口头 Offer，等书面确认。",
  },
  { title: "Platform Engineer", status: "applied" },
  { title: "产品运营", status: "applied" },
  {
    title: "Interaction Designer",
    status: "interviewing",
    interviewDate: "2026-12-05",
    note: "带作品集，30 分钟 case study。",
  },
  { title: "前端工程师", status: "rejected" },
  { title: "Graduate Engineer", status: "applied" },
  { title: "Data Analyst", status: "applied" },
  { title: "Junior Designer", status: "offer", interviewDate: "2026-11-20" },
];

export const seed = async (knex: Knex) => {
  const alice = await knex("users").where({ username: "alice" }).first();
  if (!alice) return;

  const existing = await knex("applications").where({ user_id: alice.id }).first();
  if (existing) return;

  const jobs = await knex("jobs").select("id", "title");
  const jobId = Object.fromEntries(jobs.map((j) => [j.title, j.id]));

  await knex("applications").insert(
    demoApplications.map((demo) => ({
      user_id: alice.id,
      job_id: jobId[demo.title],
      status: demo.status,
      interview_date: demo.interviewDate ?? null,
      note: demo.note ?? null,
    })),
  );
};
