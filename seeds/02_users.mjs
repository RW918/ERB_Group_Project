import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

// Must match src/auth/password.ts — format: scrypt$<saltHex>$<keyHex>
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = /** @type {Buffer} */ (await scrypt(password, salt, 64));
  return `scrypt$${salt}$${key.toString("hex")}`;
}

/**
 * Demo accounts: one admin, two users. Passwords are printed in docs, not here.
 * Idempotent: existing usernames are left untouched.
 */
export const seed = async (knex) => {
  const roles = await knex("roles").select("id", "name");
  const roleId = Object.fromEntries(roles.map((r) => [r.name, r.id]));

  const accounts = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "alice", password: "user123", role: "user" },
    { username: "bob", password: "user123", role: "user" },
  ];

  for (const account of accounts) {
    const existing = await knex("users").where({ username: account.username }).first();
    if (existing) continue;

    await knex("users").insert({
      username: account.username,
      password_hash: await hashPassword(account.password),
      role_id: roleId[account.role],
    });
  }
};
