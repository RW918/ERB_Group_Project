# Final verification — main from a fresh clone (issue 28)

Checked on 2026-11-19 at commit `0d17db0`, as a plain clone into an empty
directory (no working tree, no node_modules, no `.env`):

| Step | Command | Result |
|---|---|---|
| Clone | `git clone RW918/ERB_Group_Project` | ✅ |
| Install | `npm ci` | ✅ 0 vulnerabilities |
| Type-check + build | `npm run build` | ✅ clean `tsc` |
| Schema | `npm run migrate` (already-migrated DB) | ✅ "Already up to date" |
| Demo data | `npm run seed` | ✅ 5 idempotent seed files |
| Boot | `npm start` (with `.env` copied from the example) | ✅ listens |
| Health | `GET /health` | ✅ 200 |
| Demo account | alice / user123 login | ✅ 302 → `/` |
| Dashboard | `GET /` | ✅ 200, seeded cards render |
| Guard | logged-out `GET /admin/users` | ✅ 302 → `/login` |

## Merge history (rubric A)

Every change landed as a squashed PR, so `git log` on main reads as the PR
story — subject carries the issue scope, body carries the checklist and the
`Closes #n` link:

```
0d17db0 docs: 23/11 demo script per lane, with fallback and Q&A answers (#42)
55977d3 docs: record the full QA pass (issue 25) (#41)
a1eab06 docs: re-export the four synced boards and both overviews (#40)
66f2f2f docs: regenerate the ERD from erd.sql (issue 27) (#39)
106027c docs: Postman collection for every route (issue 23) (#38)
eaca166 test: unit tests for the pure helpers; CI runs them (#37)
9a15074 theme: dark theme from the Penpot palette, user preference + toggle (#36)
183a5c2 admin: /admin/users grants, gzip, POST logout, generated icons (#34)
9573b5f applications: real dashboard and detail, CRUD, stats, AJAX delete (#33)
6d1c0bd auth: passport login/logout and effective-permission guards (#32)
34677f6 schema: permission overrides, concise migration, full demo seed (#31)
bc2f365 design: dark theme, AA contrast pass and aligned layout (#30)
… (the whole design phase, #29 and earlier)
```

PRs #30–#42 are all squash-merged into main with green CI.

## Code style (issue 26)

- Layout: `routes → controllers → services → db`, guards in `middleware/`,
  pure helpers in `utils/`, views named after routes (`applications/`,
  `admin/`) — per `docs/lanes.md`.
- Naming follows `CONTEXT.md` (application / position / status / company);
  one deliberate exception: the table the ERD and migration call `jobs`
  predates the glossary's "avoid job" note — renaming a live table before
  the presentation buys churn, not marks, so it stays and the glossary note
  stands.
- Dead code removed along the way: the prototype router and its views, the
  Bootstrap navbar + hello page, the unused bootstrap bundle script, the
  four-card KPI styles, `.check` / `.btn-jt-quiet`, and two unused icons.
- `tsconfig` runs `strict`; `npm run build` is clean; `npm test` green (15).
