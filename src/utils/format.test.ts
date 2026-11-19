import { test } from "node:test";
import assert from "node:assert/strict";
import {
  companyTint,
  daysLeft,
  formatTimestamp,
  shortDate,
  STATUS_META,
  toISODate,
} from "./format.js";

/** Issue 22 — the display formatters (pure). */

test("shortDate drops the year and leading zeros", () => {
  assert.equal(shortDate("2026-12-05"), "12/5");
  assert.equal(shortDate("2026-01-09"), "1/9");
});

test("daysLeft is relative to today's midnight", () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const iso = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, "0"),
    String(tomorrow.getDate()).padStart(2, "0"),
  ].join("-");
  assert.equal(daysLeft(iso), 1);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const past = [
    yesterday.getFullYear(),
    String(yesterday.getMonth() + 1).padStart(2, "0"),
    String(yesterday.getDate()).padStart(2, "0"),
  ].join("-");
  assert.equal(daysLeft(past), -1);
});

test("toISODate keeps local calendar dates (no UTC day shift)", () => {
  // A local-midnight Date is what pg hands back for a DATE column.
  assert.equal(toISODate(new Date(2026, 11, 15)), "2026-12-15");
  assert.equal(toISODate(new Date(2026, 0, 1)), "2026-01-01");
  assert.equal(toISODate("2026-12-15"), "2026-12-15");
  assert.equal(toISODate("2026-12-15T00:00:00Z"), "2026-12-15");
  assert.equal(toISODate(null), null);
});

test("formatTimestamp renders YYYY-MM-DD HH:mm or null", () => {
  assert.equal(formatTimestamp(new Date(2026, 10, 14, 18, 2)), "2026-11-14 18:02");
  assert.equal(formatTimestamp(new Date(2026, 0, 1, 0, 5)), "2026-01-01 00:05");
  assert.equal(formatTimestamp(null), null);
  assert.equal(formatTimestamp("not a date"), null);
});

test("status labels come from the design boards", () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, v.label])),
    {
      applied: "已投递",
      interviewing: "面试机会",
      offer: "Offer",
      rejected: "已拒绝",
    },
  );
});

test("companyTint is deterministic per name", () => {
  const a = companyTint("Example Ltd");
  assert.deepEqual(companyTint("Example Ltd"), a);
  assert.ok(["tint", "tintInk"].every((key) => key in a));
});
