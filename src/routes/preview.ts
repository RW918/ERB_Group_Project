import { Router } from "express";

/**
 * Design prototype routes. These render the UI with fixed demo data so the
 * screens can be reviewed (and screenshotted) without a database. Delete this
 * router once the real lanes are wired.
 */
export const previewRouter = Router();

const user = { name: "admin", initial: "A", roleLabel: "管理员" };

const tints = [
  { tint: "#EEF0FF", tintInk: "#4F46E5" },
  { tint: "#FEF3C7", tintInk: "#B45309" },
  { tint: "#F3E8FF", tintInk: "#7E22CE" },
  { tint: "#D9FBE9", tintInk: "#047857" },
  { tint: "#E0F2FE", tintInk: "#0369A1" },
  { tint: "#FFE4E6", tintInk: "#BE123C" },
];

type StatusCode = "applied" | "interviewing" | "offer" | "rejected";

const statusMeta: Record<StatusCode, { label: string; cls: string }> = {
  applied: { label: "已投递", cls: "st-applied" },
  interviewing: { label: "面试机会", cls: "st-interviewing" },
  offer: { label: "Offer", cls: "st-offer" },
  rejected: { label: "已拒绝", cls: "st-rejected" },
};

type Seed = {
  company: string;
  role: string;
  status: StatusCode;
  location: string;
  salary: string;
  deadline: string;
  interview?: string;
  note?: string;
  url: string;
};

const seeds: Seed[] = [
  {
    company: "Example Ltd",
    role: "Junior Developer",
    status: "interviewing",
    location: "香港 · 混合办公",
    salary: "HKD 20k–25k / 月",
    deadline: "2026-12-15",
    interview: "2026-11-30",
    note: "Second round with the platform team，准备系统设计题。",
    url: "https://example.com/jobs/42",
  },
  {
    company: "Northwind Studio",
    role: "Frontend Developer",
    status: "applied",
    location: "远程",
    salary: "HKD 18k–24k / 月",
    deadline: "2026-12-01",
    url: "https://northwind.example.com/careers/fe",
  },
  {
    company: "Violet Labs",
    role: "Backend Intern",
    status: "rejected",
    location: "香港 · 观塘",
    salary: "HKD 12k–15k / 月",
    deadline: "2026-11-10",
    note: "Take-home 之后被拒，反馈是并发部分需要加强。",
    url: "https://violet.example.com/jobs/backend-intern",
  },
  {
    company: "恒生银行",
    role: "数据分析实习生",
    status: "interviewing",
    location: "香港 · 中环",
    salary: "HKD 15k–18k / 月",
    deadline: "2026-12-20",
    interview: "2026-12-03",
    url: "https://hangseng.example.com/graduates",
  },
  {
    company: "Pixel Works",
    role: "UI Engineer",
    status: "offer",
    location: "深圳 · 远程",
    salary: "CNY 22k–28k / 月",
    deadline: "2026-11-28",
    interview: "2026-11-18",
    note: "口头 Offer，等书面确认。",
    url: "https://pixelworks.example.com/jobs/ui",
  },
  {
    company: "Harbour AI",
    role: "Platform Engineer",
    status: "applied",
    location: "香港 · 科学园",
    salary: "HKD 25k–32k / 月",
    deadline: "2026-12-31",
    url: "https://harbourai.example.com/careers",
  },
  {
    company: "Lumen 科技",
    role: "产品运营",
    status: "applied",
    location: "香港 · 湾仔",
    salary: "HKD 16k–20k / 月",
    deadline: "2026-12-08",
    url: "https://lumen.example.com/jobs/ops",
  },
  {
    company: "Cobalt Design",
    role: "Interaction Designer",
    status: "interviewing",
    location: "远程",
    salary: "HKD 21k–26k / 月",
    deadline: "2026-12-12",
    interview: "2026-12-05",
    note: "带作品集，30 分钟 case study。",
    url: "https://cobalt.example.com/design",
  },
  {
    company: "星野资本",
    role: "前端工程师",
    status: "rejected",
    location: "香港 · 金钟",
    salary: "HKD 24k–30k / 月",
    deadline: "2026-11-05",
    url: "https://hoshino.example.com/jobs/fe",
  },
  {
    company: "Atlas Freight",
    role: "Graduate Engineer",
    status: "applied",
    location: "香港 · 葵涌",
    salary: "HKD 19k–23k / 月",
    deadline: "2026-12-22",
    url: "https://atlasfreight.example.com/graduate",
  },
  {
    company: "Nova Health",
    role: "Data Analyst",
    status: "applied",
    location: "香港 · 数码港",
    salary: "HKD 20k–24k / 月",
    deadline: "2026-12-18",
    url: "https://novahealth.example.com/jobs/data",
  },
  {
    company: "Paperplane",
    role: "Junior Designer",
    status: "offer",
    location: "远程",
    salary: "HKD 17k–21k / 月",
    deadline: "2026-11-30",
    interview: "2026-11-20",
    url: "https://paperplane.example.com/jobs/design",
  },
];

const day = 86_400_000;

function shortDate(iso: string): string {
  const [, month, date] = iso.split("-");
  return `${Number(month)}/${Number(date)}`;
}

function daysLeft(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${iso}T00:00:00`).getTime() - today.getTime()) / day);
}

const apps = seeds.map((seed, index) => {
  const meta = statusMeta[seed.status];
  return {
    ...seed,
    ...tints[index % tints.length],
    initial: seed.company.slice(0, 1).toUpperCase(),
    statusLabel: meta.label,
    statusClass: meta.cls,
    deadlineLabel: shortDate(seed.deadline),
    deadlineRaw: seed.deadline,
    daysLeft: daysLeft(seed.deadline),
    interviewLabel: seed.interview ? shortDate(seed.interview) : null,
    note: seed.note ?? "",
  };
});

const counts = {
  total: apps.length,
  applied: apps.filter((a) => a.status === "applied").length,
  interviewing: apps.filter((a) => a.status === "interviewing").length,
  offer: apps.filter((a) => a.status === "offer").length,
  rejected: apps.filter((a) => a.status === "rejected").length,
};

const users = [
  {
    username: "admin",
    email: "admin@jobtrack.dev",
    roleLabel: "管理员",
    canViewAll: true,
    canManageUsers: true,
    self: true,
    initial: "A",
    tint: "#EEF0FF",
    tintInk: "#4F46E5",
  },
  {
    username: "carol",
    email: "carol@jobtrack.dev",
    roleLabel: "普通用户",
    canViewAll: true,
    canManageUsers: false,
    self: false,
    initial: "C",
    tint: "#FEF3C7",
    tintInk: "#B45309",
  },
  {
    username: "alice",
    email: "alice@jobtrack.dev",
    roleLabel: "普通用户",
    canViewAll: false,
    canManageUsers: false,
    self: false,
    initial: "A",
    tint: "#D9FBE9",
    tintInk: "#047857",
  },
  {
    username: "bob",
    email: "bob@jobtrack.dev",
    roleLabel: "普通用户",
    canViewAll: false,
    canManageUsers: false,
    self: false,
    initial: "B",
    tint: "#E0F2FE",
    tintInk: "#0369A1",
  },
];

previewRouter.get("/login", (_req, res) => {
  res.render("preview/login");
});

previewRouter.get("/dashboard", (req, res) => {
  const modal = req.query.modal === "1";
  const editing = req.query.mode !== "new";
  res.render("preview/dashboard", {
    user,
    apps,
    counts,
    modal,
    editing,
    m: apps[0],
  });
});

previewRouter.get("/admin", (_req, res) => {
  res.render("preview/admin", { user, users });
});
