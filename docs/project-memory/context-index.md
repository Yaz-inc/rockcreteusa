# Context index, Rockcrete USA Website Rebuild

A one-line guide to every notable file and folder across the three surfaces of this project. Use this to decide what to read without re-scanning the whole repository or Drive folder.

**Last updated:** 2026-05-15 (initial scaffold)

## Three surfaces

| Surface | URL / path | Purpose |
|---|---|---|
| **Git repo** | https://github.com/newmindsgroup/rockcreteusa-project-blueprint | Source code, durable docs, ADRs, deploy pipeline, project memory (canonical copy in `docs/project-memory/`). |
| **Drive folder** | rockcreteusa-website-project | Non-technical artifacts, contracts, raw research, large binaries, mirror of project memory in `00 - Project Memory/`. |
| **Live dashboard** | https://rockcreteusa.projectizer.ai/ | The Blueprint Dashboard published from `blueprint-dashboard/index.html`. |

## Git repo, root layout

| Path | What it is |
|---|---|
| `README.md` | Project landing page. Replace the template README with one specific to this engagement. |
| `LICENSE` | Default MIT. Replace if your client requires different terms. |
| `CONTRIBUTING.md` | Per-engagement contribution conventions. |
| `CHANGELOG.md` | Per-engagement release log. |
| `SECURITY.md` | Vulnerability reporting for this engagement. |
| `.github/` | CODEOWNERS, PR template, issue templates, CI workflows. |
| `docs/project-memory/` | This folder. Durable AI-readable context. |
| `docs/decision-records/` | ADRs (`NNNN-title.md`). One ADR per architecturally significant decision. |
| `docs/architecture/` | Architecture diagrams (C4, sequence, data-flow, deployment). |
| `docs/project-types/` | The four project-type guides (kept here for reference; safe to delete the ones you don't need). |
| `blueprint-dashboard/` | Single-file HTML dashboard, telemetry pipeline, Vercel + Vultr deploy. See `blueprint-dashboard/README.md` and `blueprint-dashboard/docs/client-vs-internal.md`. |
| `deliverables/` | One MD file per tracked deliverable. See `deliverables/README.md`. |
| `templates/` | Paste-ready communication templates (biweekly update, interview invite, kickoff recap, milestone acceptance, closeout, change order). See `templates/README.md`. |
| `drive-folder-structure/` | Starter README templates for the parallel Drive folder. |
| `scripts/` | Operational helpers: lint-naming, new-adr, new-session, new-deliverable, new-meeting. |
| `.template/` | Template metadata (placeholders.json, post-init-checklist.md, prompts/). Safe to delete after init. |

## Project-specific repo paths

Anything specific to Rockcrete USA Website Rebuild that is not part of the template scaffold goes here. Examples:

| Path | What it is | Owner |
|---|---|---|
| `apps/backend/` | {{BACKEND_DESCRIPTION}} | {{BACKEND_OWNER}} |
| `apps/frontend/` | {{FRONTEND_DESCRIPTION}} | {{FRONTEND_OWNER}} |
| `apps/mobile/` | {{MOBILE_DESCRIPTION}} | {{MOBILE_OWNER}} |
| `packages/shared/` | {{SHARED_PACKAGE_DESCRIPTION}} | {{SHARED_PACKAGE_OWNER}} |
| `infra/` | {{INFRA_DESCRIPTION}} | {{INFRA_OWNER}} |
| `research/` | Interview notes, surveys, field-visit reports. | {{RESEARCH_OWNER}} |
| `sprints/` | Per-sprint deliverables (kebab-case folders, one per sprint). | varies |
| `deliverables/` | Formal handoff artifacts indexed by deliverable code. | varies |

Delete rows that don't apply to this project type. For branding-only engagements, you might only have `research/`, `deliverables/`, and `blueprint-dashboard/`.

## Drive folder, top-level

If you copied `drive-folder-structure/` into the project's actual Drive folder, the layout looks like this. See `drive-folder-structure/README.md` for the convention.

| Drive path | Purpose |
|---|---|
| `00 - Project Memory/` | Mirror of `docs/project-memory/` from the Git repo (filenames in SCREAMING_CASE). |
| `01 - Procurement and Contracts/` | Active contracts, SOWs, change orders, historical proposals. |
| `02 - Team/` | CVs, IDs, NDAs, profiles, contact info. |
| `03 - Client Documents/` | Client-supplied reference material. **Never rename.** |
| `04 - Ideation/` | Brainstorm artifacts, candidate use cases, exploratory notes. |
| `99 - Archive/` | Backups, superseded drafts, redundant zips. |

Add a `05 - Blueprint Dashboard/` folder if the dashboard's working files (`foundation-theme-preview.html`, telemetry source data, etc.) live in Drive rather than Git.

## VPS, dashboard hosting

| Item | Value |
|---|---|
| Live URL | https://rockcreteusa.projectizer.ai/ |
| Deploy host | {{DEPLOY_HOST}} |
| Deploy user | {{DEPLOY_USER}} |
| Deploy path | {{DEPLOY_PATH}} |
| Auth gate | {{AUTH_GATE}} |

Credentials live in `blueprint-dashboard/deploy/.env` (git-ignored). See `blueprint-dashboard/deploy/DEPLOY.md` for operational playbook.

## External systems

| System | URL | Purpose |
|---|---|---|
| {{EXTERNAL_SYSTEM_1}} | {{EXTERNAL_URL_1}} | {{EXTERNAL_PURPOSE_1}} |
| {{EXTERNAL_SYSTEM_2}} | {{EXTERNAL_URL_2}} | {{EXTERNAL_PURPOSE_2}} |

Examples: Linear / Jira project URL, Figma file, Notion workspace, Slack channel, Google Doc workspace, support inbox, status page.

## Working web URLs

| URL | Purpose | Auth |
|---|---|---|
| https://rockcreteusa.projectizer.ai/ | Live Blueprint Dashboard | {{AUTH_GATE}} |
| https://github.com/newmindsgroup/rockcreteusa-project-blueprint | Source code repository | GitHub login |

## Key people

See `team-structure.md` for the full picture. Quick reference:

- **Daniel Gonell** - project lead, primary contact for the team.
- **{{CLIENT_PRIMARY_CONTACT}}** - primary contact at Rockcrete USA.
- **{{REVIEWER_NAME}}** - reviewer / counterparty (if applicable).

## Maintenance

When you create, move, or rename a notable file:

1. Update this file in the same change.
2. If a top-level Git folder changes, also update `folder-structure.md`.
3. If you change a name, also update `naming-conventions.md` if the rename revealed a new edge case.
