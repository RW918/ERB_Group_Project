import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Password hashing for the seeded demo accounts and the local strategy.
 *
 * Format: `scrypt$<salt hex>$<key hex>` (see docs/erd.md). scrypt with a random
 * 16-byte salt and a 64-byte key; verification compares with timingSafeEqual so
 * the comparison does not leak how many leading bytes matched.
 */
const scryptKey = promisify(scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;

const SALT_BYTES = 16;
const KEY_BYTES = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await scryptKey(password, salt, KEY_BYTES);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, keyHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  // Wrong-length stored keys are corrupt data, not a password mismatch —
  // timingSafeEqual would throw on the length mismatch.
  if (expected.length !== KEY_BYTES) return false;
  const key = await scryptKey(password, Buffer.from(saltHex, "hex"), KEY_BYTES);
  return timingSafeEqual(key, expected);
}
