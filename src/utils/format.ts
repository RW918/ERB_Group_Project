import type { Status } from "../types/domain.js";

/**
 * Display formatting — pure functions with no database access, so they are the
 * unit-test targets for issue 22. Display labels live in the view layer; the
 * database stores the four status codes (see docs/erd.md).
 */

/** Stored code → chip label + CSS class, exactly as the design boards draw them. */
export const STATUS_META: Record<Status, { label: string; cls: string }> = {
  applied: { label: "已投递", cls: "st-applied" },
  interviewing: { label: "面试机会", cls: "st-interviewing" },
  offer: { label: "Offer", cls: "st-offer" },
  rejected: { label: "已拒绝", cls: "st-rejected" },
};

const TINTS = [
  { tint: "#EEF0FF", tintInk: "#4F46E5" },
  { tint: "#FEF3C7", tintInk: "#B45309" },
  { tint: "#F3E8FF", tintInk: "#7E22CE" },
  { tint: "#D9FBE9", tintInk: "#047857" },
  { tint: "#E0F2FE", tintInk: "#0369A1" },
  { tint: "#FFE4E6", tintInk: "#BE123C" },
];

/** Deterministic logo-tint for a company name: same name, same colour. */
export function companyTint(name: string): { tint: string; tintInk: string } {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)!) % 997;
  return TINTS[hash % TINTS.length];
}

/** `2026-12-15` → `12/15` (the short form the cards and detail page use). */
export function shortDate(iso: string): string {
  const [, month, date] = iso.split("-");
  return `${Number(month)}/${Number(date)}`;
}

/**
 * Days from today until the ISO deadline; negative once it has passed.
 * Both sides are midnight-based so the count is stable during the day.
 */
export function daysLeft(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round(
    (Date.parse(`${iso}T00:00:00`) - today.getTime()) / 86_400_000,
  );
}

/** Date or timestamp column → `YYYY-MM-DD`, or null when empty. */
export function toISODate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.slice(0, 10);
  // Local components: pg hands DATE columns back as local-midnight Dates, and
  // toISOString() would shift them to the previous day for UTC+ time zones.
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

/** Timestamp column → `YYYY-MM-DD HH:mm` in the server's locale. */
export function formatTimestamp(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
