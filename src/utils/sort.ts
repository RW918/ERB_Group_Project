/**
 * Dashboard list sorting.
 *
 * The sort key comes straight from `?sort=`; anything unknown — including
 * Object.prototype names such as `constructor` or `__proto__` — must fall back
 * to the default instead of being treated as a sort configuration.
 */

export interface ApplicationSort {
  column: string;
  order: "asc" | "desc";
}

const SORTS: Record<string, ApplicationSort> = {
  updated: { column: "a.updated_at", order: "desc" },
  deadline: { column: "j.deadline", order: "asc" },
  company: { column: "c.name", order: "asc" },
};

export function resolveApplicationSort(key: string | undefined): ApplicationSort {
  if (key !== undefined && Object.hasOwn(SORTS, key)) return SORTS[key];
  return SORTS.updated;
}
