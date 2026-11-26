import { db } from "../db/client.js";
import { STATUSES, type ApplicationRow, type Status } from "../types/domain.js";
import type { SessionUser } from "../auth/session.js";
import type { ApplicationInput } from "../types/domain.js";
import { isValidId } from "../utils/ids.js";

/**
 * Application queries — the JOIN list, the GROUP BY counts, and ownership-based
 * CRUD. Companies and jobs are shared (find-or-create); applications are
 * personal: every write checks `user_id` even when the viewer can read across
 * users (docs/erd.md).
 */

export class NotFoundError extends Error {}
export class ForbiddenError extends Error {}
export class ValidationError extends Error {}

/** Reads follow permissions, writes never cross owners — the rubric's grant. */
function visibleTo(viewer: SessionUser) {
  const query = db("applications as a")
    .join("jobs as j", "j.id", "a.job_id")
    .join("companies as c", "c.id", "j.company_id")
    .join("users as u", "u.id", "a.user_id");
  if (!viewer.can_view_all_applications) query.where("a.user_id", viewer.id);
  return query;
}

const ROW_FIELDS = {
  id: "a.id",
  user_id: "a.user_id",
  job_id: "a.job_id",
  status: "a.status",
  interview_date: "a.interview_date",
  note: "a.note",
  created_at: "a.created_at",
  updated_at: "a.updated_at",
  company_id: "j.company_id",
  company_name: "c.name",
  title: "j.title",
  posting_url: "j.posting_url",
  location: "j.location",
  salary: "j.salary",
  deadline: "j.deadline",
  owner_username: "u.username",
};

export interface ListFilters {
  status?: string;
  q?: string;
  sort?: string;
}

const SORTS: Record<string, { column: string; order: "asc" | "desc" }> = {
  updated: { column: "a.updated_at", order: "desc" },
  deadline: { column: "j.deadline", order: "asc" },
  company: { column: "c.name", order: "asc" },
};

/** The dashboard list — user sees their own, view-all sees everyone's. */
export async function listApplications(
  viewer: SessionUser,
  filters: ListFilters = {},
): Promise<ApplicationRow[]> {
  const query = visibleTo(viewer).select(ROW_FIELDS);

  if (filters.status && STATUSES.includes(filters.status as Status)) {
    query.andWhere("a.status", filters.status);
  }
  if (filters.q) {
    const like = `%${filters.q}%`;
    query.andWhere((builder) =>
      builder.whereILike("c.name", like).orWhereILike("j.title", like),
    );
  }

  const sort = SORTS[filters.sort ?? "updated"] ?? SORTS.updated;
  query.orderBy(sort.column, sort.order);

  return query;
}

/** GROUP BY status — the numbers the filter chips and the page subtitle show. */
export async function countByStatus(viewer: SessionUser) {
  const rows: { status: Status; n: string | number }[] = await visibleTo(viewer)
    .select({ status: "a.status" })
    .count({ n: "a.id" })
    .groupBy("a.status");

  const counts: Record<"total" | Status, number> = {
    total: 0,
    applied: 0,
    interviewing: 0,
    offer: 0,
    rejected: 0,
  };
  for (const row of rows) {
    const n = Number(row.n);
    counts[row.status as Status] = n;
    counts.total += n;
  }
  return counts;
}

export async function getApplication(id: number, viewer: SessionUser) {
  if (!isValidId(id)) throw new NotFoundError("投递记录不存在");
  const row = await visibleTo(viewer).select(ROW_FIELDS).where("a.id", id).first();
  if (!row) throw new NotFoundError("投递记录不存在");
  return row as ApplicationRow;
}

function isUniqueViolation(error: unknown): boolean {
  return (error as { code?: string }).code === "23505";
}

async function findOrCreateCompany(name: string, trx: typeof db = db): Promise<number> {
  const existing = await trx("companies").where({ name }).first();
  if (existing) return existing.id;
  const [row] = await trx("companies")
    .insert({ name })
    .returning<{ id: number }[]>("id");
  return row.id;
}

/** A posting is stored once: same (company, title) pair reuses the job row. */
async function findOrCreateJob(
  trx: typeof db,
  companyId: number,
  title: string,
  input: ApplicationInput,
): Promise<number> {
  const existing = await trx("jobs")
    .where({ company_id: companyId, title })
    .first();
  if (existing) return existing.id;

  const [row] = await trx("jobs")
    .insert({
      company_id: companyId,
      title,
      posting_url: input.posting_url,
      location: input.location,
      salary: input.salary,
      deadline: input.deadline,
    })
    .returning<{ id: number }[]>("id");
  return row.id;
}

async function ownedApplication(id: number, viewer: SessionUser) {
  if (!isValidId(id)) throw new NotFoundError("投递记录不存在");
  const row = await db("applications").where({ id }).first();
  if (!row) throw new NotFoundError("投递记录不存在");
  if (row.user_id !== viewer.id) throw new ForbiddenError("只能修改自己的投递记录");
  return row;
}

export async function createApplication(
  viewer: SessionUser,
  input: ApplicationInput,
): Promise<number> {
  return db.transaction(async (trx) => {
    const companyId = await findOrCreateCompany(input.company);
    const jobId = await findOrCreateJob(trx, companyId, input.title, input);
    try {
      const [row] = await trx("applications")
        .insert({
          user_id: viewer.id,
          job_id: jobId,
          status: input.status,
          interview_date: input.interview_date,
          note: input.note,
        })
        .returning<{ id: number }[]>("id");
      return row.id;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ValidationError("你已经在跟踪这个职位了");
      }
      throw error;
    }
  });
}

export async function updateApplication(
  id: number,
  viewer: SessionUser,
  input: ApplicationInput,
): Promise<void> {
  const current = await ownedApplication(id, viewer);

  await db.transaction(async (trx) => {
    const companyId = await findOrCreateCompany(input.company, trx);
    const job = await trx("jobs").where({ id: current.job_id }).first();
    const repointed = job.company_id !== companyId || job.title !== input.title;

    let jobId = current.job_id;
    if (!repointed) {
      // Same posting: refresh the shared advert fields from the form.
      await trx("jobs")
        .where({ id: jobId })
        .update({
          posting_url: input.posting_url,
          location: input.location,
          salary: input.salary,
          deadline: input.deadline,
        });
    } else {
      jobId = await findOrCreateJob(trx, companyId, input.title, input);
    }

    try {
      await trx("applications")
        .where({ id })
        .update({
          job_id: jobId,
          status: input.status,
          interview_date: input.interview_date,
          note: input.note,
          updated_at: trx.fn.now(),
        });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ValidationError("你已经在跟踪这个职位了");
      }
      throw error;
    }
  });
}

/** Deleting an application leaves the shared job and other users' rows intact. */
export async function deleteApplication(id: number, viewer: SessionUser): Promise<void> {
  await ownedApplication(id, viewer);
  await db("applications").where({ id }).del();
}
