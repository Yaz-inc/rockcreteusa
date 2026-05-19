# Project memory

This folder is the AI-portable, human-readable knowledge base for **Rockcrete USA Website Rebuild**. Every AI tool used on this project (Claude Projects, Cowork, Cursor, Claude Code, Codex, Copilot Workspace, etc.) should load these files at the start of every session. Every human teammate should also read them at least once.

## Why this exists

Most engagements lose context every time you switch tools or onboard a new teammate. This folder solves that by keeping every durable piece of project context in plain markdown that any tool can read, without a database, without a build step, without a paid platform.

## The source-of-truth rule

**The Git repository at `https://github.com/newmindsgroup/rockcreteusa-project-blueprint` is the single source of truth for everything in this project.** Drive and the deployed dashboard are mirrors. Local working copies are temporary. If a surface disagrees with Git, Git wins. See `source-of-truth.md` for the full doctrine, including what's NOT in Git (the short exception list), the conflict-resolution protocol, and the closing-a-session checklist.

## How to use these files

**At the start of every working session**, read these in this order:

1. `source-of-truth.md` - **start here.** The single most important rule. Tells you Git is canonical, defines what's in Git vs. not, explains how to pick up where the last session ended, and **requires production Vercel verification after `blueprint-dashboard/` changes**.
2. `overview.md` - what this project is, who it is for, scope, goals, non-goals.
3. `status.md` - what is happening right now: done, in progress, blocked.
4. `phases-and-milestones.md` - canonical phase / milestone / task tracker.
5. `decisions.md` - meaningful decisions, with rationale and alternatives. Append-only.
6. `session-log.md` - reverse-chronological log of prior working sessions.
7. `context-index.md` - map of every notable file and folder across the surfaces.
8. `team-structure.md` - who owns what, review routing, capacity gaps.
9. `stakeholder-register.md` - every person who has a say, a need, or a dependency.
10. `risk-register.md` - active risks with probability, impact, mitigation, owner.
11. `budget-and-payments.md` - money in, money out, payment milestones, invoice log.
12. `contract-review.md` - pre-signature contract review checklist (clauses, flags, sign-off).
13. `client-intake.md` - day-1 / week-1 questionnaire (status of every must-know).
14. `kickoff-agenda.md` - first formal meeting, the script.
15. `pre-kickoff-checklist.md` - the dress-rehearsal sweep before kickoff or any major milestone meeting.
16. `glossary.md` - project-specific terminology and translations.
17. `environments.md` - which surface = staging vs. prod, hosting, secrets.
18. `ai-playbook.md` - the standard prompts for any AI session on this project.
19. `meeting-notes-template.md` - template, not state. Copy per meeting (use `scripts/new-meeting.sh`).
20. `lessons-learned.md` - retrospective log; phase-end and engagement-close.
21. `instructions.md` - the copy-pasteable AI-system-prompt block. Drop it in Claude Projects / Cursor / Claude Code as the project's custom instructions.
22. `folder-structure.md` - the canonical top-level layout across Drive and Git.
23. `naming-conventions.md` - what names are allowed where (Drive vs. Git vs. VPS).
24. `writing-conventions.md` - prose conventions including the no-em-dash rule.

**At the end of every working session**, all four of these must be true (per `source-of-truth.md`):

- A new entry has been prepended to the **top** of `session-log.md` describing what was done and where things ended.
- `status.md` reflects anything that moved between done / in progress / blocked.
- If a decision was made, `decisions.md` has a new entry (and an ADR in `../decision-records/` if architecturally significant).
- New / moved files are reflected in `context-index.md`.
- All of the above are **committed and pushed to `main`**, and `bash scripts/lint-naming.sh` passes locally first.

If any of those is false, the session is not done. Do not close the editor without all four.

## Maintenance rules

- **Append-only** for `decisions.md` and `session-log.md`. Never edit past entries. If a decision is reversed, add a new entry that supersedes the old one.
- **ISO dates** (`YYYY-MM-DD`) everywhere. Convert relative dates ("Thursday", "next week") to absolute dates before writing them in.
- **Match the working language** of what you are updating. If the project is bilingual, keep memory files in the language you specified during init unless a section is specifically about a different language.
- **Never overwrite teammate edits without flagging them.** If a memory file changed outside your session, `git pull` first; if there's a conflict, surface the diff to the user before resolving.
- **Drive mirror is one-way**: changes flow from Git to Drive, not the other direction. If you find a Drive-only edit, copy it to Git first, lint, commit, push, then re-mirror. See `source-of-truth.md` "Conflict resolution".

## What lives here vs. elsewhere

This folder is the **durable, AI-portable** context, all in Git. Other things in Git but not in this folder:

- **Code**: in `apps/`, `packages/`, etc.
- **Architecture diagrams**: in `../architecture/` (pointer from `context-index.md`).
- **ADRs (Architecture Decision Records)**: in `../decision-records/`, one per significant decision.
- **Deliverables**: in `../../deliverables/` (one MD file per tracked deliverable).
- **Per-sprint working artifacts**: in `../../sprints/` if your team uses that layout.

The only things NOT in Git are listed in `source-of-truth.md` "What does NOT go in Git, ever". If you're considering NOT committing something else, stop and read that doc first.

## Three-surface awareness, with Git as the truth

This project lives across three surfaces. Git is canonical; the others are mirrors:

- **Git** (`https://github.com/newmindsgroup/rockcreteusa-project-blueprint`): the source of truth. Everything except secrets.
- **Drive** (`rockcreteusa-website-project`): one-way mirror of Git, plus a few large binaries and contractually-restricted artifacts that can't be versioned. Never canonical.
- **Live dashboard** (`https://rockcreteusa.projectizer.ai/`, hosted on Vercel or Vultr): a deployed copy of `blueprint-dashboard/index.html` from `main`. Auto-updates on every push (Vercel) or via `deploy.sh` (Vultr). Never canonical.

`context-index.md` maps every notable file across all three. If you add or move something on Git, update `context-index.md` in the same change. If something on Drive or the dashboard diverges from Git, that's a bug; fix it via Git per `source-of-truth.md` "Conflict resolution".
