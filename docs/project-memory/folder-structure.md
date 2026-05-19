# Folder structure, Rockcrete USA Website Rebuild

The canonical layout of the Git repo and the Drive folder. If you add, move, or rename a top-level folder, update this file in the same change.

**Last updated:** 2026-05-15

## Git repo layout

```
rockcreteusa-website-rebuild/
├── README.md                        Project landing page.
├── LICENSE                          MIT (or replace).
├── CONTRIBUTING.md                  Per-engagement contribution conventions.
├── CHANGELOG.md                     Per-engagement release log.
├── SECURITY.md                      Vulnerability reporting.
├── .github/
│   ├── CODEOWNERS                   Review routing.
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug-report.md
│   │   ├── feature-request.md
│   │   └── decision-record.md
│   └── workflows/
│       └── lint-naming.yml          CI: enforce kebab-case ASCII.
├── docs/
│   ├── project-memory/              AI-portable context (this folder, 21 files).
│   ├── decision-records/            ADRs (NNNN-title.md).
│   ├── architecture/                Architecture diagrams.
│   └── project-types/               Type-specific guides (delete the ones not relevant).
├── blueprint-dashboard/             Single-file HTML dashboard + telemetry + deploy.
│   ├── deploy/
│   │   ├── VERCEL.md                Vercel deployment guide (default target).
│   │   ├── vercel.json              Vercel project config.
│   │   ├── DEPLOY.md                Vultr / VPS deployment guide.
│   │   ├── deploy.sh, watch-and-deploy.sh, vps-bootstrap.sh
│   │   └── .env.example
│   └── docs/client-vs-internal.md   How admin-only sections are gated.
├── deliverables/                    One MD file per tracked deliverable.
│   ├── README.md
│   └── 0000-template.md             Per-deliverable spec template.
├── templates/                       Paste-ready communication templates.
│   ├── biweekly-update.md
│   ├── weekly-update.md
│   ├── interview-invitation.md
│   ├── kickoff-recap-email.md
│   ├── milestone-acceptance-request.md
│   ├── closeout-report-email.md
│   └── change-order-request.md
├── drive-folder-structure/          Starter README templates for the parallel Drive folder.
├── scripts/
│   ├── lint-naming.sh               Enforce naming conventions locally and in CI.
│   ├── new-adr.sh                   Scaffold the next ADR.
│   ├── new-session.sh               Prepend a session-log entry.
│   ├── new-deliverable.sh           Scaffold the next deliverable.
│   └── new-meeting.sh               Scaffold a meeting/interview note from the template.
└── (project-specific code below, varies by project type)
```

## Project-type-specific code layout

For software / app development projects, add:

```
apps/
├── backend/                         {{BACKEND_DESCRIPTION}}
├── frontend/                        {{FRONTEND_DESCRIPTION}}
└── mobile/                          {{MOBILE_DESCRIPTION}}
packages/                            Shared libraries.
infra/                               Infra-as-code.
```

For website / marketing-site projects, add:

```
site/
├── src/                             Source.
├── public/                          Static assets.
└── content/                         Markdown / MDX content.
```

For branding / identity projects, add:

```
brand/
├── logo/                            Vector and raster logo files.
├── typography/                      Font files and licenses.
├── color/                           Palette swatches.
├── voice-and-tone/                  Voice guidelines.
└── usage-examples/                  Sample applications.
deliverables/                        Per-deliverable handoff folders.
```

For AI-implementation projects, add:

```
use-cases/                           Use-case specs and decision rationale.
models/                              Model evaluation harnesses.
prompts/                             Reviewed prompts with version history.
evals/                               Eval datasets and results.
deployment/                          Production wiring.
```

## Drive folder layout

If your project maintains a parallel Drive folder, see `drive-folder-structure/README.md`. Standard top-level numbering:

```
rockcreteusa-website-project/
├── 00 - Project Memory/             Mirror of docs/project-memory/ (SCREAMING_CASE).
├── 01 - Procurement and Contracts/  Active SOWs, change orders, historical proposals.
├── 02 - Team/                       CVs, IDs, NDAs, profiles.
├── 03 - Client Documents/           Client-supplied reference (never rename).
├── 04 - Ideation/                   Brainstorm and exploratory artifacts.
├── 05 - Blueprint Dashboard/        (Optional) Working files for the live dashboard if it lives in Drive rather than Git.
└── 99 - Archive/                    Backups, superseded drafts.
```

Numbered prefixes enforce visual sort order so the memory folder always opens first.

## Where things are NOT

To prevent confusion:

- **Code does not live in Drive.** It lives in Git. Drive holds the artifacts that humans hand-edit (contracts, slides, large PDFs).
- **Live dashboard does not live in Git.** It is published to https://rockcreteusa.projectizer.ai/ from `blueprint-dashboard/index.html`. Drive may hold a working draft if the team prefers to edit there before publishing.
- **Secrets do not live in Git or Drive.** Use `.env` files (git-ignored) and a secrets manager. See `SECURITY.md`.
- **Large binaries (>50 MB) do not live in Git.** They live in Drive. If a binary needs versioning, use Git LFS.

## Maintenance

When you add, move, or rename a **top-level** folder:

1. Update this file (`folder-structure.md`) in the same change.
2. Update `context-index.md` if any indexed file moved.
3. If the change introduces a new naming edge case, update `naming-conventions.md`.

## Empty legacy folders

If your Drive client (Google Drive Desktop, etc.) prevents `rmdir` of empty folders, leave a `README-MOVED.md` breadcrumb pointing to the new location. Delete manually when the sync lock releases.
