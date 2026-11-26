-- JobTrack schema — readable DDL mirror of the Knex migrations.
-- PostgreSQL. Source for the ERD PNG; the executable source is migrations/.
--
-- Verified 2026-11-26: both this file and `npm run migrate` were applied to
-- fresh databases and introspected with DBX. Column types, nullability,
-- defaults, PK/FK/UNIQUE/CHECK and the index set match. The remaining
-- differences are cosmetic: the migrations append users' override columns
-- after created_at (this file groups them with the permission fields), the
-- migration adds COMMENT ON metadata, and constraint/index names differ
-- (`*_foreign`/`*_unique` vs Postgres' `*_fkey`/`*_key` defaults).
--
-- Seed rule: the admin role carries both permissions; the user role carries neither.
-- Exactly one admin account is seeded, so "who can grant" is answerable on day one.
--
-- Shape: companies 1—n jobs 1—n applications n—1 users.
-- `applications` is the join table between users and jobs (m:n), carrying the
-- per-user state (status, interview date, note). A posting is stored once.

CREATE TABLE roles (
  id                        SERIAL PRIMARY KEY,
  name                      VARCHAR(20) NOT NULL UNIQUE,   -- 'user' | 'admin'
  can_view_all_applications BOOLEAN NOT NULL DEFAULT FALSE,
  can_manage_users          BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,                              -- crypto.scrypt
  role_id       INTEGER NOT NULL REFERENCES roles (id),     -- every user holds exactly one role
  -- Per-user overrides (nullable): NULL falls back to the role's permission,
  -- so /admin/users can grant or revoke per account without touching the role.
  can_view_all_applications BOOLEAN NULL DEFAULT NULL,
  can_manage_users          BOOLEAN NULL DEFAULT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE companies (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,                  -- find-or-create on job creation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The advert itself: shared, so two users applying to the same posting point at
-- one row instead of duplicating its URL, salary and deadline.
CREATE TABLE jobs (
  id          SERIAL PRIMARY KEY,
  company_id  INTEGER NOT NULL REFERENCES companies (id),
  title       VARCHAR(100) NOT NULL,
  posting_url TEXT NULL,                                    -- original job advert
  location    VARCHAR(100) NULL,                            -- city / remote
  salary      VARCHAR(100) NULL,                            -- free text, as advertised
  deadline    DATE NULL,                                    -- submission deadline
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One row per (user, job): the user's own track of that posting.
CREATE TABLE applications (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  job_id         INTEGER NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
  status         VARCHAR(20) NOT NULL DEFAULT 'applied'
                 CHECK (status IN ('applied', 'interviewing', 'offer', 'rejected')),
  interview_date DATE,
  note           TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),          -- refreshed on every UPDATE
  UNIQUE (user_id, job_id)                                  -- apply once per posting
);

CREATE INDEX jobs_company_id_idx         ON jobs (company_id);
CREATE INDEX applications_user_id_idx    ON applications (user_id);
CREATE INDEX applications_job_id_idx     ON applications (job_id);
CREATE INDEX applications_status_idx     ON applications (status);
