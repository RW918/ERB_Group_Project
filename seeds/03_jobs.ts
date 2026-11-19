import type { Knex } from "knex";

/**
 * Demo job adverts — the twelve postings the design boards show. One row per
 * posting, shared by every user who tracks it. Idempotent per posting: a job
 * that already exists (its company + title pair) is left untouched, so seeds
 * never resurrect a posting the demo deleted.
 */

interface DemoJob {
  company: string;
  title: string;
  postingUrl?: string;
  location?: string;
  salary?: string;
  deadline?: string;
}

const demoJobs: DemoJob[] = [
  {
    company: "Example Ltd",
    title: "Junior Developer",
    postingUrl: "https://example.com/jobs/42",
    location: "香港 · 混合办公",
    salary: "HKD 20k–25k / 月",
    deadline: "2026-12-15",
  },
  {
    company: "Northwind Studio",
    title: "Frontend Developer",
    postingUrl: "https://northwind.example.com/careers/fe",
    location: "远程",
    salary: "HKD 18k–24k / 月",
    deadline: "2026-12-01",
  },
  {
    company: "Violet Labs",
    title: "Backend Intern",
    postingUrl: "https://violet.example.com/jobs/backend-intern",
    location: "香港 · 观塘",
    salary: "HKD 12k–15k / 月",
    deadline: "2026-11-10",
  },
  {
    company: "恒生银行",
    title: "数据分析实习生",
    postingUrl: "https://hangseng.example.com/graduates",
    location: "香港 · 中环",
    salary: "HKD 15k–18k / 月",
    deadline: "2026-12-20",
  },
  {
    company: "Pixel Works",
    title: "UI Engineer",
    postingUrl: "https://pixelworks.example.com/jobs/ui",
    location: "深圳 · 远程",
    salary: "CNY 22k–28k / 月",
    deadline: "2026-11-28",
  },
  {
    company: "Harbour AI",
    title: "Platform Engineer",
    postingUrl: "https://harbourai.example.com/careers",
    location: "香港 · 科学园",
    salary: "HKD 25k–32k / 月",
    deadline: "2026-12-31",
  },
  {
    company: "Lumen 科技",
    title: "产品运营",
    postingUrl: "https://lumen.example.com/jobs/ops",
    location: "香港 · 湾仔",
    salary: "HKD 16k–20k / 月",
    deadline: "2026-12-08",
  },
  {
    company: "Cobalt Design",
    title: "Interaction Designer",
    postingUrl: "https://cobalt.example.com/design",
    location: "远程",
    salary: "HKD 21k–26k / 月",
    deadline: "2026-12-12",
  },
  {
    company: "星野资本",
    title: "前端工程师",
    postingUrl: "https://hoshino.example.com/jobs/fe",
    location: "香港 · 金钟",
    salary: "HKD 24k–30k / 月",
    deadline: "2026-11-05",
  },
  {
    company: "Atlas Freight",
    title: "Graduate Engineer",
    postingUrl: "https://atlasfreight.example.com/graduate",
    location: "香港 · 葵涌",
    salary: "HKD 19k–23k / 月",
    deadline: "2026-12-22",
  },
  {
    company: "Nova Health",
    title: "Data Analyst",
    postingUrl: "https://novahealth.example.com/jobs/data",
    location: "香港 · 数码港",
    salary: "HKD 20k–24k / 月",
    deadline: "2026-12-18",
  },
  {
    company: "Paperplane",
    title: "Junior Designer",
    postingUrl: "https://paperplane.example.com/jobs/design",
    location: "远程",
    salary: "HKD 17k–21k / 月",
    deadline: "2026-11-30",
  },
];

export const seed = async (knex: Knex) => {
  const companies = await knex("companies").select("id", "name");
  const companyId = Object.fromEntries(companies.map((c) => [c.name, c.id]));

  for (const demo of demoJobs) {
    const exists = await knex("jobs")
      .where({ company_id: companyId[demo.company], title: demo.title })
      .first();
    if (exists) continue;

    await knex("jobs").insert({
      company_id: companyId[demo.company],
      title: demo.title,
      posting_url: demo.postingUrl ?? null,
      location: demo.location ?? null,
      salary: demo.salary ?? null,
      deadline: demo.deadline ?? null,
    });
  }
};
