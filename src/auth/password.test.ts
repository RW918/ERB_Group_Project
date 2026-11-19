import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "./password.js";

/** Issue 22 — the scrypt helpers, no database needed. */

test("hash format is scrypt$salt$key with the documented byte sizes", async () => {
  const hash = await hashPassword("admin123");
  assert.match(hash, /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
});

test("verifies the right password and rejects the wrong one", async () => {
  const hash = await hashPassword("admin123");
  assert.equal(await verifyPassword("admin123", hash), true);
  assert.equal(await verifyPassword("admin124", hash), false);
  assert.equal(await verifyPassword("admin123 ", hash), false);
});

test("equal passwords hash differently (per-hash salt)", async () => {
  const a = await hashPassword("same-password");
  const b = await hashPassword("same-password");
  assert.notEqual(a, b);
  assert.equal(await verifyPassword("same-password", a), true);
  assert.equal(await verifyPassword("same-password", b), true);
});

test("malformed stored hashes verify to false instead of throwing", async () => {
  assert.equal(await verifyPassword("x", "not-a-hash"), false);
  assert.equal(await verifyPassword("x", "md5$deadbeef$deadbeef"), false);
  assert.equal(await verifyPassword("x", "scrypt$nothex$nothex"), false);
});
