# Project instructions, copy-paste this block

The block below is the polished project-instructions payload. Copy everything between the `---INSTRUCTIONS-START---` and `---INSTRUCTIONS-END---` markers and paste it into the "instructions" / "custom instructions" / "system prompt" field of whatever AI tool you are using on this project (Claude Projects, Cowork, Cursor, Claude Code, Codex, etc.).

**Last updated:** 2026-05-15

---INSTRUCTIONS-START---

```markdown
# Project: Rockcrete USA Website Rebuild

## About this project
Rockcrete USA Website Rebuild is **WooCommerce website rebuild for Rockcrete USA. Fixed-fee 4-phase engagement, May 15 to Oct 26, 2026.**. It is a **website** engagement for **Rockcrete USA**, running from 2026-05-15 to 2026-10-26. Working language: en (primary), en (secondary).

## Goals
- {{GOAL_1}}
- {{GOAL_2}}
- {{GOAL_3}}

## Current state
The project was scaffolded from `project-blueprint-template`. See `docs/project-memory/status.md` for current state, in-progress work, blockers, and next steps. Always run `git pull` and re-read `status.md` at the start of every session before assuming you know the current state.

## Source of truth (read this first)
**The Git repository at `https://github.com/newmindsgroup/rockcreteusa-project-blueprint` is the single source of truth for everything in this project.** Everything except secrets is committed to Git. Drive and the deployed dashboard are mirrors of Git, never the reverse. If a surface disagrees with Git, Git wins.

A working session is "done" only when **all** of these are true:
1. `bash scripts/lint-naming.sh` reports clean (when it applies to changed paths).
2. No uncommitted changes.
3. `git push` succeeded to `origin/main` (or the agreed default branch).
4. A new entry is in `session-log.md` for substantive sessions (also committed and pushed).
5. If `blueprint-dashboard/` changed: the Vercel **production** deployment for `https://rockcreteusa.projectizer.ai/` is **Ready** and reflects the same commit you pushed.

**Policy:** treat each substantive change as its own shipment—commit + push + (when dashboard changed) production verification happen **before you stop for that increment**, not accumulated for a deferred push batch, unless Daniel explicitly requests a freeze.

If any required item is false, the session is not done. Read `docs/project-memory/source-of-truth.md` for the full doctrine, including what's NOT in Git, the conflict-resolution protocol, and the handoff protocol any new teammate or AI agent uses to pick up where the last session ended.

## Three surfaces, with Git as the truth
This project lives across three surfaces. Git is canonical, the others mirror it:
1. **Git** at `https://github.com/newmindsgroup/rockcreteusa-project-blueprint`: the source of truth. Code, all of `docs/project-memory/`, ADRs, deliverables, dashboard source, meeting notes, decisions. Everything except secrets.
2. **Drive** at `rockcreteusa-website-project`: a one-way mirror of Git plus a few large binaries and contractually-restricted artifacts. Never canonical. The folder that mirrors between Git and Drive is `docs/project-memory/` (kebab-case in Git) and `00 - Project Memory/` (SCREAMING_CASE in Drive).
3. **Live dashboard** at `https://rockcreteusa.projectizer.ai/` (hosted on vercel): a deployed copy of `blueprint-dashboard/index.html` from `main`. Has a public face for the client and an admin-gated layer for the team. See `blueprint-dashboard/docs/client-vs-internal.md`. Never canonical.

## How to use the project memory
At the start of every session, run `git pull`, then read the files in `docs/project-memory/` in this order:
- `source-of-truth.md` - the Git-canonical rule, the secrets exception list, the conflict-resolution protocol, the handoff protocol for any new agent.
- `overview.md` - what the project is, who it is for, goals, non-goals, constraints.
- `status.md` - current state, done/in-progress/blocked.
- `phases-and-milestones.md` - canonical tracker for every dated commitment.
- `decisions.md` - decisions made, with links to ADRs in `docs/decision-records/`.
- `session-log.md` - reverse-chronological log of every work session.
- `context-index.md` - map of all three surfaces and external systems.
- `team-structure.md` - per-stage ownership, review routing, capacity.
- `stakeholder-register.md` - all stakeholders with tier, contact, what they care about.
- `risk-register.md` - active risks, mitigations, owners, materialized log.
- `budget-and-payments.md` - contract value, milestones, costs, invoice log.
- `environments.md` - hosting target (vercel), URLs, secrets per environment.
- `client-intake.md` - day-1 questionnaire status (anything red is a risk).
- `glossary.md` - project-specific terminology.
- `ai-playbook.md` - the standard prompts for any AI session here.
- `kickoff-agenda.md` - first meeting script (if not yet held).
- `meeting-notes-template.md` - copy this for every meeting / interview into research/.
- `folder-structure.md` + `naming-conventions.md` + `writing-conventions.md` - the rules.

## Memory maintenance rules
You are responsible for keeping `docs/project-memory/` accurate IN GIT. Local edits don't count until they're committed and pushed.
- Run `git pull` at the start of every session; trust `origin/main` over any local state.
- After every substantive task or decision, update `status.md` and, if a decision was made, append to `decisions.md` (and create an ADR in `docs/decision-records/` if it is architecturally significant).
- At the end of every working session, prepend a new entry to `session-log.md` covering what was done and where things ended.
- If you create or encounter important new files, add them to `context-index.md`.
- Run `bash scripts/lint-naming.sh` before committing. If lint fails, fix it; don't push red.
- Commit and push at the end of every working session. If context is running out mid-task, commit a `wip:` checkpoint and push before pausing. The session is not done until `git push` reports success.
- Mirror changes to Drive's `00 - Project Memory/*.MD` (SCREAMING_CASE) AFTER the Git push completes. Drive is one-way; Git is canonical. Never the reverse.
- Never overwrite teammate changes without flagging them first. If `git pull` shows a conflict, surface the diff to the user before resolving. Default to merging in their work, not overwriting.
- Use ISO dates (`YYYY-MM-DD`) everywhere.

## Conventions and constraints
- **Language:** en for client-facing UI and deliverables; English for code identifiers and internal docs unless the project specifies otherwise.
- **Naming:** Git paths are strict kebab-case ASCII (no en-dash, em-dash, curly quotes, spaces, parens, non-ASCII). The only exceptions are GitHub-mandated SCREAMING_CASE files like `.github/CODEOWNERS`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/*`. Drive may use spaces and accents but still bans en-dash, em-dash, curly quotes, and OS-reserved characters. Enforced by `scripts/lint-naming.sh` in CI.
- **Writing:** never use em-dashes (`—`, U+2014) anywhere in the project text, in either the primary or the secondary language. Use natural punctuation instead (colon, comma, period, parentheses, mid-dot). En-dashes for date and number ranges are fine. See `docs/project-memory/writing-conventions.md`.
- **Commits:** Conventional Commits 1.0.0 with typed scopes (see `CONTRIBUTING.md`). Example: `feat(auth): add JWT refresh flow`.
- **Branches:** feature branches off `main`; PRs require review and passing CI.
- **Tech stack:** {{TECH_STACK_SUMMARY}}. Locked in `docs/decision-records/` (ADRs).
- **IP and ownership:** {{IP_TERMS}}.
- **Confidentiality:** {{CONFIDENTIALITY_TERMS}}.
- **Sensitive content:** never commit secrets, credentials, API tokens, SSH keys, or htpasswd files. Those live in `.env` (git-ignored) or a secrets manager. Personal IDs and contractually-restricted artifacts may live in Drive only with locked sharing. Everything else, even meeting transcripts and decision logs, goes in Git. See `docs/project-memory/source-of-truth.md` "What does NOT go in Git, ever" for the complete exception list. When in doubt, commit.

## Key people
- **Daniel Gonell** - project lead.
- **{{CLIENT_PRIMARY_CONTACT}}** - primary contact at Rockcrete USA.
- **{{REVIEWER_NAME}}** - reviewer / counterparty (if applicable).

See `docs/project-memory/team-structure.md` for full review routing.

## Collaboration context
This project folder is shared across tools and teammates via {{COLLABORATION_PLATFORM}}. Other AI tools and teammates may modify these files between your sessions. Always re-read `docs/project-memory/` at the start of a session before assuming you know the current state. Flag drift before acting on it.

## Getting started in a new session
1. `git pull` (or `git clone https://github.com/newmindsgroup/rockcreteusa-project-blueprint` if you don't have a local checkout).
2. Read all files in `docs/project-memory/` in the order in `docs/project-memory/README.md`. Start with `source-of-truth.md`.
3. Run `git log --oneline -10` to see recent activity.
4. Skim the most recent 5 entries in `session-log.md`.
5. Scan for new or modified files that aren't reflected in `context-index.md` or `status.md`.
6. If you find drift between Git and Drive (or Git and the deployed dashboard), surface it to the user. Per `source-of-truth.md`, Git wins; re-mirror the diverged surface.
7. Then await further instructions.

## Closing a session
The session is not done until ALL FOUR of these are true:
1. `bash scripts/lint-naming.sh` reports clean.
2. No uncommitted changes (`git status` is clean).
3. `git push` succeeded.
4. A new entry is in `session-log.md`, also committed and pushed.

If context is running out mid-task and you can't fully finish, commit a `wip:` checkpoint and push. The next session pulls from Git and continues. Never close a session with uncommitted work.

Follow these instructions when working in this project.
```

---INSTRUCTIONS-END---

## How to keep this block current

When you change `overview.md`, `status.md`, `decisions.md`, or any other memory file in a way that changes the framing of the project (new constraints, new tech, new team members, new conventions), update this file in the same commit. The instructions block is the public-facing summary of the rest of the memory.

## Why this is its own file

Most AI tools have a "project instructions" or "custom instructions" field that is separate from the file system. This file gives you a single place to keep that text, and a clear marker pair that makes copy-paste safe.
