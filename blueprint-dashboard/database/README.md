# Database Migration Guide — Rockcrete USA Blueprint Dashboard V18

> **Purpose**: This directory contains everything needed to migrate the Supabase database to a new account, server, or environment. An AI agent can follow these instructions to fully re-establish the database with all existing records.

---

## Quick Start (3 Steps)

### Step 1: Create a New Supabase Project
1. Go to https://supabase.com
2. Create a new project (or use an existing one)
3. Note the **Project URL** and **service_role key** (Settings > API)

### Step 2: Run the Setup Script
```bash
cd blueprint-dashboard/database
node setup-new-db.js
```

This script will:
- Create all tables, indexes, triggers, and RLS policies
- Import all existing data (users, teams, tasks, milestones, progress, settings)
- Verify the migration

### Step 3: Update Vercel Environment Variables
```bash
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_KEY production
vercel env add SESSION_SECRET production
```

---

## File Structure

| File | Purpose |
|------|---------|
| `schema.sql` | Complete database schema (tables, indexes, triggers, RLS) |
| `seed-data.sql` | All existing data as INSERT statements (auto-generated) |
| `setup-new-db.js` | One-click setup script — runs schema + seed data |
| `export-data.js` | Exports current data from existing Supabase to `seed-data.sql` |
| `verify-db.js` | Verifies database integrity after migration |
| `README.md` | This file |

---

## For AI Agents

When tasked with re-establishing this database:

1. **Read `schema.sql`** — This is the authoritative schema definition
2. **Read `seed-data.sql`** — Contains all existing rows as INSERT statements
3. **Run `setup-new-db.js`** with the new Supabase credentials as env vars:
   ```bash
   SUPABASE_URL=https://new-project.supabase.co
   SUPABASE_SERVICE_KEY=eyJ...
   node setup-new-db.js
   ```
4. **Run `verify-db.js`** to confirm all tables and row counts match

### Required Environment Variables
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key (NOT the anon key)
SESSION_SECRET=any_random_string_for_cookie_signing
```

### Tables (in dependency order)
1. `users` — User accounts (no dependencies)
2. `teams` — Team definitions (depends on users.created_by)
3. `team_members` — User-team associations (depends on teams, users)
4. `tasks` — Project tasks (depends on users, teams)
5. `milestones` — Task milestones (depends on tasks)
6. `progress_updates` — Activity feed (depends on tasks, milestones)
7. `tracker_state` — Per-task runtime state (depends on tasks)
8. `settings` — System configuration (singleton row, id=1)
9. `reset_tokens` — Password reset codes (depends on users)

---

## Manual Migration (Supabase Dashboard)

If you prefer to run SQL manually:

1. Open Supabase Dashboard > SQL Editor
2. Copy and paste the contents of `schema.sql` — run it
3. Copy and paste the contents of `seed-data.sql` — run it
4. Verify in the Table Editor that all tables have data

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `relation already exists` | Tables already created — skip schema, run only seed-data.sql |
| `duplicate key value violates unique constraint` | Data already imported — skip seed, run verify-db.js |
| `permission denied` | Make sure you're using the **service_role** key, not the anon key |
| `foreign key constraint violation` | Import in dependency order: users → teams → team_members → tasks → milestones → progress_updates → tracker_state → settings → reset_tokens |
