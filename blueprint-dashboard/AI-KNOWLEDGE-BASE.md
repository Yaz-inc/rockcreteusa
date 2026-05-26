# AI Agent Knowledge Base — Rockcrete USA Blueprint Dashboard

> **Purpose**: This file is the onboarding reference for any AI agent (Claude, GPT, Copilot, etc.) that needs to understand, modify, or extend the Rockcrete USA Blueprint Dashboard. Read this file FIRST before making any changes.

> **Last Updated**: 2026-05-26 | **Current Version**: V21

---

## 1. Architecture Overview

### Single-File SPA
The entire frontend is a **monolithic `index.html`** (~9,800 lines) with:
- **Inline `<style>`** (lines ~50–920): Complete CSS design system, all component styles, responsive breakpoints
- **Inline HTML body** (lines ~920–5150): Sidebar nav, all screen sections (including Help & Settings), modal dialogs, auth dialog
- **Inline `<script>`** (lines ~5150–9800): SPA routing, API client, auth flow, milestone/progress CRUD, tracker state, team management, setup wizard, UI state

**No build step. No framework. No bundler.** Deployed as-is to Vercel.

### Serverless API Layer
All backend logic lives in **Vercel serverless functions** under `api/`:

| File | Purpose | DB Tables |
|------|---------|----------|
| `auth.js` | User auth, sessions, forgot-password, seed | `users`, `reset_tokens` |
| `users.js` | Super Admin user CRUD, role/module management | `users`, `tasks` |
| `profile.js` | Self-service profile updates | `users` |
| `settings.js` | System config, email, export/import | `settings` + all 9 tables (export/import) |
| `milestones.js` | Milestone CRUD | `milestones` |
| `progress.js` | Activity feed & progress updates (edit/delete) | `progress_updates` |
| `tracker.js` | Project tracker state persistence | `tracker_state` |
| `teams.js` | Team & task management | `teams`, `team_members`, `tasks`, `users` |
| `setup.js` | Database status, test, migrate, connect, export/import | All 9 tables |
| `db.js` | Shared database client (48 exports, 37 async DB functions) | All 9 tables |

### Database: Supabase (PostgreSQL)
All shared state is stored in **Supabase** (PostgreSQL) via the `@supabase/supabase-js` client using `service_role` key (bypasses RLS).
- **9 tables**: `users`, `teams`, `team_members`, `tasks`, `milestones`, `progress_updates`, `tracker_state`, `settings`, `reset_tokens`
- **Client**: Singleton created in `db.js` via `getSupabase()`
- **Pattern**: Standard Supabase query builder (`.select()`, `.insert()`, `.update()`, `.delete()`, `.upsert()`)
- **Joins**: Team/Task queries use Supabase foreign key joins (e.g., `select('*, team_members(id,user_id,..., users(...))')`)

### Dual Auth System
1. **Layer 1 — Edge Middleware** (`middleware.js`): HTTP Basic Auth using `BLUEPRINT_PASSWORD` env var. Gates the entire site at the Vercel Edge. This is the outer door.
2. **Layer 2 — User Auth** (`auth.js`): Individual user accounts with PBKDF2-hashed passwords, HMAC-signed session cookies. This is the inner door providing per-user identity and access control.

---

## 2. Key Patterns & Conventions

### API Function Pattern
Every API file exports a single handler:
```javascript
export default async function handler(req, res) { ... }
```

Common helpers in every file:
- `setJson(res, status, payload)` — send JSON response with no-store cache headers
- `parseBody(req)` — parse Vercel's body format (string or object)
- `readBlob(path)` / `writeBlob(path, data)` — Blob read/write with error handling
- `generateId(prefix)` — e.g., `usr-a3f7k2x1`

### Auth Pattern in API
```javascript
// Get current user from session cookie
const session = await getSessionUser(req);
if (!session) return setJson(res, 401, { error: 'Authentication required' });

// Check role
if (session.role !== 'super_admin') return setJson(res, 403, { error: 'Forbidden' });
```

### Password Hashing
PBKDF2 with 100,000 iterations, SHA-256, 16-byte random salt. Stored as `salt:hash` hex string.
```javascript
async function hashPassword(password) { /* PBKDF2 via Web Crypto API */ }
async function verifyPassword(password, storedHash) { /* constant-time comparison */ }
```

### Session Cookies
- Cookie name: `rockcrete_session`
- Content: HMAC-SHA256 signed JSON `{ userId, role, expiresAt }`
- Max age: 7 days
- HTTP-only, Secure, SameSite=Strict
- Signing key: `SESSION_SECRET` env var

### Bilingual System (EN/ES)
Elements use `data-en` and `data-es` attributes:
```html
<span data-es="Mi Perfil" data-en="My Profile">My Profile</span>
```
JS toggles by setting `el.textContent = el.getAttribute('data-' + lang)`.

**CRITICAL BUG AVOIDANCE**: `el.textContent` wipes child elements. If you need a badge or icon inside a bilingual element, use a **flex container** with the bilingual element and badge as **separate siblings**:
```html
<!-- WRONG: badge will be wiped by bilingual JS -->
<span data-en="My Profile" data-es="Mi Perfil">My Profile <span class="badge">New</span></span>

<!-- CORRECT: badge is a separate sibling -->
<span style="display:flex;align-items:center;gap:0.3rem;">
  <span data-en="My Profile" data-es="Mi Perfil">My Profile</span>
  <span class="nav-new">New</span>
</span>
```

### SPA Routing
- Sidebar links use `data-route` attribute and `href="#routeName"`
- `showScreen(route)` hides all `.screen` elements, shows `#screen-{route}`
- URL hash is synced: `window.location.hash = route`
- Auth-gated routes: `data-rc-auth="loggedin"` or `data-rc-auth="super_admin"`

### Module Access Control
Each user has a `moduleAccess` object:
```javascript
moduleAccess: {
  home: 'read',
  schedule: 'write',
  tracker: 'admin',
  progress: 'read',
  users: 'none',
  settings: 'none',
  // ... etc
}
```
Access levels: `none` (hidden) → `read` (view) → `write` (edit) → `admin` (full)
Sidebar links are filtered by `rcFilterSidebarModules()` based on current user's access.

---

## 3. Role Hierarchy

```
super_admin  → Full system access, can manage users, grant/revoke module access
admin        → Most module access, cannot manage users or settings
pm           → Project management modules
webdev       → Development-related modules
devops       → Infrastructure/deployment modules
seo          → SEO/marketing modules
ui_ux        → Design modules
team         → Basic task tracking modules
client_admin → Client-side admin for their organization
client       → Read-only client view
```

Default module access templates are defined in `auth.js` via `getDefaultModuleAccess(role)`.

---

## 4. Environment Variables

| Variable | Purpose | Where to Set |
|----------|---------|--------------|
| `SUPABASE_URL` | Supabase project URL | Vercel Dashboard → Settings → Environment Variables |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (bypasses RLS) | Vercel Dashboard |
| `SESSION_SECRET` | HMAC signing key for session cookies | Vercel Dashboard (any random 32+ char string) |
| `RESEND_API_KEY` | Resend API key for transactional emails | Configured in System Settings UI |
| `RESEND_FROM_EMAIL` | Sender email address | Configured in System Settings UI |

---

## 5. File Map

```
blueprint-dashboard/
├── index.html              ← Monolithic SPA (9,800+ lines)
├── middleware.js            ← Vercel Edge: HTTP Basic Auth gate
├── vercel.json             ← Vercel deploy config (rewrites, headers)
├── package.json            ← Dependencies: @supabase/supabase-js
├── CHANGELOG.md            ← Version history (THIS IS THE SOURCE OF TRUTH)
├── AI-KNOWLEDGE-BASE.md    ← THIS FILE — AI agent onboarding reference
├── api/
│   ├── db.js               ← Shared Supabase client (48 exports, 37 DB functions)
│   ├── auth.js             ← User auth, sessions, forgot-password, seed
│   ├── users.js            ← Super Admin user CRUD, role/module management
│   ├── profile.js          ← Self-service profile updates
│   ├── settings.js         ← System config, email, export/import
│   ├── milestones.js       ← Milestone CRUD
│   ├── progress.js         ← Activity feed & progress updates (edit/delete)
│   ├── tracker.js          ← Project tracker state persistence
│   ├── teams.js            ← Team & task management
│   └── setup.js            ← Database status, test, migrate, connect
├── data/
│   └── project-tracker.json ← Static seed data
├── docs/
│   ├── design-system.md    ← CSS custom properties, typography, spacing
│   ├── theme-system.md     ← Light/dark/auto theme implementation
│   ├── bilingual.md        ← EN/ES toggle implementation details
│   ├── auth-and-roles.md   ← Role gating and auth architecture
│   ├── modal-system.md     ← Dialog/modal component system
│   ├── task-tracking.md    ← Task tracker and timer implementation
│   ├── telemetry.md        ← Telemetry extraction pipeline
│   ├── accessibility.md    ← A11y guidelines and implementation
│   ├── deployment.md       ← Deployment instructions (Vercel)
│   └── client-vs-internal.md ← Client vs admin view separation
└── deploy/
    ├── DEPLOY.md           ← Deployment decision tree
    ├── VERCEL.md           ← Vercel-specific deployment guide
    └── vercel.json         ← Reference Vercel config
```

---

## 6. Common Tasks

### Adding a New Screen
1. Add a `<section class="screen" id="screen-{name}">` in `index.html` after existing screens
2. Add a sidebar `<a class="nav-link" data-route="{name}" href="#{name}">` in the appropriate nav group
3. If the module is new, add "NEW" badge: `<span class="nav-new">New</span>` as a sibling to the bilingual `<span>`
4. Add the route to the `moduleAccess` defaults in `auth.js` → `getDefaultModuleAccess()`
5. Add the route to `rcFilterSidebarModules()` in the frontend JS
6. Add bilingual attributes: `data-en="English Name" data-es="Spanish Name"`

### Adding a New API Endpoint
1. Create `api/{name}.js` following the existing pattern (see Section 2)
2. Import needed functions from `./db.js` (e.g., `setJson`, `parseBody`, `requireAuth`, data functions)
3. Export a single `handler(req, res)` function
4. Add auth check: `const { user } = await requireAuth(req)` + `requireSuperAdmin(user)` if needed
5. Use the existing db.js CRUD functions (e.g., `getAllUsers()`, `upsertUser()`, etc.)
6. Test with curl: `curl -X POST https://your-domain.vercel.app/api/{name} -H "Content-Type: application/json" -d '{...}'`

### Adding a New User Role
1. Add the role name to `VALID_ROLES` in `auth.js`
2. Add default module access template in `getDefaultModuleAccess()`
3. Add role badge styling in the Users screen HTML
4. Update `VALID_ROLES` in `users.js` as well

### Seeding Super Admin (First Time)
```
POST /api/auth?action=seed
{
  "email": "admin@example.com",
  "password": "strong-password",
  "name": "Admin Name"
}
```
Only works when `rockcrete/users.json` does not exist or is empty (`[]`).

---

## 7. Deployment

### Live URL
**Production**: https://blueprint-dashboard-chi.vercel.app/

### Deployment Process
1. Commit and push to GitHub `main` branch
2. Vercel auto-deploys from GitHub (if connected), OR use CLI:
   ```bash
   cd blueprint-dashboard
   npx vercel deploy --prod --yes --token "$VERCEL_TOKEN"
   ```
3. The project ID is in `.vercel/project.json`

### Vercel Project Info
- **Project ID**: `prj_bvGAlQqF2UYQyrTcMyS8WHLmL02r`
- **Org ID**: `team_4fo1rem7ltA7U8ijrhZCTD8A`
- **Project Name**: `blueprint-dashboard`

### GitHub Repository
- **Remote**: `https://github.com/Yaz-inc/rockcreteusa.git`
- **Main branch**: `main` (production)
- **Feature branches**: `V17`, `V17_A`, `Version17`

---

## 8. Super Admin Account

- **Email**: info@newmindsgroup.com
- **Password**: Same as `BLUEPRINT_PASSWORD` environment variable
- **Role**: `super_admin`
- Seeded via `POST /api/auth?action=seed` on first deployment

---

## 9. Pending / Future Work

- [ ] DevOps: Configure Resend API + DNS records for email delivery
- [ ] Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` env vars on Vercel
- [ ] TOTP/MFA for Super Admin accounts
- [ ] Email verification on new user registration
- [ ] Session rotation on privilege escalation
- [ ] Audit log for user management actions
- [ ] Bulk user import via CSV
- [ ] Password complexity requirements (configurable)
- [ ] Account lockout notifications via email
- [ ] Session management (view/revoke active sessions)

---

## 10. Critical Warnings

1. **Never modify `middleware.js`** without testing — it gates the entire site
2. **Always import DB functions from `db.js`** — never create direct Supabase clients in API files
3. **Always use timing-safe comparisons** for password/session verification
4. **Always add bilingual attributes** (`data-en` + `data-es`) for user-facing text
5. **Never put badges/icons inside bilingual elements** — use flex container with siblings
6. **Use `rcToast()` for all user feedback** — never use `alert()`, `prompt()`, or `confirm()`
7. **Always update CHANGELOG.md** when making changes
8. **Always update this file** when adding new modules, APIs, or changing architecture
9. **Keep the How To page updated** when adding new features or changing workflows
