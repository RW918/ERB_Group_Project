import type { RequestHandler } from "express";
import {
  countByStatus,
  createApplication,
  deleteApplication,
  ForbiddenError,
  getApplication,
  listApplications,
  NotFoundError,
  updateApplication,
  ValidationError,
} from "../services/applications.js";
import { parseApplicationInput } from "../utils/validate.js";
import { parseId } from "../utils/ids.js";
import {
  companyTint,
  daysLeft,
  formatTimestamp,
  shortDate,
  STATUS_META,
  toISODate,
} from "../utils/format.js";
import type { ApplicationRow, Status } from "../types/domain.js";
import type { SessionUser } from "../auth/session.js";

/**
 * Page handlers for the dashboard and the detail screen, plus the JSON delete
 * endpoint the AJAX confirm dialog calls.
 *
 * Views receive decorated rows: display labels, short dates, the days-left
 * badge and the logo tint are computed here so the templates stay dumb.
 */

interface Decorated extends ApplicationRow {
  statusLabel: string;
  statusClass: string;
  initial: string;
  tint: string;
  tintInk: string;
  deadlineISO: string | null;
  deadlineLabel: string | null;
  daysLeft: number | null;
  interviewISO: string | null;
  interviewLabel: string | null;
  createdLabel: string | null;
  updatedLabel: string | null;
  sourceLabel: string;
  isOwner: boolean;
}

function decorate(row: ApplicationRow, viewer: SessionUser): Decorated {
  const meta = STATUS_META[row.status as Status];
  const deadlineISO = toISODate(row.deadline);
  const interviewISO = toISODate(row.interview_date);
  const { tint, tintInk } = companyTint(row.company_name);
  return {
    ...row,
    statusLabel: meta.label,
    statusClass: meta.cls,
    initial: row.company_name.slice(0, 1).toUpperCase(),
    tint,
    tintInk,
    deadlineISO,
    deadlineLabel: deadlineISO ? shortDate(deadlineISO) : null,
    daysLeft: deadlineISO ? daysLeft(deadlineISO) : null,
    interviewISO,
    interviewLabel: interviewISO ? shortDate(interviewISO) : null,
    createdLabel: formatTimestamp(row.created_at),
    updatedLabel: formatTimestamp(row.updated_at),
    sourceLabel: row.posting_url ? hostLabel(row.posting_url) : "手动录入",
    isOwner: row.user_id === viewer.id,
  };
}

/** The host of the posting URL, shown as 来源 on the detail page. */
function hostLabel(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

const SORT_OPTIONS = [
  { value: "updated", label: "最近更新" },
  { value: "deadline", label: "最早截止" },
  { value: "company", label: "公司名称" },
];

/** GET / — the dashboard, optionally filtered, searched, sorted, with modal. */
export const dashboard: RequestHandler = async (req, res, next) => {
  try {
    const viewer = req.user!;
    const filters = {
      status: typeof req.query.status === "string" ? req.query.status : undefined,
      q: typeof req.query.q === "string" ? req.query.q : undefined,
      sort: typeof req.query.sort === "string" ? req.query.sort : undefined,
    };

    const [rows, counts] = await Promise.all([
      listApplications(viewer, filters),
      countByStatus(viewer),
    ]);

    // The add/edit modal is opened with ?modal=1 (new) or ?modal=1&id=N (edit).
    // An id that is present but malformed is a bad URL (404), not "new" (issue 54).
    let modal: { editing: boolean; m: Decorated | null } | null = null;
    if (req.query.modal === "1") {
      if (req.query.id === undefined) {
        modal = { editing: false, m: null };
      } else {
        const editId = parseId(req.query.id);
        if (editId === null) {
          return res.status(404).render("not-found", { user: viewer });
        }
        const m = decorate(await getApplication(editId, viewer), viewer);
        if (!m.isOwner) {
          return res.status(403).render("forbidden", { user: viewer });
        }
        modal = { editing: true, m };
      }
    }

    res.render("applications/index", {
      title: "投递看板",
      active: "dashboard",
      user: viewer,
      apps: rows.map((row) => decorate(row, viewer)),
      counts,
      filters,
      sortOptions: SORT_OPTIONS,
      statusMeta: STATUS_META,
      modal,
      formError: typeof req.query.error === "string" ? req.query.error : null,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).render("not-found", { user: req.user });
    }
    next(error);
  }
};

/** GET /applications/:id — the detail screen. */
export const show: RequestHandler = async (req, res, next) => {
  try {
    const viewer = req.user!;
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(404).render("not-found", { user: viewer });
    }
    const row = await getApplication(id, viewer);
    res.render("applications/detail", {
      title: "投递详情",
      active: "dashboard",
      user: viewer,
      app: decorate(row, viewer),
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).render("not-found", { user: req.user });
    }
    next(error);
  }
};

/** POST /applications — create from the dashboard dialog. */
export const create: RequestHandler = async (req, res, next) => {
  try {
    const viewer = req.user!;
    const parsed = parseApplicationInput(req.body as Record<string, unknown>);
    if (!parsed.ok) {
      return res.redirect(`/?modal=1&mode=new&error=${encodeURIComponent(parsed.error)}`);
    }
    try {
      await createApplication(viewer, parsed.value);
    } catch (serviceError) {
      if (serviceError instanceof ValidationError) {
        const message = encodeURIComponent(serviceError.message);
        return res.redirect(`/?modal=1&mode=new&error=${message}`);
      }
      throw serviceError;
    }
    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

/** POST /applications/:id — update from the dashboard dialog. */
export const update: RequestHandler = async (req, res, next) => {
  try {
    const viewer = req.user!;
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(404).render("not-found", { user: viewer });
    }
    const parsed = parseApplicationInput(req.body as Record<string, unknown>);
    if (!parsed.ok) {
      return res.redirect(`/?modal=1&id=${id}&error=${encodeURIComponent(parsed.error)}`);
    }
    try {
      await updateApplication(id, viewer, parsed.value);
    } catch (serviceError) {
      if (serviceError instanceof NotFoundError) {
        return res.status(404).render("not-found", { user: viewer });
      }
      if (serviceError instanceof ForbiddenError) {
        return res.status(403).render("forbidden", { user: viewer });
      }
      if (serviceError instanceof ValidationError) {
        const message = encodeURIComponent(serviceError.message);
        return res.redirect(`/?modal=1&id=${id}&error=${message}`);
      }
      throw serviceError;
    }
    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

/** DELETE /applications/:id — AJAX delete; removes the card without a reload. */
export const destroy: RequestHandler = async (req, res, next) => {
  try {
    const viewer = req.user!;
    const id = parseId(req.params.id);
    if (id === null) return res.status(404).json({ ok: false, error: "投递记录不存在" });
    await deleteApplication(id, viewer);
    res.json({ ok: true });
  } catch (error) {
    if (error instanceof NotFoundError) return res.status(404).json({ ok: false, error: "投递记录不存在" });
    if (error instanceof ForbiddenError) return res.status(403).json({ ok: false, error: "只能修改自己的投递记录" });
    next(error);
  }
};
