# System Architecture

## File: `index.html` (~9,100 lines, ~498KB)

Single-page application containing ALL HTML, CSS, and JavaScript.

## Section Map

| Section | Lines | Description |
|---------|-------|-------------|
| **CSS Design Tokens** | 1–50 | Root variables: colors, radius, shadows, spacing, timing |
| **Dark Theme Tokens** | 51–100 | `:root[data-theme="dark"]` overrides |
| **Component CSS** | 100–2319 | Topbar, sidebar, cards, KPIs, tables, badges, tracker, progress, profile, users, settings, login gate, user dropdown, my-dashboard, action permissions |
| **Login Gate HTML** | 2322–2424 | Full-screen 2-column login page (left=form, right=project info) |
| **Instant Session Restore** | 2425–2443 | Inline `<script>` that reads localStorage to avoid login flash |
| **App Shell HTML** | 2444–4717 | Topbar, sidebar nav, and all `<main>` screen sections |
| **Screen: Home** | 2582–2703 | My Dashboard cards, hero, phase strip, KPI grid |
| **Screen: Schedule** | 2708–2773 | Phase table, meetings table |
| **Screen: Tracker** | 2778–2855 | Summary KPIs, phase progress, calendar, kanban, role checklists |
| **Screen: Progress** | 2861–2924 | Team Progress with milestones, activity feed |
| **Screen: Scope** | 2929–2980 | In-scope / out-of-scope lists |
| **Screens: Phase 1-4** | 2980–4100 | Detailed phase content with embedded task trackers |
| **Screens: Integrations, Migration, etc.** | 4100–4500 | Static informational screens |
| **Screens: Panel, Pricing** | 4500–4600 | Admin-only operations panel |
| **Screens: Profile, Users, Settings** | 4600–4717 | Account management screens |
| **Lucide + JS Boot** | 4718–4730 | Icon initialization |
| **Core JS Functions** | 4730–5075 | Nav, language, theme toggle, modal, search, routing |
| **Home KPI Engine** | 5081–5284 | `rcHomeBoot()` IIFE — live phase/milestone counter |
| **Project Tracker Engine** | 5286–6065 | Data loading, state management, all render functions |
| **Panel Interno Telemetry** | 6068–6250 | Operations panel data rendering |
| **Pricing Module** | 6250–6400 | Invoice/payment rendering |
| **Progress/Milestones Engine** | 6400–7437 | Milestone CRUD, progress updates, activity feed |
| **Auth & User System** | 7439–7926 | Login gate, session management, auth init, role bridge |
| **Profile Screen JS** | 7965–8078 | Profile load/save, password change |
| **Users Screen JS** | 8082–8600 | User CRUD, table rendering |
| **Settings Screen JS** | 8600–8780 | Settings load/save |
| **Team Management JS** | 8780–9096 | Team CRUD, member management |

## Global Variables

| Variable | Line | Type | Purpose |
|----------|------|------|---------|
| `TRACKER_DATA` | ~5289 | `var` | Seed data from `project-tracker.json` |
| `TRACKER_STATE` | ~5290 | `var` | Runtime task/access state patches |
| `ASSIGNEES_CACHE` | ~5291 | `var` | Cached assignee list from API |
| `MILESTONES_DATA` | ~6641 | `var` | Milestones grouped by task ID |
| `PROGRESS_UPDATES` | ~6642 | `var` | Progress activity feed entries |
| `PROGRESS_VIEW` | ~6643 | `var` | Filter: `'all'` or `'mine'` |
| `TELEMETRY` | ~6080 | `let` | Panel Interno telemetry data |
| `window.__rcCurrentUser` | ~7456 | `object\|null` | Current authenticated user |
| `window.__role` | ~7505 | `object` | Legacy role bridge |
| `RC_SESSION_KEY` | ~7623 | `const` | localStorage key: `'rockcrete_session_user'` |
| `__rcUsersCache` | ~8084 | `let` | Cached users array |
| `tmTeamsCache` | ~8790 | `let` | Team Management team cache |

> **IMPORTANT**: `TRACKER_DATA`, `TRACKER_STATE`, `ASSIGNEES_CACHE`, `MILESTONES_DATA`, `PROGRESS_UPDATES`, `PROGRESS_VIEW` must be declared with `var` (not `let`/`const`) because they are accessed by `showScreen()` → `renderTracker()` before their declarations execute (Temporal Dead Zone issue).

## Rendering Pipeline

```
Page Load
├── Instant Session Restore (line ~2425)
│   └── Checks localStorage, hides login gate, shows .app div
├── DOMContentLoaded
│   ├── lucide.createIcons()
│   ├── syncAuthNav()
│   ├── setLang('en')
│   └── setTheme(saved)
├── showScreen(initialRoute) from URL hash
│   └── May call renderTracker() if route is tracker/phase-*
├── rcHomeBoot() IIFE — calculates live KPIs
├── Tracker Data Load (Promise.all)
│   ├── fetch('./data/project-tracker.json') → TRACKER_DATA
│   ├── fetch('./api/tracker') → remote state
│   ├── trackerApplyState() → merge patches onto seed
│   └── renderTracker()
│       ├── renderTrackerSummary()
│       ├── renderTrackerPhases()
│       ├── renderTrackerCalendar()
│       ├── renderTrackerKanban()
│       ├── renderTrackerRoles()
│       ├── renderTrackerAccess()
│       └── renderAllPhaseEmbeds()
├── Progress Dashboard Init
│   ├── fetchMilestones() → MILESTONES_DATA
│   ├── fetchProgress() → PROGRESS_UPDATES
│   └── renderProgressDashboard()
└── rcAuthInit()
    ├── Load cached user from localStorage
    ├── rcUpdateAuthUI() → window.__role bridge
    ├── rcPostAuthRender() → re-renders tracker + progress
    └── API verify (GET /api/auth?action=me)
```

## Navigation & Routing

**Function**: `showScreen(route)` (line ~5050)

1. Hides all `.screen` elements
2. Shows `#screen-{route}`
3. Updates sidebar active state
4. Pushes `#{route}` to URL hash
5. Special hooks:
   - `tracker` or `phase-*` → calls `renderTracker()`
   - `team-mgmt` → calls `tmLoadAll()`
   - `profile` → calls `rcProfileLoad()`
   - `users` → calls `rcUsersRender()`
   - `settings` → calls `rcSettingsLoad()`

## Event Delegation

The tracker uses delegated event listeners on the `#screen-tracker` container:
- `change` events: status selects, due date inputs, assignee selects, access status selects
- `click` events: comment buttons, role checkboxes
- All changes call `saveTrackerState()` which PUTs to `/api/tracker`

## CSS Architecture

### Design Tokens (`:root`)
```css
--color-primary: #0d5b54;
--color-accent: #e96d1f;
--color-bg: #f5f5f0;
--color-surface: #ffffff;
--color-text: #1a1a1a;
--radius-sm/md/lg: 4px/8px/12px;
--shadow-sm/md/lg: box-shadow values;
--font-body: 'DM Sans', sans-serif;
```

### Dark Theme
Activated via `data-theme="dark"` on `<html>`. Overrides all color tokens.

### Component Pattern
All components use BEM-like naming: `.tracker-kpi`, `.tracker-phase-card`, `.progress-tile`, etc. Styles are in the `<style>` block within `<head>`.
