import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveApplicationSort } from "./sort.js";

/** Issue: malformed `?sort=` must not reach knex as an undefined column. */

test("resolves the documented sort keys", () => {
  assert.deepEqual(resolveApplicationSort("updated"), {
    column: "a.updated_at",
    order: "desc",
  });
  assert.deepEqual(resolveApplicationSort("deadline"), {
    column: "j.deadline",
    order: "asc",
  });
  assert.deepEqual(resolveApplicationSort("company"), {
    column: "c.name",
    order: "asc",
  });
});

test("unknown and prototype keys fall back to updated", () => {
  const fallback = { column: "a.updated_at", order: "desc" };
  for (const key of [
    undefined,
    "",
    "nope",
    "constructor",
    "toString",
    "hasOwnProperty",
    "__proto__",
  ]) {
    assert.deepEqual(resolveApplicationSort(key), fallback, `key ${String(key)}`);
  }
});
