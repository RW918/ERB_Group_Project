# JobTrack

A job-application tracker. Each user keeps their own applications through a
submission → interview → offer/rejected pipeline; a privileged role can see every
user's applications and manage who holds which role.

## Stack

| Layer | Choice |
|---|---|
| Language | TypeScript (ESM, `tsc` → `dist/`) |
| Server | Express 5 |
| Views | EJS + Bootstrap 5 |
| Auth | Passport (local) + express-session, `crypto.scrypt` hashing |
| Data | Knex 3 + PostgreSQL |
| Tests | `node:test` + `node:assert` |

## Setup

```bash
npm install
cp .env.example .env      # then set DATABASE_URL (Neon) or the PG* variables
npm run migrate
npm run seed
npm run dev               # http://localhost:3000
```

`npm run build && npm start` runs the compiled output from `dist/`.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | `tsx watch` on `src/server.ts` |
| `npm run build` | `tsc`, then copies views into `dist/` |
| `npm start` | runs `dist/server.js` |
| `npm run migrate` | `knex migrate:latest` with `.env` loaded |
| `npm run migrate:make <name>` | new migration |
| `npm run migrate:rollback` | roll back the last batch |
| `npm run seed` / `npm run seed:make` | run / create seeds |
| `npm test` | `node --test` via `tsx` |
| `npm run vendor` | copies Bootstrap into `public/vendor/` (also runs on install) |

## Demo accounts

Seeded by `npm run seed`:

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | admin — sees all applications, manages users |
| `alice` | `user123` | user — owns the sample applications |
| `bob` | `user123` | user — empty list, proves the ownership filter |

## Where things live

- `draft/erd.sql` — schema, single source of truth for the ERD and migrations
- `draft/` — the two graded artifacts (P1 wireframe, P2 ERD)
- `migrations/`, `seeds/` — ESM `.mjs`, loaded by Knex via `import()`
- `src/` — application code
- `CONTEXT.md` — domain glossary; read this before naming anything
- `docs/scope.md` — assessment map and syllabus coverage
- `docs/lanes.md` — who owns which files
- `materials/` — course PDFs (git-ignored)
