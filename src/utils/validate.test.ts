import { test } from "node:test";
import assert from "node:assert/strict";
import { parseApplicationInput } from "./validate.js";

/** Issue 22 — the application form validator (pure). */

const ok = (body: Record<string, unknown>) => {
  const result = parseApplicationInput(body);
  assert.equal(result.ok, true);
  return result as Extract<typeof result, { ok: true }>;
};

const fail = (body: Record<string, unknown>) => {
  const result = parseApplicationInput(body);
  assert.equal(result.ok, false);
  return result as Extract<typeof result, { ok: false }>;
};

test("trims required fields and nulls empty optionals", () => {
  const value = ok({
    company: "  Example Ltd  ",
    title: " Junior Developer ",
    note: "   ",
    location: "",
    salary: "HKD 20k",
    posting_url: "https://example.com",
    interview_date: "2026-12-01",
    deadline: "2026-12-15",
  });
  assert.equal(value.value.company, "Example Ltd");
  assert.equal(value.value.title, "Junior Developer");
  assert.equal(value.value.note, null);
  assert.equal(value.value.location, null);
  assert.equal(value.value.salary, "HKD 20k");
  assert.equal(value.value.interview_date, "2026-12-01");
  assert.equal(value.value.deadline, "2026-12-15");
});

test("defaults the status to applied and rejects unknown codes", () => {
  assert.equal(ok({ company: "A", title: "B" }).value.status, "applied");
  assert.equal(ok({ company: "A", title: "B", status: "offer" }).value.status, "offer");
  assert.equal(
    ok({ company: "A", title: "B", status: "hired" }).value.status,
    "applied",
  );
});

test("company and title are required", () => {
  assert.match(fail({}).error, /公司名称/);
  assert.match(fail({ company: "Example Ltd" }).error, /职位名称/);
  assert.match(fail({ company: "   ", title: "x" }).error, /公司名称/);
});

test("dates must be real ISO yyyy-mm-dd or empty", () => {
  assert.equal(ok({ company: "A", title: "B", deadline: "15/12/2026" }).value.deadline, null);
  assert.equal(ok({ company: "A", title: "B", deadline: "2026-13-01" }).value.deadline, null);
  assert.equal(ok({ company: "A", title: "B", deadline: "2026-02-30" }).value.deadline, null);
  assert.equal(
    ok({ company: "A", title: "B", interview_date: "2026-02-28" }).value.interview_date,
    "2026-02-28",
  );
});

test("non-string values are ignored, not coerced", () => {
  const value = ok({ company: "A", title: "B", note: 42 });
  assert.equal(value.value.note, null);
});
