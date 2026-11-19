# Lanes — three people, three merge seams

Rubric A pays for **merges that happened**, and rubric C pays for a file structure
a marker can follow. Both come from the same thing: each lane owns whole files so
two people never edit the same one.

| Lane | Owner | Owns | Can start without waiting on |
|---|---|---|---|
| **1. Auth & access** | *slot: teammate A* | `src/auth/` (passport strategy, scrypt helpers, session config), `src/middleware/` (requireAuth, requirePermission), `src/routes/admin.ts`, `src/controllers/admin.ts`, `src/views/admin/`, `db/seeds/*roles*` | passport + session skeleton against seeded users |
| **2. Applications** | *slot: teammate B* | `src/routes/applications.ts`, `src/controllers/applications.ts`, `src/services/companies.ts` (find-or-create), `src/types/domain.ts` (`Status`), `migrations/` (schema steward) | schema from `draft/erd.sql`, CRUD against seeded rows |
| **3. Views & assets** | *slot: you* | `src/views/layout.ejs`, `partials/`, `public/css/`, `public/js/` (Bootstrap 5, AJAX delete), `draft/JobTrack_Wireframe_P1.*`, `docs/presentation/` | static HTML mocks of every screen |

## Rules that keep the seams clean

- **One schema steward** (lane 2). Nobody else writes a migration; schema changes
  arrive as a PR comment on `draft/erd.sql` first.
- **Routes are registered by file**, one router per lane, mounted in `app.ts`.
  Adding a route never edits another lane's file.
- **Views are named after routes** (`views/admin/users.ejs`, `views/applications/index.ejs`)
  so a view change follows the route's owner.
- **Branches**: `<lane>/<topic>` — `auth/admin-users`, `apps/find-or-create-company`,
  `views/responsive-list`. Merge by PR into `main`, at least one merged PR per lane
  per working session, so the history shows merges rather than three long branches.
- **Commits**: Conventional Commits v1.0.0 — `type(scope): subject`. The spec
  mandates a type (a noun), an optional scope, the colon+space and a short
  description; `feat`/`fix` carry MUST semantics (SemVer MINOR/PATCH), and
  breaking changes use `!` or a `BREAKING CHANGE:` footer. Our type list
  (`feat fix docs style refactor perf test build ci chore revert`) follows the
  commitlint/Angular recommendation — the spec itself permits other types — and
  the ≤72-char subject is a repo convention. The `commit-msg` hook enforces all
  of it.
- **PR or direct main**: PRs are for large changes (new features, multi-file
  refactors, schema or design work) — they carry the checklist and the
  discussion. Small changes (docs, single-file fixes, hotfixes) land directly
  on `main` with a Conventional Commit. Either way: `npm run build` +
  `npm test` green before pushing, and a direct main commit leans on its
  message as the whole history entry (there is no PR title to lean on).
- **Presentation**: one section per lane, ~3 minutes each, plus one person opening
  (problem → demo) and one closing (schema → what's next).

## Placeholders to fill when you know them

- Teammate A — name, comfort with Passport vs forms, available days
- Teammate B — name, comfort with SQL/Knex vs CSS, available days
- Who presents the ERD (rubric J: every member must speak)
