# Project Blueprint Template

A reusable, project-agnostic, IDE-portable starting point for any new client engagement. Drop it on a fresh project, run one script, and you have a fully scaffolded, AI-ready, Git-canonical project management tool from minute zero.

## The source-of-truth rule

**The per-engagement Git repository is the single source of truth for everything in the project.** Every file, every decision, every status update, every meeting note, every deliverable, every piece of context that is not a secret is committed to Git. Drive is a one-way mirror. The deployed dashboard (Vercel or Vultr) is a deployed copy of `blueprint-dashboard/index.html` from `main`. Local working copies are temporary.

A new teammate or AI agent picks up where the last session left off by cloning the repo and reading `docs/project-memory/` in the order documented there. They don't need to talk to anyone. They don't need access to Drive. The complete project is in Git.

## Ship and publish (non-optional)

**Every substantive change** to the dashboard must ship **in the same working session**—do not defer `git push` or production verification as a follow-up step unless the project lead explicitly freezes the release.

Pushing to `main` is not the end state for dashboard work. **Production must match Git:** this engagement uses Vercel with auto-deploy from GitHub. After any change under `blueprint-dashboard/`, whoever closes the task must **push** and **confirm** the Vercel production deployment succeeded for `https://rockcreteusa.projectizer.ai/` (or the engagement's production URL). Treat "committed locally" or "pushed but deploy failed" as unfinished.

The only things NOT in Git are secrets and a short list of contractually-restricted artifacts. See `docs/project-memory/source-of-truth.md` for the complete doctrine.

## What's in the box

This template assembles, in one repository, every artifact a new project needs to start in good shape:

- A portable **project-memory knowledge base** in `docs/project-memory/`. 21 markdown files any AI tool (Claude Projects, Cowork, Cursor, Claude Code, Codex, Copilot Workspace) loads as context: source-of-truth (the Git-canonical doctrine), overview, status, decisions, session log, context index, team structure, stakeholder register, risk register, budget and payments, contract review, phases and milestones, client intake, kickoff agenda, pre-kickoff checklist, lessons learned, glossary, environments, AI playbook, meeting notes template, instructions block.
- A **communications template library** in `templates/`: paste-ready biweekly update, weekly update, interview invitation (executive / manager / field / external variants), kickoff recap, milestone acceptance request, closeout report, change order request. Search-and-replace placeholders, send.
- A **single-file HTML Blueprint Dashboard** in `blueprint-dashboard/` with a polished design system (light/dark/auto theme, bilingual ES/EN, role gating between client and admin views, telemetry pipeline, task tracking). Re-skin per client by editing one CSS variables block.
- A **deploy pipeline** for two targets: **Vercel Hobby** (default, lightest, free) and **Vultr / VPS** (full control, multi-tenant, real auth). Pick per engagement. See `blueprint-dashboard/deploy/VERCEL.md` and `blueprint-dashboard/deploy/DEPLOY.md`.
- A **per-deliverable tracking convention** in `deliverables/` so every committed deliverable has its own file with TOC, owner, sources, sign-off log, and acceptance evidence.
- A **Git scaffold** of governance files (CONTRIBUTING, SECURITY, CODEOWNERS, PR/issue templates, ADR conventions) and a CI naming-lint check.
- A **Drive folder-structure starter** that mirrors the Git layout for non-technical teammates who navigate by eye.
- A **post-clone init script** that prompts for project name, client, type, dates, hosting target, admin token, etc., then runs a single find-and-replace pass across every placeholder in the repo.

It is genuinely project-agnostic. It supports software builds, branding work, marketing-site builds, and AI-implementation engagements out of the box, see `docs/project-types/`.

## How to use this template

### Option Z: Orchestration agent end-to-end (preferred for paid engagements)

If you have a Claude Cowork or Claude Code orchestration agent with standing access to GitHub, Vercel, Vultr, and Google Drive:

1. Open Claude Cowork.
2. Select the new client's Drive folder.
3. Paste the contents of `.template/prompts/kickoff-orchestrator.md`.

The agent ingests the Drive folder, asks clarifying questions for any gaps, creates the repo at `github.com/newmindsgroup/{{client-slug}}`, runs init non-interactively, populates the 24 memory files via subagent batches, scaffolds deliverables, customizes the dashboard, deploys to Vercel, mirrors back to Drive, and produces a handoff summary. Roughly 30 minutes end to end. See `.template/prompts/README.md`.

For ongoing per-task work after kickoff, use `.template/prompts/lifecycle-orchestrator.md`.

### Option A: GitHub "Use this template" button (recommended)

1. Click the green **Use this template** button on this repo's GitHub page.
2. Choose **Create a new repository** and name it after your project (kebab-case, e.g. `acme-corp-portal`).
3. Clone the new repo locally.
4. Run the init script:
   ```bash
   ./init.sh
   ```
5. Answer the prompts (project name, client, kickoff date, project type, etc.). The script does a find-and-replace pass across every file, then emits a post-init checklist.
6. Make the first real commit and push.

### Option B: Manual fork

1. `git clone --depth=1 https://github.com/newmindsgroup/project-blueprint-template.git my-new-project`
2. `cd my-new-project && rm -rf .git && git init`
3. `./init.sh` and answer the prompts.
4. Commit and push to your own remote.

### Option C: Copy directly into a Drive client folder

If your project starts in Google Drive (which it usually does) and Git comes later:

1. Copy the contents of this template into your Drive client folder.
2. Open `docs/project-memory/` in your editor and start filling in the placeholders by hand, or run `./init.sh` from the Drive copy. Either works.
3. Promote to a real Git repo when the project graduates from Drive-only to repo-backed.

## What's inside

```
project-blueprint-template/
├── README.md                       you are here
├── LICENSE                         MIT (replace if your org uses something else)
├── CONTRIBUTING.md                 contribution and PR conventions
├── CHANGELOG.md                    version history of the template itself
├── SECURITY.md                     vulnerability reporting
├── CODE_OF_CONDUCT.md              community expectations
├── .gitignore                      ignores secrets, deploy logs, telemetry working files
├── .editorconfig                   LF endings, UTF-8, indent
├── .gitattributes                  text=auto eol=lf
├── init.sh                         macOS/Linux interactive bootstrap
├── init.ps1                        Windows PowerShell bootstrap
├── .github/
│   ├── CODEOWNERS                  routes review by area
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── ISSUE_TEMPLATE/             bug, feature, decision-record templates
│   └── workflows/
│       ├── lint-naming.yml         enforce kebab-case ASCII paths in CI
│       └── publish-blueprint.yml.example   optional CI deploy
├── docs/
│   ├── project-memory/             AI-portable project context
│   │   ├── README.md
│   │   ├── overview.md
│   │   ├── status.md
│   │   ├── decisions.md
│   │   ├── session-log.md
│   │   ├── context-index.md
│   │   ├── team-structure.md
│   │   ├── instructions.md         copy-pasteable prompt block
│   │   ├── folder-structure.md
│   │   ├── naming-conventions.md
│   │   └── writing-conventions.md
│   ├── decision-records/           ADR convention + template
│   ├── architecture/               where architecture diagrams live
│   └── project-types/              software, branding, website, AI specifics
├── blueprint-dashboard/            single-file HTML dashboard
│   ├── README.md, INSTALL.md, ARCHITECTURE.md, CHANGELOG.md
│   ├── index.html                  the production artifact
│   ├── customizations/             per-client CSS overrides
│   ├── docs/                       design system, theme, bilingual, telemetry, etc.
│   ├── telemetry/                  AI session telemetry pipeline + sample data
│   └── deploy/                     rsync deploy + watch daemon + DEPLOY playbook
├── drive-folder-structure/         starter README templates for the Drive folder
├── scripts/
│   ├── lint-naming.sh              enforce kebab-case ASCII (CI hook)
│   ├── new-adr.sh                  scaffold next ADR
│   └── new-session.sh              prepend a session-log entry
└── .template/
    ├── placeholders.json           every placeholder used in the template
    └── post-init-checklist.md      what to do after running init.sh
```

## The three-surface model

Most professional projects live across three places that need to stay in sync:

1. **Git** for code, durable docs, ADRs, and anything version-controlled.
2. **Drive (or OneDrive, Box, SharePoint)** for non-technical artifacts, contracts, raw research, large binaries, and shared work with non-technical stakeholders.
3. **VPS (or any web host)** for the live Blueprint Dashboard and any web-facing surface.

This template seeds all three at once. The Git scaffold is here. The Drive starter README templates are in `drive-folder-structure/`. The VPS deploy pipeline is in `blueprint-dashboard/deploy/`. The naming-conventions doc explains what's allowed where, kebab-case ASCII for Git/VPS, accents and spaces tolerated in Drive.

## Placeholder convention

Every place where project-specific text needs to land uses double-curly placeholders so they're easy to grep and replace:

| Placeholder | What it becomes |
|---|---|
| `Rockcrete USA Website Rebuild` | Human-readable project name (e.g. `Acme Corp Portal`) |
| `rockcreteusa-website-rebuild` | Kebab-case slug for paths and URLs (e.g. `acme-corp-portal`) |
| `WooCommerce website rebuild for Rockcrete USA. Fixed-fee 4-phase engagement, May 15 to Oct 26, 2026.` | One-paragraph description |
| `Rockcrete USA` | Client organization (e.g. `Acme Corp`) |
| `rockcreteusa` | Kebab-case client slug (e.g. `acme-corp`) |
| `website` | One of `software`, `branding`, `website`, `ai-implementation` |
| `2026-05-15` | ISO date (e.g. `2026-05-06`) |
| `2026-10-26` | ISO date or `TBD` |
| `Daniel Gonell` | GitHub handle of the project lead |
| `newmindsgroup` | GitHub org/user that owns this template repo |
| `https://github.com/newmindsgroup/rockcreteusa-project-blueprint` | Full URL to the project's Git repo |
| `https://rockcreteusa.projectizer.ai/` | URL where the live Blueprint Dashboard is published |
| `rockcreteusa-website-project` | Display name of the Drive folder |
| `en` | Primary working language (`en`, `es`, etc.) |
| `en` | Secondary working language, if bilingual |

`init.sh` reads `.template/placeholders.json` and prompts for each one in order, then runs `git ls-files` and substitutes across every text file in the repo.

## Design philosophy

Five principles drive every decision in this template:

1. **No build step.** The dashboard opens directly in any browser. The init script is plain Bash. No `npm install`, no toolchain. The artifact is the source.
2. **AI-portable from minute one.** The project-memory files are plain markdown that any AI tool can read. The instructions block in `docs/project-memory/instructions.md` is a copy-pasteable prompt that loads context for any IDE.
3. **Re-skinnable, not rewritten.** Every visual property in the dashboard is a CSS custom property. Re-skinning for a new client edits one variables block.
4. **Bilingual is structural.** Every text node in the dashboard carries `data-es` / `data-en`, even when the project is single-language, since it is one attribute change to flip on later.
5. **Document the why.** Every architectural decision in this template carries a `Why:` line so the next person to read it does not have to reverse-engineer the constraint that drove it.

## Maintenance

Treat this template as a living product. Each engagement should produce at least one improvement that gets backported here. Keep `CHANGELOG.md` honest about what changed and why. Tag versions (`v1.0`, `v1.1`, etc.) so each engagement can pin a known-good template version.

## Provenance

This template was extracted from the AQUAFLOW · Blueprint del Proyecto work for Tecnificación Nacional de Riego (TNR), funded by the World Bank. The first deployment used it for that engagement. Anything that was project-specific has been replaced with placeholders or moved into `docs/project-types/` as guidance.

## License

Default: MIT. Replace with your org's standard if different. See `LICENSE`.
