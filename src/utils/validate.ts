import { z } from "zod";
import type { ApplicationInput, Status } from "../types/domain.js";

/**
 * Application form validation (issue: validate with zod) — pure, no database.
 *
 * The schema is the single source of the rules the controllers and the tests
 * share. Raw form bodies arrive as strings; the preprocessors drop non-string
 * values instead of coercing them (a number in a text field is missing data,
 * not the string "42").
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** A required text field: non-string values are missing data, empty after
 *  trimming fails the check with the field's message. */
const requiredText = (message: string) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v : ""),
    z.string().trim().min(1, message),
  );

/** An optional text field: trims, empty → undefined (stored as NULL). */
const optionalText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() !== "" ? v : undefined),
  z
    .string()
    .transform((v) => v.trim())
    .optional(),
);

/** An optional date: real calendar dates only, so Postgres never rejects. */
const optionalDate = z.preprocess(
  (v) => (typeof v === "string" && ISO_DATE.test(v) ? v : undefined),
  z
    .string()
    .refine(
      (iso) => {
        const [year, month, day] = iso.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        return (
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day
        );
      },
      { message: "日期不存在" },
    )
    .optional(),
);

/** Status: unknown codes fall back to the default (the CHECK also guards). */
const status = z.preprocess(
  (v) => {
    const value = typeof v === "string" ? v : undefined;
    return ["applied", "interviewing", "offer", "rejected"].includes(value as string)
      ? value
      : undefined;
  },
  z.enum(["applied", "interviewing", "offer", "rejected"]).default("applied"),
);

const applicationSchema = z.object({
  company: requiredText("请填写公司名称"),
  title: requiredText("请填写职位名称"),
  status,
  interview_date: optionalDate,
  note: optionalText,
  posting_url: optionalText.refine(
    (url) => url === undefined || /^https?:\/\//i.test(url),
    { message: "请输入以 http:// 或 https:// 开头的链接" },
  )
  location: optionalText,
  salary: optionalText,
  deadline: optionalDate,
});

export type ParseResult =
  | { ok: true; value: ApplicationInput }
  | { ok: false; error: string };

export function parseApplicationInput(body: unknown): ParseResult {
  const result = applicationSchema.safeParse(body);
  if (result.success) {
    return {
      ok: true,
      value: {
        ...result.data,
        status: result.data.status as Status,
        interview_date: result.data.interview_date ?? null,
        note: result.data.note ?? null,
        posting_url: result.data.posting_url ?? null,
        location: result.data.location ?? null,
        salary: result.data.salary ?? null,
        deadline: result.data.deadline ?? null,
      },
    };
  }
  return { ok: false, error: result.error.issues[0]?.message ?? "表单校验失败" };
}
