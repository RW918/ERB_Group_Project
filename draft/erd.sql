-- JobTrack schema — readable DDL mirror of the Knex migrations.
-- PostgreSQL. Source for the ERD PNG; the executable source is migrations/.
--
-- Verified 2026-11-26: this file and `npm run migrate` produce the same
-- schema on fresh databases — column order, types, nullability, defaults,
-- constraint and index names, PK/FK/UNIQUE/CHECK, and the index set.
-- The migration additionally sets COMMENT ON COLUMN metadata.
--
-- Constraint and index names are written explicitly so this file never needs
-- a rename step; they match the Knex migrations' `*_unique` / `*_foreign`
-- names. The ERD generator renders PK/FK markers from the inline keys.
--
-- Seed rule: the admin role carries both permissions; the user role carries neither.
-- Exactly one admin account is seeded, so "who can grant" is answerable on day one.
--
-- Shape: companies 1—n jobs 1—n applications n—1 users.
-- `applications` is the join table between users and jobs (m:n), carrying the
-- per-user state (status, interview date, note). A posting is stored once.

CREATE TABLE roles (
  id                        SERIAL PRIMARY KEY,
  name                      VARCHAR(20) NOT NULL,           -- 'user' | 'admin'
  can_view_all_applications BOOLEAN NOT NULL DEFAULT FALSE,
  can_manage_users          BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT roles_name_unique UNIQUE (name)
);

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) NOT NULL,
  password_hash TEXT NOT NULL,                              -- crypto.scrypt
  role_id       INTEGER NOT NULL,                           -- every user holds exactly one role
  created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Per-user overrides (nullable): NULL falls back to the role's permission,
  -- so /admin/users can grant or revoke per account without touching the role.
  can_view_all_applications BOOLEAN NULL DEFAULT NULL,
  can_manage_users          BOOLEAN NULL DEFAULT NULL,
  CONSTRAINT users_username_unique UNIQUE (username),
  CONSTRAINT users_role_id_foreign FOREIGN KEY (role_id) REFERENCES roles (id)
);

CREATE TABLE companies (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,                         -- find-or-create on job creation
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT companies_name_unique UNIQUE (name)
);

-- The advert itself: shared, so two users applying to the same posting point at
-- one row instead of duplicating its URL, salary and deadline.
CREATE TABLE jobs (
  id          SERIAL PRIMARY KEY,
  company_id  INTEGER NOT NULL,
  title       VARCHAR(100) NOT NULL,
  posting_url TEXT NULL,                                    -- original job advert
  location    VARCHAR(100) NULL,                            -- city / remote
  salary      VARCHAR(100) NULL,                            -- free text, as advertised
  deadline    DATE NULL,                                    -- submission deadline
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT jobs_company_id_foreign FOREIGN KEY (company_id) REFERENCES companies (id)
);

-- One row per (user, job): the user's own track of that posting.
CREATE TABLE applications (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL,
  job_id         INTEGER NOT NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'applied',
  interview_date DATE,
  note           TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, -- refreshed on every UPDATE
  CONSTRAINT applications_user_id_foreign FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT applications_job_id_foreign FOREIGN KEY (job_id)
    REFERENCES jobs (id) ON DELETE CASCADE,
  CONSTRAINT applications_status_check
    CHECK (status IN ('applied', 'interviewing', 'offer', 'rejected')),
  CONSTRAINT applications_user_job_unique UNIQUE (user_id, job_id) -- apply once per posting
);

CREATE INDEX jobs_company_id_idx         ON jobs (company_id);
CREATE INDEX applications_user_id_idx    ON applications (user_id);
CREATE INDEX applications_job_id_idx     ON applications (job_id);
CREATE INDEX applications_status_idx     ON applications (status);
