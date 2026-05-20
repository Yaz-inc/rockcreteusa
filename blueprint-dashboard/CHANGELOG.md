# CHANGELOG — Rockcrete USA Blueprint Dashboard

All notable changes to the Rockcrete USA Blueprint Dashboard are documented here.
Versioning follows the pattern: `V<major>_<minor>` where major = milestone release, minor = feature increment.

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
- `POST /api/settings?action=export` — export all data (users, settings, milestones, progress)
- `POST /api/settings?action=import` — import data from backup
- Settings screen (`#settings`) with tabs: Email Config, System Settings, Branding, Data Management
- Email configuration: Resend API key, from email, from name, test email
- Branding: company name, logo URLs, primary color
- Data export/import for backup and recovery

**Added — UI Components**
- Login dialog modal with email/password form and forgot-password flow
- Profile screen with user info, preferences, password change
- Users screen with user table, role badges, add/edit modals (Super Admin only)
- Settings screen with email config, system settings, branding, data management (Super Admin only)
- "NEW" badge on new sidebar menu links (Profile, User Management, System Settings) — green pill with pulse animation, auto-fades after 3 cycles
- V17_A version badge in header (red pill)
- Account nav group in sidebar (visible when logged in)
- Auth nav group: Login button (guest) / Profile + Logout (signed in)
- Module access filtering: sidebar links hidden based on user's module access level
- Bilingual support for all new screens (EN/ES via `data-en`/`data-es`)

**Fixed**
- Auth check-seed endpoint now uses public `/api/auth?action=check-seed` instead of protected `/api/users`
- Auth dialog CSS mode switching properly hides/shows login/forgot/verify sections in all modes

**Environment Variables Required**
- `SESSION_SECRET` — HMAC signing key for session cookies (auto-generated, set on Vercel)
- `RESEND_API_KEY` — Resend API key for transactional emails (DevOps to configure)
- `RESEND_FROM_EMAIL` — Sender email address (e.g., noreply@newmindsgroup.com)
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob storage token (already set)
- `BLUEPRINT_PASSWORD` — HTTP Basic Auth gate password (already set)

**Blob Storage Keys**
- `rockcrete/users.json` — User accounts
- `rockcrete/sessions.json` — Active sessions
- `rockcrete/reset-tokens.json` — Password reset verification codes
- `rockcrete/settings.json` — System settings (email config, branding)

**Known Limitations**
- Email (forgot-password) requires DevOps to configure Resend API + DNS records
- No TOTP/MFA yet (planned for future version)
- No email verification on registration (Super Admin creates accounts manually)
- Session cookie is not rotated on privilege change (user must log out and back in)

---

## V17 — Milestone-Driven Team Progress (2026-05-19)

Adds milestone tracking and activity feed to the Team Progress Dashboard.

**Added**
- `api/milestones.js` (249 lines) — CRUD for project milestones with status, assignee, due date, progress
- `api/progress.js` (169 lines) — Activity feed with progress updates, timestamps, author tracking
- Team Progress Dashboard screen (`#progress`) with milestone cards, progress bars, activity feed
- Milestone CRUD: create, update status, delete with confirmation
- Progress updates with author attribution and timestamps
- V17 version badge in header (red pill)
- Bilingual labels for new components (EN/ES)

**Fixed**
- V17 badge separated into its own `<span>` outside bilingual `data-en`/`data-es` element to prevent text replacement from wiping the badge

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
- HTTP Basic Auth via Edge Middleware (`middleware.js` + `api/session.js`)
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
