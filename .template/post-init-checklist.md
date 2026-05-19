# Post-init checklist

`init.sh` filled in the placeholders defined in `placeholders.json`. The remaining placeholders need a human (or AI) to think about them and write thoughtful values. Work through this list in order; many later items depend on earlier ones.

**Source-of-truth reminder.** Every step below ends with a Git commit and push. The Git repo is the source of truth (see `docs/project-memory/source-of-truth.md`). Local edits don't count until they're pushed. After every batch of items, run `bash scripts/lint-naming.sh && git add -A && git commit -m "docs(memory): <summary>" && git push` so other teammates and AI agents picking up the project see the latest state.

## 1. Verify the init pass landed cleanly

```bash
# Should print nothing if every templated placeholder was replaced.
grep -rn '{{' . --exclude-dir=.git --exclude-dir=node_modules || echo "Clean."
```

If `grep` finds residual `{{X}}` entries, those are the in-content placeholders that init does not replace (because they're project-specific text rather than universal metadata). Work through them in this checklist.

## 2. Fill in `docs/project-memory/overview.md`

These placeholders need real content:

- `{{CLIENT_PRIMARY_CONTACT}}`, `{{CLIENT_DECISION_MAKER}}`, `{{END_USERS}}`
- `{{FUNDER_NAME}}`, `{{REVIEWER_NAME}}` (delete these sections if not applicable)
- `{{GOAL_1}}` through `{{GOAL_3}}` (add or remove goals)
- `{{NON_GOAL_1}}`, `{{NON_GOAL_2}}` (be specific; "no scope X" is more useful than "no out-of-scope items")
- `{{BUDGET}}`, `{{HARD_REQUIREMENTS}}`, `{{IP_TERMS}}`, `{{CONFIDENTIALITY_TERMS}}`
- `{{METRIC_1}}`, `{{METRIC_2}}` and their baselines/targets
- `{{BACKEND}}`, `{{FRONTEND}}`, `{{DATABASE}}`, `{{AI_ML}}`, `{{INFRA}}` (delete the section if branding-only)
- `{{BACKGROUND_PARAGRAPH}}` (the "why now" context)

## 3. Fill in `docs/project-memory/status.md`

- `{{IN_PROGRESS_ITEM_1}}`, `{{IN_PROGRESS_ITEM_2}}` - what is the team actively doing this week
- `{{OPEN_QUESTION_1}}`, `{{OPEN_QUESTION_2}}` - what questions are blocking progress
- `{{NEXT_STEP_1}}`, `{{NEXT_STEP_2}}`, `{{NEXT_STEP_3}}` - the literal next things to do
- `{{SPRINT_*}}` columns or replace the sprint table with a phase table
- `{{OUT_OF_SCOPE_NOW_1}}`, `{{OUT_OF_SCOPE_NOW_2}}` - explicit non-work for this period

## 4. Fill in `docs/project-memory/team-structure.md`

- Team member rows (`{{TEAM_MEMBER_2}}` through `{{TEAM_MEMBER_4}}`, or remove rows for solo engagements)
- `{{CLIENT_PRIMARY_CONTACT}}`, `{{CLIENT_DECISION_MAKER}}` and their roles/emails
- `{{REVIEWER_NAME}}` row (delete the section if not applicable)
- RACI table entries (or replace with simpler ownership list)
- `{{ADR_REVIEWER}}` (who reviews architecturally significant decisions)
- `{{CAPACITY_SUMMARY}}` (1-2 paragraphs about strengths and gaps)
- `{{TEAM_CHANNEL}}`, `{{CADENCE}}`, `{{DECISION_TURNAROUND}}`, `{{OFF_HOURS_RULE}}`
- `{{LOCAL_DEV_COMMAND}}`

## 5. Fill in `docs/project-memory/phases-and-milestones.md`

This is the canonical tracker for the engagement. Without it, every other doc is loose.

- `{{PHASE_1_NAME}}`, `{{PHASE_1_START}}`, `{{PHASE_1_END}}`, `{{PHASE_1_OBJECTIVE}}`, `{{PHASE_1_OWNER}}`, `{{PHASE_1_PAYMENT}}`, `{{PHASE_1_PAYMENT_DELIVERABLE}}`
- Repeat for Phase 2 and Phase 3 if applicable
- Each `{{MILESTONE_X_Y}}`, `{{MILESTONE_X_Y_DATE}}`, `{{MILESTONE_X_Y_OWNER}}` row
- For each milestone, scaffold a deliverable file: `bash scripts/new-deliverable.sh "title here"`

## 6. Fill in `docs/project-memory/stakeholder-register.md`

- Tier 1 stakeholders (regular contact). At minimum: client primary contact, client decision-maker, your project lead.
- Tier 2 (periodic). Subject-matter experts, area heads.
- Tier 3 (notify-only). Distribution list for major milestones.
- Coverage matrix linking stakeholders to deliverables.

## 7. Fill in `docs/project-memory/risk-register.md`

- At least 3-5 risks identified at engagement start. The "Common risks by project type" section in the file gives starting points.
- Each risk: probability, impact, owner, mitigation, trigger.
- Set the first review date (typically 2 weeks out).

## 8. Fill in `docs/project-memory/budget-and-payments.md`

- `{{BUDGET}}`, `{{CURRENCY}}`, `{{PAYER_NAME}}`, `{{PAYEE_NAME}}`, `{{PAYMENT_TERMS}}`
- Payment milestone rows (`{{P1_PCT}}`, `{{P1_AMT}}`, `{{P1_TRIGGER}}`, `{{P1_DATE}}` and so on)
- Cost-side allocation by category

## 8a. Review `docs/project-memory/contract-review.md`

Only if a contract / SOW has been received and needs review before signing:

- Fill the contract metadata block (reference, counterparty, date received, location, pages, governing law).
- Walk every checklist row; flag GREEN / YELLOW / RED.
- List red flags in the "Red flags surfaced" section with proposed fixes.
- Set the recommendation: SIGN / SIGN WITH CHANGES / DO NOT SIGN.

If no contract has been received, leave the file as template state and revisit when one arrives.

## 9. Fill in `docs/project-memory/glossary.md`

- 5-10 domain or project-specific terms minimum. Add as you encounter more.
- Acronyms commonly used by the client.
- For bilingual projects, fill both language columns.

## 10. Fill in `docs/project-memory/client-intake.md`

This is the day-1 / week-1 questionnaire. Mark each row green / yellow / red as the answer comes in. Anything still red by week 2 becomes a `status.md` blocker.

## 11. Fill in `docs/project-memory/kickoff-agenda.md`

If a kickoff is scheduled, fill in date / time / attendees / outcomes. Adapt the minute-by-minute timing.

## 11a. Review `docs/project-memory/pre-kickoff-checklist.md`

Run this 1-2 days before the kickoff meeting (or any major client-facing milestone meeting). The file is reusable; don't fill it in advance. The team marks items live during the dress rehearsal.

## 11b. `docs/project-memory/lessons-learned.md`

Leave empty at init. The first real entry lands at the end of the first phase or first retrospective. The file's structure is the only thing to verify at init.

## 12. Fill in `docs/project-memory/environments.md`

- `vercel` should already be set by init (vercel | vultr | none).
- Hosting target details (Vercel project name OR VPS hostname).
- Custom domain if applicable.
- DNS records if applicable.

## 13. Fill in `docs/project-memory/context-index.md`

- The "Project-specific repo paths" table (delete rows that don't apply)
- The "External systems" table (Linear / Jira / Figma / Notion / Slack / etc.)
- The hosting / dashboard table once you provision

## 14. Customize the dashboard

In `blueprint-dashboard/index.html`:

1. Find the `THEME TOKENS` block at the top of the inline `<style>`.
2. Edit `--color-brand`, `--color-brand-2`, `--color-brand-soft` to your client's brand color (or keep the slate-blue default if you don't have one yet).
3. The `<title>`, `<meta description>`, OG tags, and `<html lang>` are all placeholdered and were filled in by `init.sh`.
4. Edit the seeded "Inicio" content to describe your engagement.
5. Both `data-es` and `data-en` attributes for every text node. If your engagement is single-language, set both attributes to the same language.
6. Configure the admin token in the `__role` setup block. The init script set `7c63ef71e1ba66344ddfcdf1` if you provided one; otherwise generate one with `openssl rand -hex 12` and paste it.

In `blueprint-dashboard/telemetry/`:

- Copy `tasks.example.json` to `tasks.json` and edit milestones, categories, and the seed task.
- Copy `panel-interno-telemetry.example.json` to `panel-interno-telemetry.json` (it stays as-is until your first real Cowork session, at which point you run `extract-telemetry.py`).

## 15. Wire up the deploy pipeline

Pick the path matching `vercel`:

### If `vercel` (default for new engagements)

1. Push your repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → Import → pick the repo.
3. **Project name:** `rockcreteusa-blueprint` (defaulted to `rockcreteusa-blueprint`).
4. **Framework preset:** Other.
5. **Root directory:** `blueprint-dashboard`.
6. **Build command:** empty. **Output directory:** `.`. **Install command:** empty.
7. Click Deploy. Vercel uses `blueprint-dashboard/deploy/vercel.json` automatically.
8. Live at `https://rockcreteusa-blueprint.vercel.app/`.

Full guide: `blueprint-dashboard/deploy/VERCEL.md`.

### If `vultr` (when you need real auth or multi-tenant)

1. Copy `blueprint-dashboard/deploy/.env.example` to `blueprint-dashboard/deploy/.env`.
2. Fill in `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH`, `DEPLOY_SSH_KEY`, `URL`.
3. If your VPS is fresh, run `bash blueprint-dashboard/deploy/vps-bootstrap.sh` (read it first).
4. First publish: `bash blueprint-dashboard/deploy/deploy.sh`.

Full guide: `blueprint-dashboard/deploy/DEPLOY.md`.

## 16. Pick which project-types to keep

`docs/project-types/` contains four guides. Keep the one(s) relevant to your engagement; delete the others to keep the repo focused.

```bash
# Example: keeping only the software guide
rm docs/project-types/branding-identity.md
rm docs/project-types/website-marketing.md
rm docs/project-types/ai-implementation.md
```

Then update `docs/project-types/README.md` to remove the deleted rows.

## 17. Set up the Drive folder (if applicable)

`drive-folder-structure/` contains starter README templates for the parallel Drive folder. To use:

1. Create a folder in Google Drive named `rockcreteusa-website-project` (or whatever your team prefers).
2. Inside, create the six numbered subfolders documented in `drive-folder-structure/README.md`.
3. Copy each `*.template.md` file into the corresponding Drive subfolder as a `README.md`.
4. Update `docs/project-memory/context-index.md` with the Drive folder path.

## 18. Wire up CODEOWNERS and branch protection

Edit `.github/CODEOWNERS` to add real owners per area. After your first push, in GitHub UI:

1. Go to Settings → Branches → Add rule for `main`.
2. Require: pull request reviews, status checks (the `lint-naming` job), conversation resolution.
3. Optionally: require linear history, require signed commits.

## 19. Make the first real commit

```bash
git add .
git commit -m "chore: initialize Rockcrete USA Website Rebuild from project-blueprint-template"
git push origin main
```

## 20. Optional cleanup

Once you are confident the init landed cleanly:

- Delete `init.sh` and `init.ps1` (you won't run them again on this repo).
- Delete `.template/` (placeholders + this checklist; archive to a Drive copy first if you want a record).

These are safe to delete because they are not referenced from any production path, only from the README and from each other.

## When you finish

- Mark the relevant items off this list (or delete the file).
- Add a session-log entry: `bash scripts/new-session.sh "Initial scaffold and first content pass" "Cowork" "Daniel Gonell"`.
- Push.
- Read `docs/project-memory/ai-playbook.md` so the next AI session inherits the standard prompts.
