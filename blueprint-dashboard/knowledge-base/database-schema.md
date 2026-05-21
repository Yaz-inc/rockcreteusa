# Database Schema

## Supabase Configuration

- **Platform**: Supabase (PostgreSQL)
- **Connection**: via `@supabase/supabase-js` using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- **RLS**: Enabled on all tables (service role key bypasses RLS)
- **Data Layer**: `api/db.js` — all DB operations centralized here

## Tables

### `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Format: `usr-{hex}{base36}` |
| `email` | TEXT | UNIQUE, NOT NULL | Login email |
| `password_hash` | TEXT | NOT NULL | PBKDF2 hash: `pbkdf2:100000:{salt}:{hash}` |
| `name` | TEXT | NOT NULL | Full name |
| `display_name` | TEXT | | Display name (optional) |
| `role` | TEXT | NOT NULL | One of VALID_ROLES |
| `status` | TEXT | DEFAULT 'active' | `active` or `inactive` |
| `phone` | TEXT | | Phone number |
| `title` | TEXT | | Job title |
| `organization` | TEXT | | Organization name |
| `avatar_url` | TEXT | | Profile picture URL |
| `preferences` | JSONB | DEFAULT '{}' | User preferences (theme, language, notifications) |
| `module_access` | JSONB | DEFAULT '{}' | Per-module access overrides |
| `temp_password` | BOOLEAN | DEFAULT false | Set true when admin resets password |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Auto-updated via trigger |

**Indexes**: `email`, `role`, `status`

### `teams`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Format: `team-{hex}{base36}` |
| `name` | TEXT | NOT NULL | Team name |
| `description` | TEXT | | Team description |
| `created_by` | TEXT | FK → users(id) | Creator user ID |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

### `team_members`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | |
| `team_id` | TEXT | FK → teams(id) ON DELETE CASCADE | |
| `user_id` | TEXT | FK → users(id) ON DELETE CASCADE | |
| `position` | TEXT | | Member's role in team |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**Constraint**: UNIQUE(team_id, user_id)

### `tasks`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Format: `task-{hex}{base36}` |
| `title` | TEXT | NOT NULL | Task title |
| `description` | TEXT | | Task description |
| `status` | TEXT | DEFAULT 'not_started' | `not_started`, `in_progress`, `waiting_client`, `ready_review`, `done` |
| `priority` | TEXT | DEFAULT 'medium' | `low`, `medium`, `high`, `urgent` |
| `assignee_id` | TEXT | FK → users(id) | |
| `team_id` | TEXT | FK → teams(id) | |
| `due_date` | DATE | | |
| `phase` | TEXT | | Phase identifier |
| `created_by` | TEXT | FK → users(id) | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

**Indexes**: `assignee_id`, `team_id`, `status`

### `milestones`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Format: `ms-{hex}{base36}` |
| `task_id` | TEXT | NOT NULL | Task identifier (from seed data) |
| `title` | TEXT | NOT NULL | Milestone title |
| `notes` | TEXT | | Additional notes |
| `order_num` | INTEGER | DEFAULT 0 | Sort order within task |
| `status` | TEXT | DEFAULT 'pending' | `pending`, `completed` |
| `completed_at` | TIMESTAMPTZ | | When completed |
| `completed_by` | TEXT | | Who completed it |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

**Index**: `task_id`

### `progress_updates`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Format: `upd-{hex}{base36}` |
| `task_id` | TEXT | | Task identifier |
| `milestone_id` | TEXT | | Milestone identifier |
| `submitted_by` | TEXT | | User name |
| `role` | TEXT | | User role at time of submission |
| `type` | TEXT | | `note`, `blocker`, `milestone-created`, `milestone-completed`, `status-change` |
| `message` | TEXT | | Update message |
| `previous_status` | TEXT | | For status changes |
| `new_status` | TEXT | | For status changes |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

**Index**: `task_id`, `created_at DESC`

### `tracker_state`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `task_id` | TEXT | PRIMARY KEY | Task identifier or `__access_requests__` |
| `state_data` | JSONB | NOT NULL | Task state: `{id, status, dueDate, assigneeId, comments: [...]}` |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

### `settings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY (=1) | Singleton row |
| `email_config` | JSONB | | `{enabled, fromName, fromEmail, apiKey, replyTo}` |
| `system_config` | JSONB | | `{projectName, supportEmail, maintenanceMode, ...}` |
| `branding_config` | JSONB | | `{primaryColor, logoUrl, faviconUrl, ...}` |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | |

### `reset_tokens`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | |
| `user_id` | TEXT | FK → users(id) | |
| `email` | TEXT | NOT NULL | |
| `code` | TEXT | NOT NULL | 6-digit verification code |
| `expires_at` | TIMESTAMPTZ | NOT NULL | 15-min expiry |
| `attempts` | INTEGER | DEFAULT 0 | Failed verification attempts |
| `max_attempts` | INTEGER | DEFAULT 5 | Max allowed attempts |
| `used` | BOOLEAN | DEFAULT false | |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | |

## Role Constants

```javascript
VALID_ROLES = ['super_admin', 'admin', 'pm', 'webdev', 'devops', 'seo', 'ui_ux', 'team', 'client_admin', 'client']
ACCESS_LEVELS = ['full', 'read', 'none']
```

## Data Mapping Functions

`db.js` uses `rowToUser()` / `userToRow()` for snake_case ↔ camelCase conversion:
- `password_hash` ↔ `passwordHash`
- `display_name` ↔ `displayName`
- `avatar_url` ↔ `avatarUrl`
- `module_access` ↔ `moduleAccess`
- `temp_password` ↔ `tempPassword`
- `created_at` ↔ `createdAt`
- `updated_at` ↔ `updatedAt`
