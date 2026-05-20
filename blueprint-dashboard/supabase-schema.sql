-- ============================================================================
-- Rockcrete USA Blueprint Dashboard — Supabase Database Schema
-- ============================================================================
-- Run this SQL in the Supabase SQL Editor to create all tables.
-- After running, set these env vars in Vercel:
--   SUPABASE_URL = https://your-project.supabase.co
--   SUPABASE_SERVICE_KEY = eyJ... (service_role key, not anon key)
--   SESSION_SECRET = (a strong random string for cookie signing)
-- ============================================================================

-- ── USERS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  display_name  TEXT DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'client',
  avatar        TEXT,
  phone         TEXT DEFAULT '',
  title         TEXT DEFAULT '',
  organization  TEXT DEFAULT '',
  preferences   JSONB DEFAULT '{"language":"en","theme":"auto"}',
  module_access JSONB DEFAULT '{}',
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  created_by    TEXT DEFAULT 'system',
  status        TEXT DEFAULT 'active',
  invited_by    TEXT,
  temp_password BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);

-- ── TEAMS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS teams (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_by  TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── TEAM MEMBERS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS team_members (
  id        TEXT PRIMARY KEY,
  team_id   TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position  TEXT DEFAULT '',        -- Custom position/role title within team
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members (team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members (user_id);

-- ── TASKS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  status      TEXT DEFAULT 'not_started',
  priority    TEXT DEFAULT 'medium',
  assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  team_id     TEXT REFERENCES teams(id) ON DELETE SET NULL,
  due_date    DATE,
  phase       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  created_by  TEXT
);

CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks (assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_team     ON tasks (team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status   ON tasks (status);

-- ── MILESTONES ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS milestones (
  id           TEXT PRIMARY KEY,
  task_id      TEXT NOT NULL,
  title        TEXT NOT NULL,
  order_num    INTEGER DEFAULT 0,
  status       TEXT DEFAULT 'not-started',
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  notes        TEXT DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestones_task ON milestones (task_id);

-- ── PROGRESS UPDATES ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS progress_updates (
  id              TEXT PRIMARY KEY,
  task_id         TEXT NOT NULL,
  milestone_id    TEXT,
  submitted_by    TEXT DEFAULT '',
  role            TEXT DEFAULT 'webdev',
  type            TEXT DEFAULT 'note',
  message         TEXT DEFAULT '',
  previous_status TEXT,
  new_status      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_task ON progress_updates (task_id);
CREATE INDEX IF NOT EXISTS idx_progress_created ON progress_updates (created_at DESC);

-- ── TRACKER STATE ──────────────────────────────────────────────────────────
-- Stores per-task runtime state (status, comments, assignee, etc.)

CREATE TABLE IF NOT EXISTS tracker_state (
  task_id    TEXT PRIMARY KEY,
  state_data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SETTINGS ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS settings (
  id              INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  email_config    JSONB DEFAULT '{}',
  system_config   JSONB DEFAULT '{}',
  branding_config JSONB DEFAULT '{}',
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO settings (id, email_config, system_config, branding_config)
VALUES (1,
  '{"fromName":"Rockcrete USA Blueprint","fromEmail":"noreply@newmindsgroup.com","replyTo":"app@newmindsgroup.com","resendApiKey":""}',
  '{"sessionDurationDays":7,"resetCodeExpiryMinutes":15,"maxLoginAttempts":5,"maxResetAttempts":5,"loginLockoutMinutes":15}',
  '{"portalName":"Rockcrete USA Blueprint","companyName":"Rockcrete USA","managementCompany":"New Minds Group"}'
) ON CONFLICT (id) DO NOTHING;

-- ── RESET TOKENS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reset_tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  code        TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  attempts    INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  used        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reset_tokens_email ON reset_tokens (email);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_user  ON reset_tokens (user_id);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────
-- Since all DB access goes through serverless API functions using the
-- service_role key, RLS is effectively bypassed. We enable RLS as a
-- defense-in-depth measure and create a policy that allows the service
-- role to do everything (it would anyway, but this is explicit).

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracker_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reset_tokens ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS by default, so no policies needed.
-- If you want to use the anon key from the frontend in the future,
-- add specific policies here.

-- ── HELPER: Updated_at trigger ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_teams_updated_at
  BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_milestones_updated_at
  BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tracker_state_updated_at
  BEFORE UPDATE ON tracker_state FOR EACH ROW EXECUTE FUNCTION update_updated_at();
