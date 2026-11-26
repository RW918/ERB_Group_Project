import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidId, parseId } from "./ids.js";

/** Issue 54 — bad url ids are a 404, not a database error. */

test("parses decimal positive route ids", () => {
  assert.equal(parseId("1"), 1);
  assert.equal(parseId("42"), 42);
  assert.equal(parseId("0007"), 7);
  assert.equal(parseId(String(2147483647)), 2147483647);
});

test("rejects non-numeric and out-of-range ids", () => {
  const bad = [
    "abc",
    "1.5",
    "1e3",
    "-1",
    "0",
    "",
    " 1 ",
    "1 ",
    "2147483648",
    "１２",
  ];
  for (const raw of bad) {
    assert.equal(parseId(raw), null, `expected ${JSON.stringify(raw)} to be rejected`);
  }
});

test("rejects non-string query values", () => {
  assert.equal(parseId(undefined), null);
  assert.equal(parseId(["1"]), null);
  assert.equal(parseId(1), null);
});

test("isValidId mirrors the int4 range", () => {
  assert.equal(isValidId(1), true);
  assert.equal(isValidId(1.5), false);
  assert.equal(isValidId(0), false);
  assert.equal(isValidId(-1), false);
  assert.equal(isValidId(2147483648), false);
});
