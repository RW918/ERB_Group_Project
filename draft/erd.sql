-- JobTrack schema — single source of truth for the ERD and the migrations.
-- PostgreSQL. Source for the DrawSQL diagram and for the Knex migrations.
--
-- Seed rule: the admin role carries both permissions; the user role carries neither.
-- Exactly one admin account is seeded, so "who can grant" is answerable on day one.

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
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE companies (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,                  -- find-or-create on application submit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE applications (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  company_id     INTEGER NOT NULL REFERENCES companies (id),
  position       VARCHAR(100) NOT NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'applied'
                 CHECK (status IN ('applied', 'interviewing', 'offer', 'rejected')),
  interview_date DATE,
  note           TEXT,
  posting_url    TEXT NULL,                                 -- original job advert
  location       VARCHAR(100) NULL,                         -- city / remote
  salary         VARCHAR(100) NULL,                         -- free text, as advertised
  deadline       DATE NULL,                                 -- submission deadline
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX applications_user_id_idx    ON applications (user_id);
CREATE INDEX applications_company_id_idx ON applications (company_id);
CREATE INDEX applications_status_idx     ON applications (status);
