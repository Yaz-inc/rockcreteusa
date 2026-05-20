# AI Agent Database Setup Instructions

> **Role**: You are an AI agent tasked with setting up or migrating the Rockcrete USA Blueprint Dashboard V18 Supabase database.

---

## Context

This project is a vanilla JavaScript SPA dashboard with Vercel serverless API functions. The database is Supabase (PostgreSQL). All data access goes through `api/db.js` using the `service_role` key.

### Tech Stack
- **Frontend**: `blueprint-dashboard/index.html` (monolithic SPA)
- **Backend**: Vercel serverless functions in `blueprint-dashboard/api/`
- **Database**: Supabase PostgreSQL
- **Auth**: Session-based with HMAC-signed cookies

---

## What You Need

### Required Credentials
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ... (service_role key from Supabase Dashboard > Settings > API)
SESSION_SECRET=any_random_string (for cookie signing)
```

### Files in `database/` Directory
| File | Purpose |
|------|---------|
| `schema.sql` | Full database schema — run this first |
| `seed-data.sql` | All existing data as INSERT statements — run this second |
| `setup-new-db.js` | Automated setup script |
| `export-data.js` | Export data from existing Supabase |
| `verify-db.js` | Verify database after migration |
| `README.md` | Human-readable migration guide |
| `AI-AGENT-DB-SETUP.md` | This file |

---

## Step-by-Step Instructions

### Scenario A: Fresh Database Setup (New Supabase Project)

1. **Read the schema**: `cat database/schema.sql`
2. **Run the schema in Supabase**:
   - Go to Supabase Dashboard > SQL Editor
   - Paste the entire contents of `schema.sql`
   - Click "Run"
3. **If seed data exists**: Run `seed-data.sql` the same way
4. **Verify**: Run `node database/verify-db.js` with env vars set
5. **Update Vercel**: Set `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SESSION_SECRET`

### Scenario B: Migrate from Existing Supabase to New Supabase

1. **Export existing data**:
   ```bash
   SUPABASE_URL=https://old-project.supabase.co \
   SUPABASE_SERVICE_KEY=old_key \
   node database/export-data.js
   ```
   This creates `database/seed-data.sql`

2. **Create new Supabase project** (or get credentials for one)

3. **Run schema on new database**:
   - Paste `database/schema.sql` into Supabase SQL Editor
   - Run it

4. **Import data to new database**:
   - Paste `database/seed-data.sql` into Supabase SQL Editor
   - Run it

5. **Verify**:
   ```bash
   SUPABASE_URL=https://new-project.supabase.co \
   SUPABASE_SERVICE_KEY=new_key \
   node database/verify-db.js
   ```

6. **Update Vercel env vars** to point to new Supabase

### Scenario C: Automated Setup (if Supabase supports it)

```bash
SUPABASE_URL=https://new-project.supabase.co \
SUPABASE_SERVICE_KEY=new_key \
node database/setup-new-db.js
```

Note: The automated script may not work on all Supabase setups due to RPC restrictions. If it fails, fall back to manual SQL execution.

---

## Database Schema Reference

### Tables (in dependency order)

| Table | Rows | Purpose |
|-------|------|---------|
| `users` | ~10-20 | User accounts with PBKDF2 password hashes |
| `teams` | ~5-10 | Team/group definitions |
| `team_members` | ~20-50 | User-team associations |
| `tasks` | ~20-50 | Project tasks with status, priority, assignee |
| `milestones` | ~50-100 | Per-task milestones |
| `progress_updates` | ~100-500 | Activity feed entries |
| `tracker_state` | ~20-50 | Per-task runtime state (JSONB) |
| `settings` | 1 | System configuration (singleton) |
| `reset_tokens` | 0-10 | Password reset codes (temporary) |

### Key Relationships
```
users ← teams (created_by)
users ← team_members (user_id)
teams ← team_members (team_id)
users ← tasks (assignee_id, created_by)
teams ← tasks (team_id)
tasks ← milestones (task_id)
tasks ← progress_updates (task_id)
milestones ← progress_updates (milestone_id)
tasks ← tracker_state (task_id)
users ← reset_tokens (user_id)
```

### User Roles
```
super_admin > admin > pm > webdev > devops > seo > ui_ux > team > client_admin > client
```

### Module Access (21 modules)
Each user has JSONB `module_access` with permissions: `none`, `read`, `write`, `admin`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `function exec_sql does not exist` | Normal — Supabase doesn't have this RPC by default. Run SQL manually in SQL Editor. |
| `duplicate key value violates unique constraint` | Data already imported. Skip seed-data.sql, run verify-db.js. |
| `foreign key constraint violation` | Import in order: users → teams → team_members → tasks → milestones → progress_updates → tracker_state → settings → reset_tokens |
| `permission denied` | Use service_role key, not anon key. Check key starts with `eyJ`. |
| `relation already exists` | Tables already created. Skip schema.sql, run only seed-data.sql. |

---

## Verification Checklist

After migration, confirm:
- [ ] All 9 tables exist
- [ ] Row counts match the source database
- [ ] `settings` table has 1 row with id=1
- [ ] All indexes exist (check `pg_indexes`)
- [ ] All 6 triggers exist (check `pg_trigger`)
- [ ] RLS is enabled on all tables
- [ ] Can query `users` table via API
- [ ] Login works with existing credentials
- [ ] Vercel deployment uses new Supabase URL
