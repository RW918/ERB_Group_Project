import type { Knex } from "knex";
import { hashPassword } from "../src/auth/password.js";

/**
 * Demo accounts: one admin, two users. Passwords are printed in docs, not here.
 * Idempotent: existing usernames are left untouched.
 */
export const seed = async (knex: Knex) => {
  const roles = await knex("roles").select("id", "name");
  const roleId = Object.fromEntries(roles.map((r) => [r.name, r.id]));

  // Fallbacks are for local demos only. Set these in .env before exposing the app.
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD ?? "admin123";
  const userPassword = process.env.DEMO_USER_PASSWORD ?? "user123";

  const accounts = [
    { username: "admin", password: adminPassword, role: "admin" },
    { username: "alice", password: userPassword, role: "user" },
    { username: "bob", password: userPassword, role: "user" },
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
