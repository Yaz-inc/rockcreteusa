# Known Issues & Technical Debt

## Resolved Issues

| Issue | Root Cause | Fix | Version |
|-------|-----------|-----|---------|
| **Session lost on refresh** | No localStorage fallback; relied solely on cookie | Added `rcSaveSessionLocally()` + inline restore script | V17_A |
| **"Loading..." forever on refresh** | `let TRACKER_DATA` caused TDZ error when `showScreen()` called `renderTracker()` before the `let` declaration executed | Changed `let` → `var` for all state variables | V20 |
| **Tracker/progress not rendering after auth** | `rcAuthInit()` didn't call `renderTracker()` or `initProgressDashboard()` after restoring cached session | Added `rcPostAuthRender()` called in all auth paths | V17_A |
| **CSP too restrictive** | `connect-src 'self'` blocked some browser fetch calls | Removed CSP meta tag entirely | V17_A |
| **Dead BLUEPRINT_PASSWORD code** | Old auth system remnant | Deleted `api/session.js`, removed env var | V20 |
| **Browser `prompt()`/`confirm()`/`alert()` usage** | Old-school browser dialogs for edit/delete actions | Replaced with inline textarea editor, inline confirmation bar, `rcToast()` notifications | V20 |
| **Duplicate API key inputs** | Two separate "Resend API Key" inputs in Settings | Merged into single "Email Configuration" card | V20 |
| **Email verify fails with fresh API key** | Key not saved to DB before API call tries to use it | Auto-save settings before verify/test/usage | V20 |
| **Save/Cancel buttons unreadable** | Low contrast colors on action buttons | Updated to solid brand-color background + dark text | V20 |

## Current Technical Debt

### 1. Single-File Architecture
`index.html` is ~9,400 lines containing ALL HTML, CSS, and JS. This makes it:
- Hard to navigate
- Prone to scope issues (like the TDZ bug)
- Difficult to test individual modules

**Recommendation**: Split into separate files: `styles.css`, `tracker.js`, `progress.js`, `auth.js`, etc. Use a bundler (Vite) or ES modules.

### 2. CSP Not Implemented
The Content Security Policy was removed because it was too restrictive. Should be re-added with proper testing.

**Recommendation**: Add CSP headers in `vercel.json` (not meta tag) with:
```
default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://*.supabase.co;
```

### 3. Email Domain Configuration
Resend email requires verified domain DNS records. Current domain `notifications.finriskgroup.com` is `partially_failed`. From Email must match a verified domain.

**Recommendation**: Either verify the domain fully in Resend dashboard (fix DNS records) or use `onboarding@resend.dev` for testing.

### 4. Session Cookie vs localStorage Inconsistency
The session cookie (`rockcrete_session`) and localStorage (`rockcrete_session_user`) can get out of sync. If the cookie expires but localStorage still has data, the user sees the dashboard but API calls fail.

**Recommendation**: Add a periodic session validation (every 5 min) that checks the cookie and clears localStorage if expired.

### 5. `window.__role` Bridge
The old role system (`window.__role`) is a compatibility layer over the new user-based auth. Some code uses `window.__role.isAdmin()`, other code uses `rcIsSuperAdmin()`. This duplication is confusing.

**Recommendation**: Gradually migrate all `window.__role` usage to direct `window.__rcCurrentUser.role` checks.

### 6. No Rate Limiting
API endpoints have no rate limiting beyond the login lockout mechanism (5 attempts → 15-min lockout).

**Recommendation**: Add rate limiting via Vercel Edge Middleware or API-level request counting.

### 7. Tracker State Conflicts
Multiple users editing the tracker simultaneously can overwrite each other's changes (last write wins).

**Recommendation**: Implement optimistic locking with `updatedAt` timestamps or real-time sync via Supabase Realtime.

### 8. No Automated Tests
No unit tests, integration tests, or E2E tests exist.

**Recommendation**: Add at minimum:
- API tests using `vitest` or `jest`
- E2E tests using Playwright

### 9. Inline Event Handlers
Some UI elements use inline `onclick` handlers (e.g., `onclick="showModal(...)"`). These are harder to maintain and debug.

**Recommendation**: Use `addEventListener()` exclusively.

### 10. Improvement #20 — Setup API UI
Backend `api/setup.js` is fully functional but the frontend UI (System Settings panel for Supabase configuration) has not been built yet.

**Recommendation**: Add a "Database" tab to System Settings with connect/migrate/test/export/import buttons.

## Extension Points

### Adding a New API Endpoint
1. Create `api/new-endpoint.js`
2. Export default async function handler(req, res)
3. Use `requireAuth(req)` from `db.js` for auth
4. Use `parseBody(req)` for request parsing
5. Use `setJson(res, statusCode, data)` for responses
6. Add Supabase table operations to `db.js` if needed

### Adding a New Dashboard Screen
1. Add HTML section in `index.html` with `id="screen-new-screen"`
2. Add nav link with `data-route="new-screen"`
3. Add case in `showScreen()` function for initialization
4. Add rendering function(s) called from `showScreen()`

### Adding a New Role
1. Update role list in `api/auth.js` seed action
2. Update `rcUpdateAuthUI()` in `index.html` to map the role
3. Update `trackerIsTeamOrAdmin()` if the role should edit the tracker
4. Update `progressCanEdit()` if the role should manage milestones

### Adding Edit/Delete to a New Entity
The pattern established in V20 for inline edit/delete:
1. Add `data-*-edit-id` and `data-*-del-id` attributes to buttons in HTML template
2. CSS: Use `.tc-inline-edit` and `.tc-delete-confirm` classes (already styled)
3. Edit handler: swap body text → textarea + Save/Cancel buttons
4. Delete handler: append red confirmation bar with Delete/Cancel
5. Use `rcToast(message, type)` for all feedback
6. Support keyboard: Ctrl+Enter to save, Escape to cancel
