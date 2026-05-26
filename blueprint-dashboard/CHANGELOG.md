# CHANGELOG — Rockcrete USA Blueprint Dashboard

All notable changes to the Rockcrete USA Blueprint Dashboard are documented here.
Versioning follows the pattern: `V<major>_<minor>` where major = milestone release, minor = feature increment.

---

## V21 — Database & Migration UI, How To Help Page (2026-05-26)

Database self-service configuration, simplified data migration workflow, and comprehensive in-app documentation.

**Improvement #20 — Database & Migration UI (Settings)**
- Replaced technical "Database Configuration" + "Data Management" cards with unified **3-step wizard**:
  - **Step 1 — Export Current Data**: "Download Backup" button exports all 9 tables as JSON
  - **Step 2 — Connect New Database**: Supabase URL + Service Role Key inputs, connection status bar (green/amber/red), Test + Connect & Setup buttons, table row counts grid
  - **Step 3 — Import Data**: Upload JSON backup to import into new database
- Numbered step circles with brand-color styling + dashed dividers
- Connection status auto-loads on Settings screen open
- Supabase URL auto-populated from current connection
- `POST /api/setup?action=connect` — tests user-provided Supabase credentials + returns Vercel env var instructions modal
- Removed env var badges and migration/SQL copy buttons (too technical for end users)

**How To Help Page (`#help`)**
- New screen accessible to **all logged-in users** (life-buoy icon in sidebar)
- **Quick Start** — 4-card grid: Track Projects, Milestones, Teams, Configure
- **Deploy to a New Domain** — 5-step numbered guide with:
  - Export data → Create Supabase project → Deploy to Vercel → Create tables → Import data
  - Env var code block with syntax highlighting
  - Visual flow diagram (Old App → JSON → New App)
- **Staff Notes & Activity Feed** — edit, delete, URL linking how-to
- **User Roles & Permissions** — full role/access matrix table (6 roles × 3 permissions)
- **Email Setup** — step-by-step Resend configuration (6 steps + domain warning)
- **FAQ** — 5 collapsible `<details>` questions (password reset, add member, backup, language, Supabase limits)
- **Version Info** — footer with version + credits link
- Route added to `accountRoutes` to bypass module access filtering

**API Changes**
- `GET /api/setup?action=status` — now returns `supabaseUrl` for UI pre-fill, removed `envVars` object
- `POST /api/setup?action=connect` — NEW: tests connection with user-provided URL + Key, returns setup instructions

**Documentation**
- Updated CHANGELOG.md with V21 release notes
- Updated AI-KNOWLEDGE-BASE.md with new architecture details
- Updated api-reference.md with new setup endpoints

---

## V20 — Edit/Delete Notes, URL Auto-Linking, Setup API, Email Fix (2026-05-21)

Major UX improvements to staff notes, activity feed, email configuration, and data portability.

**Improvement #20 — Self-Service Database Setup API**
- Created `api/setup.js` with 5 actions:
  - `GET ?action=status` — connection status + table row counts
  - `POST ?action=test` — latency test
  - `POST ?action=migrate` — full migration SQL (9 tables + indexes + triggers + RLS)
  - `GET ?action=export` — complete data export
  - `POST ?action=import` — full data import with upsert
- Super Admin only access

**Improvement #21 — Staff Note Edit & Delete**
- ✏️ **Edit** button on each note (hover to reveal)
  - Inline textarea replaces the note body (no browser `prompt()`)
  - Save / Cancel buttons with Ctrl+Enter and Escape shortcuts
  - "edited" marker shown after editing
- 🗑️ **Delete** button on each note (hover to reveal)
  - Inline red confirmation bar (no browser `confirm()`)
  - "Delete this note?" with Delete / Cancel buttons
  - Animated fade-in on confirmation bar
- All feedback via `rcToast()` notifications (no more `alert()`)
- Applied to both **Staff Notes** (tracker) and **Activity Feed** (progress)

**Improvement #22 — URL Auto-Linking**
- URLs in staff notes auto-converted to clickable `<a>` tags
- URLs in activity feed messages auto-linked
- All links open in new tab (`target="_blank"`)
- CSS: link styling with underline, brand color, break-all for long URLs

**Progress API — Edit & Delete Support**
- `PUT /api/progress` — edit a progress update message
- `DELETE /api/progress?id=<id>` — delete a progress update
- `db.js`: added `deleteProgressUpdate()` and `updateProgressUpdate()` functions

**Email Configuration Fix**
- Merged duplicate "API Configuration (Resend)" card into single "Email Configuration" section
- Single API key input (`settingsResendKey`) now serves all purposes
- Removed duplicate `settingsResendApiKey` element and all references
- **Verify Connection**, **Send Test Email**, and **Check Usage & Quota** now auto-save settings before calling the API
- Added domain mismatch detection: warns if From Email domain doesn't match verified Resend domain
- Improved error parsing: Resend JSON errors shown as clean human-readable messages
- Added helpful placeholders: `Rockcrete USA Blueprint`, `noreply@yourdomain.com`, `re_xxxxxxxxxxxx`
- Added explanation text with link to resend.com/api-keys
- Restored Check Usage & Quota button + stats panel (API Key Status, Key Type, Daily Limit, Monthly Limit)

**Data Export Upgrade**
- Export now includes ALL 9 tables (was missing `tracker_state`, `teams`, `team_members`, `tasks`)
- Password hashes included in export for full portability
- Version bumped to V20

**UX — Modern Inline Interactions**
- Replaced all `prompt()`, `confirm()`, `alert()` with:
  - Inline textarea editor with Save/Cancel
  - Inline red confirmation bar with Delete/Cancel
  - `rcToast()` notifications for all feedback
- CSS: `.tc-inline-edit`, `.tc-delete-confirm` with animations
- Keyboard shortcuts: Ctrl+Enter to save, Escape to cancel

**Bugfixes**
- Fixed `BLUEPRINT_PASSWORD` references — variable removed (unused after user management system)
- Fixed TDZ crash: `let` → `var` for `TRACKER_DATA` / `TRACKER_STATE` to prevent "Loading..." hang
- Fixed Save/Cancel button readability: solid brand color background + dark text
- Cleaned up embedded git repo and cookies.txt from tracking
- Added `.gitignore` entries for `rockcreteusa/` and `cookies.txt`

**Knowledge Base**
- Created 10 comprehensive AI agent documentation files in `knowledge-base/`
- Updated `CHANGELOG.md` with complete V20 release notes
- Updated API reference with new Progress PUT/DELETE endpoints
- Updated known issues with resolution status

---

## V17_A — User Login & Profile System (2026-05-20)

Replaces the broken shared-password + self-assigned-role system with individual user accounts, module-level access control, and a complete authentication flow including forgot-password with email verification codes.

**Added — Authentication System (`api/auth.js`, 737 lines)**
- Individual user accounts (email + password) with PBKDF2 password hashing (100,000 iterations, SHA-256)
- Session-based authentication via HTTP-only signed cookies (`rockcrete_session`)
- HMAC-SHA256 session signing using `SESSION_SECRET` environment variable
- Login with rate limiting (5 attempts, 15-minute lockout)
- Logout with server-side session invalidation
- `GET /api/auth?action=me` — returns current authenticated user
- `POST /api/auth?action=register` — Super Admin only, creates new user accounts
- `POST /api/auth?action=change-password` — authenticated user self-service password change
- `POST /api/auth?action=forgot-password` — generates 6-digit verification code (15-min expiry, max 5 attempts)
- `POST /api/auth?action=verify-reset` — verifies code and allows password reset
- `GET /api/auth?action=check-seed` — public endpoint to check if Super Admin seeding is available
- `POST /api/auth?action=seed` — seeds the initial Super Admin account (one-time, only when no users exist)
- Timing-safe comparisons throughout to prevent timing attacks
- Login dialog with 3 modes: Login, Forgot Password, Verify Reset Code

**Added — User Management (`api/users.js`, 565 lines)**
- Super Admin CRUD for all user accounts
- `GET /api/users` — list all users (Super Admin only)
- `POST /api/users` — create new user with role and module access
- `PATCH /api/users` — update user role, status, module access
- `DELETE /api/users` — deactivate user (soft delete)
- Role hierarchy: `super_admin > admin > pm > webdev > devops > seo > ui_ux > team > client_admin > client`
- Module-level access control: `none | read | write | admin` per module per user
- Only Super Admin can grant/revoke access
- Invite flow: Super Admin creates account, user sets own password on first login
- Default module access templates per role
- User Management screen (`#users`) with user table, role badges, add/edit/deactivate modals

**Added — Profile Management (`api/profile.js`, 211 lines)**
- `GET /api/profile` — get current user's full profile
- `PATCH /api/profile` — update display name, phone, title, organization, avatar, preferences
- Profile screen (`#profile`) with personal workspace, preferences, language/theme settings
- Self-service password change from profile

**Added — System Settings (`api/settings.js`, 434 lines)**
- `GET /api/settings` — get system settings (Super Admin only)
- `PATCH /api/settings` — update email config, branding, system settings
- `POST /api/settings?action=test-email` — send test email via Resend API
- `GET /api/settings?action=verify-email` — verify Resend domain configuration
- `GET /api/settings?action=resend-usage` — check API key status and quota
- `POST /api/settings?action=export` — export all data (users, settings, milestones, progress, tracker, teams)
- `POST /api/settings?action=import` — import data from backup
- Settings screen (`#settings`) with Email Config, System Settings, Branding, Data Management

**Added — UI Components**
- Login dialog modal with email/password form and forgot-password flow
- Profile screen with user info, preferences, password change
- Users screen with user table, role badges, add/edit modals (Super Admin only)
- Settings screen with email config, system settings, branding, data management (Super Admin only)
- Account nav group in sidebar (visible when logged in)
- Module access filtering: sidebar links hidden based on user's module access level
- Bilingual support for all new screens (EN/ES via `data-en`/`data-es`)

**Fixed**
- Auth check-seed endpoint now uses public `/api/auth?action=check-seed` instead of protected `/api/users`
- Auth dialog CSS mode switching properly hides/shows login/forgot/verify sections in all modes

**Environment Variables Required**
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `SESSION_SECRET` — HMAC signing key for session cookies (auto-generated, set on Vercel)
- `RESEND_API_KEY` — Resend API key for transactional emails (optional, can set in Settings UI)

---

## V17 — Milestone-Driven Team Progress (2026-05-19)

Adds milestone tracking and activity feed to the Team Progress Dashboard.

**Added**
- `api/milestones.js` (249 lines) — CRUD for project milestones with status, assignee, due date, progress
- `api/progress.js` (169 lines) — Activity feed with progress updates, timestamps, author tracking
- Team Progress Dashboard screen (`#progress`) with milestone cards, progress bars, activity feed
- Milestone CRUD: create, update status, delete with confirmation
- Progress updates with author attribution and timestamps
- Bilingual labels for new components (EN/ES)

---

## V16 and Earlier — Foundation Dashboard (2026-04-27)

Initial extraction from the AQUAFLOW Blueprint del Proyecto engagement.

**Added**
- Foundation design system: slate-blue palette + warm amber accent, Inter + JetBrains Mono fonts
- Light + Dark + Auto theme toggle with WCAG 2.1 AA contrast
- Bilingual scaffolding (Spanish / English) via `data-es` / `data-en` attributes
- Mobile-responsive layout with sidebar drawer on screens <=1024px
- Modal/dialog system replacing browser `prompt()` / `alert()` / `confirm()`
- Task tracker with live timer, manual entry, cost roll-ups, AI-vs-human comparison
- Role gating model: client view vs. admin/manager Internal Panel
- Screen routing via sidebar `data-route` + `showScreen()` function
- `localStorage` persistence for theme, language, and in-app edits
- Project tracker state persistence via Vercel Blob (`api/tracker.js`)
- Vercel deployment with `vercel.json` rewrites and security headers

**Documented**
- docs/design-system.md, docs/theme-system.md, docs/bilingual.md, docs/telemetry.md
- docs/task-tracking.md, docs/auth-and-roles.md, docs/modal-system.md, docs/accessibility.md
- docs/deployment.md

**Known Limitations (V16 and earlier)**
- No backend persistence — all writes were localStorage-only
- No real auth — role gating was client-side cosmetic
- No individual user accounts — shared password with self-assigned roles
