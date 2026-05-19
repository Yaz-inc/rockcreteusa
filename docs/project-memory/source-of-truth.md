# Source of truth, Rockcrete USA Website Rebuild

The single most important rule in this project. Read it once, internalize it, behave accordingly. Every other doc in `docs/project-memory/` defers to this one when surfaces disagree.

**Last updated:** 2026-05-15

## The rule

**The Git repository is the single source of truth for everything about this project.**

### Operating policy (agency-confirmed — immediate ship)

Every substantive **change**, **behavior or content revision**, or **new implementation** in this repo is **not delivered** until it is **committed, pushed to `origin/main`**, and—when **`blueprint-dashboard/`** changed—**confirmed live on production Vercel** in the **same working session**. Do **not** batch push or deploy verification to later; do **not** treat “saved locally” or “committed but unpushed” as shippable. The only intentional pause is an explicit freeze from Daniel (draft review, legal hold, incident).

### IDE agents (Cursor, Codex, Claude Code, etc.)

Some editors ship a **global** rule such as “do not `git push` unless the user explicitly asks.” **That guidance is superseded here.** For this repo, substantive work under `blueprint-dashboard/` (including `data/project-tracker.json`) must end the same session with **`git push` to `origin/main`** so Vercel can rebuild—unless the user explicitly asks you *not* to push yet (e.g. draft PR). Waiting for a second “please push” message delays the preview the team uses.

This means:

- Every file, every decision, every status update, every meeting note, every deliverable, every piece of context that is not a secret is committed to the Git repo at `https://github.com/newmindsgroup/rockcreteusa-project-blueprint`.
- Anyone with read access to the Git repo has the complete project. They can clone it on a fresh machine, read `docs/project-memory/` in the order documented in `README.md`, and pick up exactly where the last session ended.
- Other surfaces (Google Drive, the deployed dashboard on Vercel or Vultr, local working copies) are **mirrors and projections of Git**. They are not authoritative.
- When two surfaces disagree, **Git wins**. Period. Re-mirror the other surface from Git.

## Why

This rule exists for one reason: **portability and continuity**. A new teammate, a new AI tool, a new IDE, a new agent runtime, a future you in a fresh session: any of them must be able to clone the Git repo and have everything they need to continue working without asking anyone a question. If the latest project context lives in a Drive doc that the new person can't see, or in a deployed dashboard's localStorage, or in a Cowork session's conversation history, the project is fragile. Centralizing in Git makes it durable.

## What goes in Git

Everything that documents, defines, tracks, or implements the project, except secrets:

| Category | Examples | In Git? |
|---|---|---|
| Code | source files, build configs, scripts | Yes |
| Project memory | overview, status, decisions, session log, all `docs/project-memory/*.md` | Yes |
| ADRs | `docs/decision-records/NNNN-title.md` | Yes |
| Deliverables | `deliverables/NNNN-slug.md`, including the actual deliverable content when it's markdown | Yes |
| Dashboard source | `blueprint-dashboard/index.html`, telemetry pipeline, deploy config (without secrets) | Yes |
| Meeting notes / interview transcripts | `research/interviews/YYYY-MM-DD-slug.md` | Yes (unless contractually restricted) |
| Stakeholder register | `docs/project-memory/stakeholder-register.md` | Yes |
| Risk register | `docs/project-memory/risk-register.md` | Yes |
| Budget and payment tracker | `docs/project-memory/budget-and-payments.md` | Yes |
| Contract terms (text content) | terms summarized in `overview.md` and `decisions.md` | Yes |
| Configuration templates | `.env.example`, `vercel.json`, deploy scripts | Yes |
| Test data and fixtures | `**/fixtures/`, `tasks.example.json`, `panel-interno-telemetry.example.json` | Yes |
| ASCII art, diagrams | `docs/architecture/*.md`, mermaid sources, drawio sources | Yes |
| Working JSON state files | `tasks.json`, `panel-interno-telemetry.json` (the live versions) | Yes |
| Static assets used in deliverables | logos, screenshots, mockups | Yes if under 50 MB; else Git LFS or Drive-only with a pointer |
| Per-engagement README, LICENSE, CONTRIBUTING, SECURITY, CHANGELOG | yes | Yes |

## What does NOT go in Git, ever

The exception list is short and absolute. **Only these**:

| Category | Examples | Where they live instead |
|---|---|---|
| Secrets | API tokens, SSH private keys, OAuth client secrets, database passwords, htpasswd files, signed JWTs | A secrets manager (1Password, Bitwarden, Vault) or a non-committed `.env` file (already git-ignored) |
| Live credentials | the actual `.env` file | `.env` (git-ignored) on the team's local machines and on the deploy host |
| TLS keys | `.crt`, `.key`, `.pfx` files | The deploy host's filesystem with restrictive perms |
| Cloudflare / cloud-provider tokens | `~/.cloudflare-token` | Outside the repo, mode 600 |
| Personal IDs of stakeholders that contractually cannot be versioned | passport scans, tax IDs, social security numbers, full home addresses | Drive (with locked sharing) or a credentials manager |
| Files >50 MB | large binaries, raw video, big PDFs | Drive (with a pointer in `context-index.md`) or Git LFS |
| Generated or derived artifacts | `node_modules/`, `dist/`, `.next/`, build outputs | Always git-ignored; regenerate on demand |

If something doesn't fit one of those exception categories, it goes in Git. When in doubt, default to Git.

The full git-ignore list is enforced by `.gitignore`. If you find yourself wanting to git-ignore something not in the table above, stop and ask. Adding to the exception list is a `decisions.md` entry.

## How the surfaces relate to Git

```
                         GIT REPOSITORY
                        (single source of truth)
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
      Vercel / Vultr     Google Drive    Local checkouts
      (live dashboard)   (file mirror)   (developer / AI machines)
       deployed copy     human-readable   working copies
                         redundancy
```

**Vercel / Vultr**: hosts the deployed copy of `blueprint-dashboard/index.html`. Vercel auto-deploys on every push to `main`. Vultr deploys via `bash deploy.sh`. The deployed copy is **derived** from Git; nothing on the Vercel or Vultr side is canonical. If the deployed dashboard shows different content than `main`, that's a bug; redeploy from Git.

**Google Drive**: holds a human-readable mirror of `docs/project-memory/*.md` in `00 - Project Memory/*.MD`, plus large binaries and contractual artifacts that don't belong in Git. The Drive copy is for non-technical teammates and for redundancy. **Drive is one-way**: changes flow from Git to Drive, never the other direction without explicit reconciliation. If a teammate edits a memory file in Drive, that change is **not yet in the project** until someone copies it back to Git, runs lint, and commits.

**Local checkouts**: working copies on the team's developer machines or AI agent runtimes. Always pull before working. Always commit and push at the end of any meaningful work block. Uncommitted changes on a local machine are **not in the project** and will be lost when that machine restarts or that AI session ends.

## Conflict resolution

When two surfaces show different content for the same file, run this protocol:

1. **Git is canonical.** The version on the latest commit of `main` is the truth.
2. Identify the divergent surface. Investigate why it diverged. Common causes:
   - Drive: a teammate hand-edited the file, didn't push to Git.
   - Vercel: a deploy didn't fire (e.g. push only changed memory files, not the dashboard) or the deploy is older than the latest `main`.
   - Local: an uncommitted local edit.
3. Decide: was the divergent surface's change valuable?
   - If yes: copy the change into Git, lint, commit, push, then re-mirror to the diverged surface.
   - If no: discard the diverged surface's content and re-mirror from Git.
4. Document the resolution in `session-log.md` if the divergence was non-trivial.

Never resolve by editing Drive to match Drive's other doc, or by editing Vercel to match Vercel. The resolution always passes through Git.

## How a new person picks up where we left off

The full handoff protocol. A teammate, a contractor, an AI agent, a future-you on a fresh machine:

1. **Clone the Git repo.**
   ```bash
   git clone https://github.com/newmindsgroup/rockcreteusa-project-blueprint
   cd rockcreteusa-website-rebuild
   ```
2. **Read `docs/project-memory/` in the order specified in `docs/project-memory/README.md`**: source-of-truth (this file), overview, status, phases-and-milestones, decisions, session-log, context-index, team-structure, stakeholder-register, risk-register, budget-and-payments, client-intake, kickoff-agenda, glossary, environments, ai-playbook, meeting-notes-template, instructions, folder-structure, naming-conventions, writing-conventions.
3. **Skim the most recent 5 entries in `session-log.md`** for the immediate context of the last working session.
4. **Run the local sanity checks**:
   ```bash
   git log --oneline -10
   bash scripts/lint-naming.sh
   ls -la docs/project-memory/
   ```
5. **Check the live dashboard at `https://rockcreteusa.projectizer.ai/`** to confirm production state matches what `main` says.
6. **(Optional) Pull the Drive mirror** for non-technical context (large PDFs, contracts, raw research) per `context-index.md`.
7. **Start work.** Whatever you do, the rules below apply.

After step 4, the new person has full context. They don't need to talk to anyone. They don't need to ask "where did we leave off?": `session-log.md` answers that.

## How any AI agent picks up where we left off

Same as a human, with these additions:

1. Use `git pull` at the start of every session. Trust the latest `origin/main` over any local state.
2. Read the project-instructions block from `docs/project-memory/instructions.md` and treat it as your system prompt.
3. Do not depend on local files outside the Git tree (no `.kickoff-state.md` outside Git, no `~/scratch/` notes). If you need to checkpoint state mid-session, commit it to a `.kickoff/` subfolder in the repo and push.
4. At the end of every meaningful action, commit and push before pausing. If the action touched `blueprint-dashboard/`, confirm the Vercel production deploy for `https://rockcreteusa.projectizer.ai/` matches the pushed `main` commit before you call the task done.

## How every working session must close

A working session is "done" only when **all** of these are true:

1. **Lint passes locally**: `bash scripts/lint-naming.sh` reports clean (when the script exists and applies to changed paths).
2. **Changes are committed**: no uncommitted edits in the working tree.
3. **Changes are pushed**: `git push` shows "Everything up-to-date" or successfully pushed to `origin/main` (or the agreed default branch).
4. **A session-log entry is appended** (when the session was substantive): `bash scripts/new-session.sh "..."` and that entry is also committed and pushed.
5. **If this session changed anything in `blueprint-dashboard/`** (including `data/project-tracker.json`, `middleware.js`, or static assets the dashboard serves): **Vercel production must reflect the pushed commit.** Wait for the GitHub-integration deploy to report **Ready**, then spot-check `https://rockcreteusa.projectizer.ai/` (HTTP 200 behind Basic Auth). If production is still on an older commit or the deploy failed, the session is **not** done until that is green.

If any of those is false, the session is not done. Do not close the editor / Cowork tab / Claude Code window without satisfying all that apply.

Item 5 is automatic **only** after you push: Vercel builds from `main`. The agent's job is to **push** and **confirm** the pipeline finished; "committed locally" or "pushed but deploy red" is not shippable.

This is the most important rule for portability. It means a teammate or AI agent who picks up tomorrow has the latest state in Git **and** the client-facing URL matches Git, no questions asked.

## How the orchestration agent enforces this

The kickoff orchestrator and lifecycle orchestrator (`.template/prompts/`) both encode this rule explicitly:

- **Kickoff** writes the populated repo to GitHub before any other surface. It checkpoints state to `.kickoff/state.md` inside the repo (committed and pushed) so a fresh session can resume from Git, not from a missing local file.
- **Lifecycle** starts every session with `git pull`, runs the requested task, lints, commits, pushes, and only then reports "done". Any task that ends with uncommitted changes returns a "Status: local-only" line, telling the user to commit before closing.

If the orchestration agent ever finds itself with uncommitted changes when context is running out, the agent must commit a WIP-tagged checkpoint and push before checkpointing or closing. Specifically:

```bash
git add -A
git commit -m "wip: checkpoint before context exhaustion, see session-log"
git push
```

## What this means in practice

A few common situations and the right behavior:

| Situation | Right behavior |
|---|---|
| Teammate emails you a meeting transcript | Save it to `research/meetings/YYYY-MM-DD-slug.md`, lint, commit, push. Then mirror to Drive if you want. The email itself is not in the project until step 1. |
| Client signs a deliverable; sends an approval email | Update the deliverable file's status, paste the email evidence in the file, commit, push. The signed-off state is not in the project until that's done. |
| Dashboard renders wrong on the live URL | Check `main`'s `index.html`. If it looks right there, redeploy. If it's wrong there too, fix it on `main` and let the redeploy fire. Never fix it directly on the deploy host. |
| Drive folder shows a newer version of a memory file than Git | The Drive version is not in the project yet. Read it, decide if it's valuable, copy to Git, lint, commit, push, re-mirror to Drive. |
| You're mid-task and your AI agent runs out of context | Commit a WIP checkpoint and push. The next session pulls from Git and continues. |
| You're handing the project to a new freelancer | Send them the Git repo URL. That's the whole handoff. |
| You're closing out the engagement and giving the client the project | Transfer the GitHub repo to the client's GitHub org. The complete project transfers with it. |

## What we don't try to do

This template does **not** attempt:

- Real-time bidirectional sync between Git and Drive. Sync is one-way (Git to Drive), human-triggered, or scripted but not "live".
- Branching strategies more complex than "feature branches off `main`, PRs in, squash merge". Pick a heavier strategy if your engagement needs it; document in `decisions.md`.
- Conflict-free replicated data types. We don't need them. Git's conflict resolution is the model.

## Maintenance

This file should rarely change. If it does, the change is significant: add a `decisions.md` entry. The orchestration prompts and the README should be re-checked for consistency in the same PR.

## TL;DR

- **Git is the truth.** Anything not in Git doesn't exist as far as the project is concerned.
- **Don't commit secrets.** Everything else, commit.
- **Drive and Vercel mirror Git.** Never the other direction.
- **Close every session committed and pushed**, or it didn't happen.
- **After dashboard changes, production on Vercel must match `main`** or the session isn't done.
