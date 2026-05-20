# ARCHITECTURE, Project Blueprint Template

A high-level map of how the dashboard is structured, why each piece exists, and where each architectural decision was made.

## Operating model

The dashboard is **a static, single-page HTML application** that loads two data files at runtime to populate its dynamic regions. There is no build step, no backend, no database. Everything lives in the file system; everything renders in the browser.

This is a deliberate constraint. It means:

- A consultant can open the dashboard from a USB stick if necessary
- The artifact and the source code are the same thing, there is nothing to "compile"
- Any AI tool, any future contributor, any client IT person can read and modify the code without first installing a toolchain
- Git versioning of the dashboard versions the visible product

The trade-off is that anything stateful (live multi-user collaboration, persistent backend writes) requires adding a backend later. That's fine, the data shape is JSON, so swapping `fetch('telemetry/foo.json')` for `fetch('/api/foo')` is the migration path.

## Three-file architecture

```
dashboard/
├── index.html                                  the entire UI: HTML + CSS + JS in one file
└── telemetry/
    ├── panel-interno-telemetry.json           AI session telemetry (refresh per session)
    └── tasks.json                              tasks, milestones, time entries (manual)
```

That's it. Three files. The HTML loads the two JSONs at startup via `fetch()` and renders their content into the Panel Interno screen.

## Why one HTML file

Splitting the dashboard into `index.html` + `style.css` + `app.js` is the conventional move. We didn't do it. Reasons:

1. **Single-file artifacts are immune to broken imports.** No "missing CSS" surprises when the file is opened from a non-server context.
2. **The file is still readable.** Sections are heavily commented. A grep through the file finds everything.
3. **The first version isn't large enough to justify split.** When the file exceeds ~3000 lines, we'll revisit. Until then, single-file wins.
4. **No build step required.** Splitting would require an importer or bundler in production, breaking the "open it on any machine" property.

If you fork this template and want to split, the natural seams are: theme tokens & base CSS → `style.css`, components & screens → `style-components.css`, runtime JS → `app.js`. The HTML structure stays intact.

## Subsystems and where they live in the code

The single `index.html` is organized into clearly-labeled sections. Each section is preceded by a comment header explaining its purpose. Subsystems:

| Subsystem | Location in HTML | Detailed doc |
|---|---|---|
| **Theme tokens (colors, typography, motion)** | `<style>` THEME TOKENS block at top | [docs/design-system.md](docs/design-system.md) |
| **Dark mode** | `[data-theme="dark"]` selector + `color-scheme` | [docs/theme-system.md](docs/theme-system.md) |
| **Bilingual text** | `data-es` / `data-en` attributes everywhere | [docs/bilingual.md](docs/bilingual.md) |
| **Layout (topbar, sidebar, main)** | `.topbar`, `.sidebar`, `.layout` CSS + matching markup | [docs/design-system.md](docs/design-system.md) |
| **Mobile drawer** | sidebar @media query + JS toggle | [docs/design-system.md](docs/design-system.md) |
| **Modal/dialog system** | `dialog.modal` CSS + `showModal()` JS function | [docs/modal-system.md](docs/modal-system.md) |
| **Screen routing (SPA-like)** | `.screen` CSS + `showScreen()` JS function | inline JS comment |
| **Telemetry pipeline** | `telemetry/extract-telemetry.py` + JSON loader in HTML | [docs/telemetry.md](docs/telemetry.md) |
| **Task tracking + roll-ups** | `renderTasks()` / `renderMilestones()` JS | [docs/task-tracking.md](docs/task-tracking.md) |
| **Role gating** | `data-role` attribute pattern (sidebar groups) | [docs/auth-and-roles.md](docs/auth-and-roles.md) |

## Data flow

Page load:
```
1. <html> loads with data-theme="light"
2. JS reads localStorage → applies saved theme + language
3. fetch() telemetry JSONs in parallel
4. renderPanel() / renderTasks() / renderMilestones() populate Panel Interno
5. User interactions update in-memory state + localStorage
   (in production: also POST to backend)
```

Telemetry refresh (per session):
```
1. Consultant runs: python3 telemetry/extract-telemetry.py path/to/session.jsonl
2. Script aggregates tokens, timestamps, tool calls
3. Script writes telemetry/panel-interno-telemetry.json
4. Next page load picks up the refreshed data
```

Task time entry (in-app):
```
1. Consultant opens Manual Entry modal or Stops the live timer
2. Form values flow into TASKS_DATA in memory
3. saveTasksLocally() writes to localStorage (production: POST to backend)
4. renderTasks() / renderMilestones() recompute roll-ups
```

## State management

There is no Redux, no Zustand, no observable store. Two top-level variables hold all dynamic state:

- `TELEMETRY`, the parsed `panel-interno-telemetry.json`
- `TASKS_DATA`, the parsed `tasks.json` plus any in-app modifications

Mutations happen directly. Re-renders are triggered by calling `renderPanel()` / `renderTasks()` / `renderMilestones()`. This is intentionally crude, the UI is not large enough to justify reactive infrastructure, and the crude approach means a junior contributor or a future AI session can read the code top-to-bottom and understand it immediately.

## Routing

Sidebar links carry `data-route="NAME"`. Clicking one calls `showScreen('NAME')` which swaps which `<div class="screen" id="screen-NAME">` has `data-active="true"`. The hash in the URL updates so refreshes preserve the route. No history.pushState, refreshing always works.

## Styling discipline

- Every color, font, radius, shadow, transition is a CSS custom property declared on `:root`
- Components use BEM-ish class names (`.btn`, `.btn--primary`, `.btn--icon`)
- No utility classes invented locally, Tailwind via CDN is loaded but only used for spacing and grid utilities. Component-level styling lives in the component's own CSS rules.
- Dark mode is applied via `[data-theme="dark"]` selector at root, not via class toggling on every component

## Performance posture

The dashboard is small enough that performance is a non-issue:

- Single HTTP request for HTML (with two JSON requests on the side, both small)
- Tailwind CDN is the largest dependency (~50KB gzipped); could be removed by writing the few utilities used, but the convenience-vs-bytes trade-off favors keeping it
- Lucide icon library loads asynchronously
- All animation respects `prefers-reduced-motion`

## Accessibility posture

WCAG 2.1 AA is the target. See [docs/accessibility.md](docs/accessibility.md) for the full checklist. Highlights:

- All interactive elements are keyboard-reachable
- Visible focus rings on `:focus-visible`
- Semantic landmarks (header, nav, main, section, article)
- aria-labels on icon-only buttons
- aria-current on active nav link
- aria-pressed on toggle buttons
- All color contrast pairs verified ≥4.5:1 for normal text, ≥3:1 for large text and UI components

## Why this architecture compounds

The entire template is < 5,000 lines of code, no dependencies, no build step. A new team member or a new AI session can read the file and understand it within an hour. Every architectural decision is a comment away from being explained. Every new engagement starts at a known, documented baseline. There is no "hidden state", everything that determines what you see is in version control, in the JSON, or in the URL hash.

This is the entire point of the template: ship the *finished* artifact upstream, not just the *idea* of it.
