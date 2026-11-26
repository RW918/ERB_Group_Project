import { z } from "zod";

/**
 * Route and query ids (issue 54).
 *
 * `/applications/abc` must read as "not found", never reach the database as
 * NaN. Ids are decimal positive integers within the Postgres int4 range; any
 * other shape is rejected here so handlers can render the 404 page before a
 * query is attempted.
 */

const INT4_MAX = 2147483647;

/** The one id rule shared by the URL parser and the service guard. */
const idNumber = z.number().int().positive().max(INT4_MAX);

/** URL ids arrive as strings: digits only, then the numeric rule. */
const idString = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(idNumber);

export function isValidId(id: number): boolean {
  return idNumber.safeParse(id).success;
}

/** Parse a raw route/query id. Null means "not an id" — the caller renders 404. */
export function parseId(raw: unknown): number | null {
  const result = idString.safeParse(raw);
  return result.success ? result.data : null;
}
