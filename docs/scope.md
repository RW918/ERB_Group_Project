# Scope — assessment map and syllabus coverage

Reference sheet for the course project, not a spec. Facts here come from
`軟件及人工智能應用程式開發人員證書_持續評估_專題項目_草擬本.pdf` (rubric) and
`Full_Stack_Course_Slides_Ch2-4.4.pdf` (syllabus).

## Assessment shape

- Two parts, 100 marks each, 200 total; **100 to pass**; 20% of the course.
- Groups of 2–3.
- Part 1 = Unit 3 (Advanced Web Server Development). Part 2 = Unit 4 (Backend Development).
- Both parts judge the **same application**. The two rubrics differ in only two lines:
  Part 1 E is "database table structures", Part 1 F names **grant**; Part 2 E is "ERD", Part 2 F is plain CRUD.
- Deliverables due **before code**: P1 wireframe, P2 ERD, P3 board, Git repo URL.

## Mark map

| Item | Per part | Total | Evidence we produce |
|---|---:|---:|---|
| A. Git | 5 | 10 | one repo, branches, real merges |
| B. Syntax | 5 | 10 | `npm start` runs clean |
| C. Style | 10 | 20 | consistent file layout, naming, no spaghetti |
| D. Wireframe | 10 | 20 | P1 kept in step with the build (top band needs "followed or updated") |
| E. Database | 10 | 20 | P2 ERD kept in step with migrations |
| F. Functionality | 20 | **40** | CRUD **+** grant, bug-free |
| G. User-friendliness | 10 | 20 | every implemented flow works |
| H. Mobile responsiveness | 10 | 20 | Bootstrap 5 layout at phone width |
| I. Presentation flow | 10 | 20 | scripted demo |
| J. Participation | 10 | 20 | every member speaks |

Functionality (40) and the two document items (40) are the largest blocks after presentation (40).

## Syllabus coverage

| Ch | Topic | Covered by |
|---|---|---|
| 3.1 | Node, npm | `package.json` scripts |
| 3.2 | TypeScript | the whole app: `src/` → `tsc` → `dist/`, `npm run build` is rubric B |
| 3.3 | HTTP, REST, Postman | REST-shaped routes + a Postman collection |
| 3.4 | Promises, async/await | async controllers |
| 3.5 | Express, routers/controllers, middleware, EJS, sessions, `.env` | `routes/`, `controllers/`, `views/`, `express-session`, `node --env-file` |
| 3.6 | Forms, AJAX, dynamic web apps | form POST + AJAX delete |
| 3.7.1 | Passport, passport-local | authentication |
| 3.7.2 | hashing/salt, JWT | `crypto.scrypt` + `timingSafeEqual`; **no JWT** (sessions chosen) |
| 3.7.3 | configurable RBAC | `roles` + boolean permissions + guard middleware; `/admin/users` |
| 4.1 | framework survey | n/a (conceptual) |
| 4.2 | testing with `assert` | `node:test` + `node:assert` on pure helpers |
| 4.3.1–4.3.8 | CRUD, SELECT, WHERE, subquery, CASE, aggregation/GROUP BY, PK/FK, joins | schema + `JOIN` list query + `GROUP BY` stats |
| 4.4 | PostgreSQL + Knex, migrations, seeds | Knex 3.3 (bundled types) + `pg`: `migrate:make`, `migrate:latest`, `seed:run` |

## Deliverable status

| Artifact | State | Needs |
|---|---|---|
| P1 wireframe | `draft/JobTrack_Wireframe_P1.png` v3 | v4: `/admin/users`, company as text input, and the four posting-detail fields |
| P2 ERD | `draft/JobTrack_ERD_P2.png` v2 (stale) | regenerate from `draft/erd.sql` if submitting the original image; `draft/JobTrack_ERD_P3.png` is current |
| P3 board | not seen | create to the project template |
| Git | 3 people (you + 2 teammates); lanes in `docs/lanes.md` | branches + merged PRs from the baseline; rubric A pays only for real merges |

## Known debts

- **Wireframe v3 is behind the schema**: it has no `/admin/users`, no free-text company, and no posting URL / location / salary / deadline fields. Rubric D pays full marks only for a wireframe kept in step.
- No live database yet: `DATABASE_URL` is unset, so `npm run migrate` and `npm run seed` have not been exercised against Postgres.
- No CI workflow yet; only the local pre-commit hook.
- ADR still owed for the Drizzle → Knex + TS decision (hand-written domain types vs schema-inferred).
