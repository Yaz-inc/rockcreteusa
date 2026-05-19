# CHANGELOG

All notable changes to the Project Blueprint Template are documented here. The template uses calendar versioning (YYYY-MM-DD).

## v0.1.0, 2026-04-27

Initial extraction from the AQUAFLOW · Blueprint del Proyecto engagement (TNR / World Bank).

**Added**
- Foundation design system: brand-agnostic slate-blue palette + warm amber accent, Inter for body, Source Serif 4 for editorial heroes
- Light + Dark + Auto theme toggle with full WCAG 2.1 AA contrast verification
- `color-scheme` declaration so native form controls (date pickers, time pickers, scrollbars) follow the theme
- Bilingual scaffolding (Spanish / English) via `data-es` / `data-en` attributes with single-toggle swap
- Mobile-responsive layout with smooth sidebar drawer on screens ≤1024px
- Modal/dialog system replacing browser `prompt()` / `alert()` / `confirm()`
- Telemetry pipeline (`extract-telemetry.py`) reading Cowork session JSONL transcripts → `panel-interno-telemetry.json`
- Task tracker on Panel Interno: live timer, manual entry form with date/time pickers, task list with cost roll-ups, milestone summaries
- AI-vs-human cost comparison with documented attribution methodology (10× multiplier, $125/hr blended senior consultant rate)
- Role gating model: client view vs. admin/manager Internal Panel
- Screen routing via sidebar `data-route` + `showScreen()` function
- `localStorage` persistence for theme, language, and in-app task edits
- Full inline documentation in HTML via comment blocks per subsystem

**Documented**
- Top-level: README.md, INSTALL.md, ARCHITECTURE.md, this CHANGELOG.md
- Detailed: docs/design-system.md, docs/theme-system.md, docs/bilingual.md, docs/telemetry.md, docs/task-tracking.md, docs/auth-and-roles.md, docs/modal-system.md, docs/accessibility.md, docs/deployment.md
- Telemetry folder: telemetry/README.md
- Customizations folder: customizations/README.md

**Known limitations**
- No backend, all writes are localStorage-only. For multi-user persistence, wire up a real backend (see ARCHITECTURE.md)
- No auth, role gating is client-side cosmetic. For real protection, put basic-auth or OAuth in front
- Telemetry extraction is per-session, multi-session aggregation requires concatenating multiple JSONL files into one before extraction
- The Driver.js guided walkthrough mentioned in the README is not yet wired in this version
- Per-audience report generators (one-page PDF for funders / leadership / team) are not yet implemented

## Future versions

Planned improvements that should be backported here from any engagement that ships them:

- Backend integration pattern (Postgres + simple REST)
- Real auth (Auth.js + TOTP MFA)
- Driver.js guided walkthrough scaffolding
- One-page PDF report generators
- Gantt timeline component
- Open-questions / blockers Kanban
- Activity feed component reading from a structured event log
- Dark-mode optimized chart palette (when charts are added)
