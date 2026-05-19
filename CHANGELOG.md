# CHANGELOG, Project Blueprint Template

All notable changes to the template itself live here. Per-engagement changelogs live in each engagement's own repo.

The template uses calendar versioning (`YYYY-MM-DD`).

## v0.5.1, 2026-05-06

Internal consistency pass after v0.5.0. Fixes eight drift items surfaced by a thorough cross-file audit.

**Fixed (dashboard role-gating)**

- `blueprint-dashboard/index.html` now actually implements the role-gating pattern that `blueprint-dashboard/docs/client-vs-internal.md` documents. Adds:
  - The `setRole()` IIFE at the top of the inline `<script>` that reads the `?admin=7c63ef71e1ba66344ddfcdf1` URL param, sets `localStorage.aquaflow_role`, and adds `role-guest` or `role-admin` to `<body>`.
  - `window.__role` helper with `isAdmin()`, `current()`, `toggle()`.
  - The CSS rule `body.role-guest [data-admin-only] { display: none !important }` in the inline `<style>`.
  - `data-admin-only` attribute on the "Interno (Admins y Managers)" nav-group and the `#screen-panel` (Panel Interno) screen container.
  - The `7c63ef71e1ba66344ddfcdf1` placeholder gets filled by `init.sh` per `.template/placeholders.json`.

**Fixed (stale references)**

- "17 memory files" updated to "24 memory files" in top-level `README.md` and in `kickoff-orchestrator.md`'s output template.

**Fixed (kickoff Phase 6 batch list)**

- The Phase 6 per-file population batches in `kickoff-orchestrator.md` now include `contract-review.md`, `pre-kickoff-checklist.md`, and `lessons-learned.md`, plus a "Notes" block explaining when each one is populated vs. left as template state.

**Fixed (templates folder threading)**

- `docs/project-memory/ai-playbook.md`: adds prompts that explicitly reference `templates/biweekly-update.md`, `templates/weekly-update.md`, `templates/kickoff-recap-email.md`, `templates/milestone-acceptance-request.md`, `templates/closeout-report-email.md`, `templates/change-order-request.md`, `templates/interview-invitation.md`. Replaces the older "weekly client update" prompt that invented its own structure.
- `.template/prompts/lifecycle-orchestrator.md`: the "Draft this week's client update" task now points at `templates/weekly-update.md` / `templates/biweekly-update.md` as the format of record. Adds five new tasks: "Send a kickoff recap email", "Request milestone acceptance from the client", "Draft a change order request", "Invite stakeholders to discovery interviews".

**Fixed (post-init-checklist completeness)**

- `.template/post-init-checklist.md` adds steps for `contract-review.md` (review only if a contract has been received), `pre-kickoff-checklist.md` (reusable; run the dress rehearsal before each major meeting), and `lessons-learned.md` (leave empty at init; first entry at first retrospective).

**Fixed (research folder lifecycle)**

- Adds `research/README.md` so the folder exists in Git from the first commit, with documentation of the layout (`meetings/`, `interviews/`, `workshops/`), file naming, privacy rules, and what belongs here vs. elsewhere. `scripts/new-meeting.sh` now has a stable target directory at scaffold time.

**Fixed (.gitignore consistency)**

- Removes the `!.vscode/settings.json.example` exception (the file didn't exist, the exception was misleading). `.vscode/` is now plainly ignored.

## v0.5.0, 2026-05-06

Ports five universal patterns from the TNR-era project memory that the template was missing, adds a `templates/` folder for communications, and parameterizes the orchestration prompts so other firms can tune them with a single search-and-replace pass.

**Added (memory)**

- `docs/project-memory/contract-review.md`: pre-signature contract review template. Structured checklist across identity, scope, money, IP, confidentiality, warranties, termination, dispute resolution, conflict of interest, compliance, subcontractors, funder/third-party clauses. GREEN / YELLOW / RED flags per row. Negotiation log + sign-off block.
- `docs/project-memory/pre-kickoff-checklist.md`: 90-minute dress rehearsal before any major client-facing meeting. Nine sections (A through I) covering dashboard tech, captures, presentation mode, PDF handout, communication, logistics, key facts to know cold, mentality, T-30 final check. Plan-B table for failure modes.
- `docs/project-memory/lessons-learned.md`: append-only retrospective log. Four-part lesson structure (what we tried, what happened, what we learned, what we'd change). Categories, end-of-engagement retrospective prompts, backport-candidate table for lessons that should ship back to this template.

**Added (templates folder)**

- `templates/README.md`: when to use which template, conventions, how to add new ones.
- `templates/biweekly-update.md`: the most-used recurring deliverable.
- `templates/weekly-update.md`: shorter Friday-morning sibling.
- `templates/interview-invitation.md`: four flavors (executive / manager / field / external).
- `templates/kickoff-recap-email.md`: sent within 24 hours of kickoff.
- `templates/milestone-acceptance-request.md`: triggers a payment milestone.
- `templates/closeout-report-email.md`: engagement close.
- `templates/change-order-request.md`: documents scope changes.

**Added (scripts)**

- `scripts/new-meeting.sh`: scaffolds a per-meeting notes file under `research/{meetings,interviews,workshops}/` from `meeting-notes-template.md`.

**Updated (prompts, for firm-tunability)**

- `.template/prompts/kickoff-orchestrator.md`: adds a "Tune before first use" block at the top documenting the four search-and-replace strings (`newmindsgroup`, `New Minds Group`, `155.138.203.28`, `projectizer.ai`) other firms substitute before saving their tuned copy.
- `.template/prompts/lifecycle-orchestrator.md`: same tunability block.

**Updated (indexes)**

- `docs/project-memory/README.md`: reading order grows from 21 to 24 files.
- `docs/project-memory/folder-structure.md`: documents `templates/` and `scripts/new-meeting.sh`.
- `docs/project-memory/context-index.md`: new rows for `templates/`, `scripts/new-meeting.sh`.
- Top-level `README.md`: knowledge base count updated to 21; communications template library called out.

**Why these patterns**

The TNR engagement had a `CONTRACT_REVIEW.md`, a `PRE-KICKOFF-DRESS-REHEARSAL.md`, a biweekly progress report template, and interview invitation templates. All four are universally useful across any engagement type and were missing from the template. Lessons-learned is added because every engagement should produce backportable insights, and the template's growth path depends on those backports.

The communications templates close the gap between "the AI playbook tells the agent to draft a weekly update" and "the agent has a tested format to follow." Now both layers exist: the playbook for the agent's prompt, the template for the output structure.

## v0.4.0, 2026-05-06

Codifies the **Git-canonical source-of-truth doctrine** across the entire template. The per-engagement Git repository is now explicitly stated as the single source of truth; Drive and the deployed dashboard are explicitly described as one-way mirrors of Git, never canonical. Every doc that previously called the three surfaces "in sync" now defers to the doctrine for conflict resolution. Every working session must end with `git push` succeeding or it didn't happen.

**Added**

- `docs/project-memory/source-of-truth.md`: the doctrine. Single page. Covers: the rule (Git is canonical), what's in Git (everything except secrets), what's NOT in Git (the short exception list with examples), how the surfaces relate to Git, conflict resolution, the handoff protocol for new humans and new AI agents, the four-check rule for closing a session, how the orchestration agent enforces this, common situations and the right behavior, and a TL;DR.

**Updated for the doctrine**

- `docs/project-memory/README.md`: `source-of-truth.md` is now item #1 in the reading order. The "end of session" rules are now the four-check rule (lint clean, no uncommitted changes, push succeeded, session-log entry committed and pushed). Three-surface section explicitly says Git is canonical and the others mirror it.
- `docs/project-memory/instructions.md`: the AI prompt block now leads with the source-of-truth rule. Memory maintenance rules now require `git pull` at session start and `git push` at session end. Three surfaces section explicitly mirrors Git. Closing-a-session block added with the four-check rule.
- Top-level `README.md`: now opens with "The source-of-truth rule" callout immediately after the headline. The 17-file knowledge base is now 18 files (source-of-truth added).
- `drive-folder-structure/README.md`: now opens with "The source-of-truth rule" stating Git is canonical and Drive is a one-way mirror. The "How to use this folder" step that mirrors memory files into Drive is now explicit about the one-way direction.
- `.template/post-init-checklist.md`: top-of-file reminder that every step ends with `git add && git commit && git push`. Local edits don't count until pushed.
- `.template/prompts/kickoff-orchestrator.md`: conventions section adds "Git is the single source of truth" as the first non-negotiable. Resume protocol now checkpoints to `.kickoff/state.md` IN GIT (committed and pushed), not a local file. "Never do" list adds: never treat non-Git surfaces as canonical, never close a session with uncommitted changes, never save kickoff state to a local-only file.
- `.template/prompts/lifecycle-orchestrator.md`: new "Source-of-truth rule" section near the top. Memory maintenance rules now require `git pull` at start and `git push` at end. Output format clarified: only `Status: pushed` is "done". "Never do" list extended to enforce the doctrine.

**Why this matters**

A new teammate, a new AI agent, a new IDE, a new contractor, a fresh you in a new session: any of them can clone the per-engagement Git repo and have everything they need to continue. They don't need to talk to anyone, they don't need access to Drive, they don't need a recent local checkout. This is what makes the project portable across people, tools, and time. v0.4.0 makes that explicit and enforces it at every layer.

## v0.3.1, 2026-05-06

`scripts/lint-naming.sh`: extend the em-dash allowlist to include the two orchestration prompts, since they need to literally state the no-em-dash rule for the consuming agent. The prompts themselves are read by another LLM, not by humans only, so the literal em-dash character must appear in the rule.

## v0.3.0, 2026-05-06

Adds the orchestration-prompt layer. The template now ships with two prompts that turn an orchestration agent (Cowork or Claude Code with standing access to GitHub / Vercel / Vultr / Drive) into an autonomous project-management system that runs end-to-end against any new engagement.

**Added**

- `.template/prompts/kickoff-orchestrator.md`: the master kickoff prompt. Phases 0-13 cover sanity check, deep client-folder ingestion (delegated to a subagent), gap analysis with `AskUserQuestion`, repo creation via the GitHub Template API, non-interactive `init.sh` run, parallel per-file population via subagents (6 batches), deliverables scaffolding, dashboard customization, commit/push/lint, Vercel (or Vultr) deploy, Drive mirror, audit, handoff summary, session-log entry. Includes a checkpoint/resume protocol for long kickoffs (saves to `.kickoff-state.md`), a failure-modes table, and a "what you must NEVER do" list. ~600 lines; intentionally verbose for reliability.
- `.template/prompts/lifecycle-orchestrator.md`: the per-task companion. Standard task patterns for status updates, weekly client updates, interview synthesis, deliverable acceptance, dashboard updates, weekly risk review, steering committee snapshots, and engagement closeout. Pairs with the per-engagement `docs/project-memory/ai-playbook.md` for project-specific tuning.
- `.template/prompts/README.md`: when to use which prompt, recommended trigger surface (Cowork over Claude Code), required standing access, tuning per organization, testing recipe before first real use, where to keep tuned copies.

**How to use**

Open Cowork, select the new client's Drive folder, paste `kickoff-orchestrator.md`. ~30 minutes later: live private repo at `github.com/newmindsgroup/{{client-slug}}`, deployed dashboard at `https://{{client-slug}}-blueprint.vercel.app/`, populated `00 - Project Memory/` Drive mirror, handoff summary. Subsequent sessions use `lifecycle-orchestrator.md` per task.

**Why this matters**

v0.2 made the template a complete single-project management tool. v0.3 makes it operationalizable: a single orchestration agent across multiple companies, multiple projects, multiple clients can stand up new engagements from a Drive folder selection without the operator hand-walking 20 placeholders or manually wiring Vercel.

## v0.2.1, 2026-05-06

Lint fixes that should have shipped with v0.2.0:

- `scripts/lint-naming.sh`: add `VERCEL.md` to the SCREAMING_CASE allowlist (same pattern as `DEPLOY.md`, `INSTALL.md`, `ARCHITECTURE.md`).
- `blueprint-dashboard/docs/client-vs-internal.md`: replace two em-dashes with colons.

## v0.2.0, 2026-05-06

Major fill-in: turns the template from a starting point into a complete single-project management tool. Closes 15 gap items identified after v0.1.0.

**Added (deploy)**

- `blueprint-dashboard/deploy/VERCEL.md`: full Vercel deployment guide. Vercel Hobby is now the documented default for new engagements; Vultr remains for engagements that need real auth or multi-tenancy.
- `blueprint-dashboard/deploy/vercel.json`: project config with rewrites, security headers, cache headers.
- `blueprint-dashboard/deploy/DEPLOY.md`: now leads with a Vercel-vs-Vultr decision tree and links out to VERCEL.md.

**Added (tracking templates in `docs/project-memory/`)**

- `phases-and-milestones.md`: canonical phase / milestone / deliverable / task tracker. Single source of truth for everything dated.
- `stakeholder-register.md`: tier 1 / 2 / 3 contacts, what they care about, what they can block, communications log.
- `risk-register.md`: P x I matrix, mitigation, owner, trigger, materialized log. Common risks per project type.
- `budget-and-payments.md`: contract value, payment milestones, cost-side allocation, AI tooling cost summary, invoice log.
- `client-intake.md`: day-1 / week-1 questionnaire across identity, scope, people, process, money, compliance, brand, technical.
- `kickoff-agenda.md`: minute-by-minute first-meeting script with Plan B for common failure modes and pre-meeting checklist.
- `glossary.md`: bilingual terminology and acronym reference.
- `environments.md`: hosting target, surface map, secrets per environment, DNS, health checks, disaster recovery.
- `ai-playbook.md`: standard prompts (daily standup, weekly client update, interview synthesis, sprint demo update, brand re-skin, telemetry refresh, ADR generation, kickoff agenda generation, lint pass) plus operational patterns and anti-patterns.
- `meeting-notes-template.md`: structured template for every meeting / interview, plus the 24-hour after-meeting checklist.

**Added (deliverables)**

- `deliverables/README.md`: per-deliverable tracking convention.
- `deliverables/0000-template.md`: per-deliverable spec template (status, owner, TOC, sources, dependencies, acceptance criteria, review log, sign-off, post-acceptance changes).
- `scripts/new-deliverable.sh`: scaffolds the next deliverable file with auto-incremented number.

**Added (client-vs-internal pattern)**

- `blueprint-dashboard/docs/client-vs-internal.md`: explains the URL-param + localStorage admin-gating pattern, what to put behind `data-admin-only`, the cosmetic-not-secure caveat, and how to add new admin-only screens.
- `blueprint-dashboard/index.html`: the `<title>`, `<meta description>`, OG tags, `<html lang>`, and `theme-color` are now placeholdered so init.sh fills them automatically.

**Updated**

- `.template/placeholders.json`: bumped to v0.2.0. Adds CLIENT_DOMAIN, DEPLOY_HOSTING (vercel|vultr|none), VERCEL_PROJECT_NAME, INTERNAL_AUTH_METHOD, ADMIN_TOKEN. Default DASHBOARD_URL now `https://rockcreteusa-blueprint.vercel.app/`.
- `.template/post-init-checklist.md`: expanded from 12 to 20 steps. Vercel and Vultr deploy paths each get their own block. New steps for phases, stakeholders, risks, budget, glossary, intake, kickoff, environments, AI playbook.
- `docs/project-memory/README.md`: reading order expanded from 10 to 20 files.
- `docs/project-memory/folder-structure.md`: documents the `deliverables/` folder and the new dashboard deploy + docs subtree.
- `docs/project-memory/context-index.md`: new rows for `deliverables/`, dashboard subfiles, scripts/new-deliverable.sh.
- `docs/project-memory/instructions.md`: the AI-prompt block now references all 17 memory files and the hosting target.
- Top-level `README.md`: leads with Vercel as default, lists the 17-file knowledge base, mentions `deliverables/`.

**Why this matters**

v0.1.0 was a structurally complete starting point. v0.2.0 is what an AI agent reads to understand the engagement end-to-end on day one. After init.sh + the post-init-checklist, every dated commitment, every stakeholder, every risk, every dollar, every meeting, every standard prompt, and every deploy decision has a documented home in the repo.

## v0.1.0, 2026-05-06

Initial public release. Extracted from the AQUAFLOW / TNR engagement and made project-agnostic.

**Added**

- Top-level governance: `README.md`, `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.gitignore`, `.editorconfig`, `.gitattributes`.
- `init.sh` (macOS / Linux) and `init.ps1` (Windows) interactive bootstrap that prompts for placeholder values and runs a single find-and-replace pass over every text file.
- `.template/placeholders.json` declaring every placeholder with description, prompt, default, and validation regex.
- `.template/post-init-checklist.md` enumerating every manual step needed after the init script (rename, brand color, dashboard customizations, deploy creds).
- `.github/` scaffolding: `CODEOWNERS`, PR template, three issue templates (bug, feature, decision-record), and a CI workflow that runs `scripts/lint-naming.sh` on every push.
- `docs/project-memory/` knowledge base: `overview.md`, `status.md`, `decisions.md`, `session-log.md`, `context-index.md`, `team-structure.md`, `instructions.md`, `folder-structure.md`, `naming-conventions.md`, `writing-conventions.md`. Each carries placeholders and a `## Replace before first commit` callout.
- `docs/decision-records/` with an ADR template and README.
- `docs/project-types/` with one guide per supported project type: software/app, branding/identity, website/marketing, AI implementation. Each lists the deliverable categories, lifecycle stages, common risks, and how to extend the dashboard for that type.
- `docs/architecture/` placeholder folder with a README pointing to where C4 / sequence / data-flow diagrams should land.
- `blueprint-dashboard/` ported in full from the prior extraction: `index.html`, `customizations/`, `docs/{design-system,theme-system,bilingual,telemetry,task-tracking,auth-and-roles,modal-system,accessibility,deployment}.md`, `telemetry/{extract-telemetry.py, panel-interno-telemetry.example.json, tasks.example.json, README.md}`.
- `blueprint-dashboard/deploy/` pipeline: genericized `deploy.sh`, `watch-and-deploy.sh`, `vps-bootstrap.sh`, `DEPLOY.md`, `.env.example`, plus a reference GitHub Actions workflow.
- `drive-folder-structure/` starter READMEs for the parallel Drive folder convention (00 - Project Memory, 01 - Procurement, 02 - Team, 03 - Client Documents, 04 - Ideation, 99 - Archive).
- `scripts/` operational helpers: `lint-naming.sh` (kebab-case ASCII enforcement), `new-adr.sh` (scaffold next ADR), `new-session.sh` (prepend a session-log entry).

**Documented**

- Three-surface model (Git + Drive + VPS) with naming rules per surface.
- Bilingual writing conventions including the no-em-dash rule.
- ADR convention and append-only decisions log.
- Init flow with examples for software, branding, website, and AI-implementation projects.

**Known limitations**

- Init script only runs find-and-replace; it does not delete project-type-irrelevant files. Manual cleanup after init is documented in `.template/post-init-checklist.md`.
- Deploy pipeline assumes a Linux VPS reachable by SSH key. For PaaS targets (Vercel, Netlify, Cloudflare Pages) you swap `deploy.sh` for the platform's native CLI.
- The dashboard's role gating is client-side cosmetic. For real protection, put basic-auth or OAuth in front. See `blueprint-dashboard/docs/auth-and-roles.md`.
- The naming-lint CI workflow only checks tracked-file paths against a kebab-case allowlist. It does not check file content.

## Future versions

Backport from any engagement that ships them:

- Headless CMS hook (Sanity / Contentful) for content-heavy dashboards.
- Real auth service template (Node + SQLite + sessions, lifted from the TNR auth-service).
- One-page PDF report generator wired into the dashboard.
- Terraform module for VPS provisioning.
- GitHub Actions workflow for branch protection bootstrap.
- Project-type starter content for `data` and `consulting-only` engagements.
