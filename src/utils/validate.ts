import { STATUSES, type ApplicationInput, type Status } from "../types/domain.js";

/**
 * Application form validation — pure, no database access (unit-test target).
 * The form posts strings; this shapes them into an ApplicationInput or names
 * the first problem, which the view shows next to the dialog.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type Raw = Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown): string | null {
  return text(value) || null;
}

function optionalDate(value: unknown): string | null {
  const iso = text(value);
  if (!ISO_DATE.test(iso)) return null;
  const [year, month, day] = iso.split("-").map(Number);
  // Reject impossible calendar dates (2026-02-30) before they reach Postgres.
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? iso
    : null;
}

export type ParseResult =
  | { ok: true; value: ApplicationInput }
  | { ok: false; error: string };

export function parseApplicationInput(body: Raw): ParseResult {
  const company = text(body.company);
  if (!company) return { ok: false, error: "请填写公司名称" };

  const title = text(body.title);
  if (!title) return { ok: false, error: "请填写职位名称" };

  const statusInput = text(body.status) as Status;
  const status: Status = STATUSES.includes(statusInput) ? statusInput : "applied";

  return {
    ok: true,
    value: {
      company,
      title,
      status,
      interview_date: optionalDate(body.interview_date),
      note: optionalText(body.note),
      posting_url: optionalText(body.posting_url),
      location: optionalText(body.location),
      salary: optionalText(body.salary),
      deadline: optionalDate(body.deadline),
    },
  };
}
