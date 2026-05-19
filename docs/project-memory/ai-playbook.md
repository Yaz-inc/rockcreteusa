# AI playbook, Rockcrete USA Website Rebuild

The standard prompts and operational patterns for any AI session on this project. Treat this as the script. New AI sessions read this first; experienced operators graduate to ad-hoc as they learn the project.

**Last updated:** 2026-05-15

## How to use this file

- **At the start of any session:** ensure the project-instructions block from `instructions.md` is pasted into your AI tool's project-instructions field. The block already loads `docs/project-memory/` as context.
- **For a specific task:** use the prompts in this file as the starting point. They're tuned for this project's conventions.
- **For new patterns you invent:** add them here so the next session benefits.

## Ship and publish (mandatory)

Every substantive edit and every new slice of functionality must ship **incrementally**. **Doing the work includes shipping it in the same session**—there is no separate “later we’ll deploy” phase unless Daniel explicitly freezes the branch.

After **each** meaningful change under `blueprint-dashboard/` (including `data/project-tracker.json`), `middleware.js`, or other dashboard-serving assets:

1. Commit and push to `main`.
2. Wait for Vercel **production** to deploy that commit (status **Ready**).
3. Spot-check `https://rockcreteusa.projectizer.ai/` behind Basic Auth.

Do not report **done** when work exists only locally, only in an unpushed commit, or when production is stale/red. See `source-of-truth.md` for the full session close-out checklist.

## Standard prompts

### Daily standup digest

Use at the start of your day to surface what's moved.

```
Read docs/project-memory/session-log.md for the most recent 3 entries
and docs/project-memory/status.md. Tell me, in 5 lines:
  1. What was completed yesterday.
  2. What's in progress.
  3. What's blocked and waiting on whom.
  4. Anything in `phases-and-milestones.md` that's at risk this week.
  5. The single most important thing for today.
```

### Weekly or biweekly client update

Use Friday end-of-week. Produces a paste-ready update.

```
Generate the {weekly|biweekly} client update for Rockcrete USA Website Rebuild. Audience:
{{CLIENT_PRIMARY_CONTACT}} and the team at Rockcrete USA. Tone: professional,
direct, no marketing language. Working language: en.

Use the format in templates/biweekly-update.md (for biweekly) or
templates/weekly-update.md (for weekly). Do not invent a new structure;
the templates are the format of record.

Pull from:
  - docs/project-memory/status.md (Done since last update / In progress / Blocked)
  - docs/project-memory/phases-and-milestones.md (next milestone, target date, status)
  - deliverables/* (anything that moved to "accepted" since last update)
  - blueprint-dashboard/telemetry/tasks.json (hours spent this week, by category)

Fill in every {{PLACEHOLDER}} in the template. If a value isn't in the source files,
ask via AskUserQuestion rather than inventing it.

No em-dashes anywhere. No "I'm pleased to share" or similar boilerplate.
```

### Send a kickoff recap (within 24 hours of the meeting)

```
Generate the kickoff recap email using templates/kickoff-recap-email.md as the
format. Pull decisions, action items, attendees, cadence, and open questions from
docs/project-memory/session-log.md (the latest kickoff entry) and from any
meeting transcript in research/meetings/.
```

### Request milestone acceptance

```
A deliverable is ready for client acceptance. Generate the acceptance request
email using templates/milestone-acceptance-request.md. Pull the deliverable
title, ID, acceptance criteria, and payment trigger from the deliverable file
under deliverables/.
```

### Send a closeout email at engagement close

```
Generate the engagement closeout email using templates/closeout-report-email.md.
Pull shipped deliverables, lessons learned, and handover details from
docs/project-memory/lessons-learned.md (the final retrospective entry) and
from the completed deliverables/.
```

### Submit a change order request

```
The client has asked for work outside the agreed scope. Use
templates/change-order-request.md as the format. Document the change, the
cost / time impact, and the alternatives. Do not start the new work until
written approval is received and logged in decisions.md.
```

### Invite a stakeholder to an interview

```
Generate an interview invitation using templates/interview-invitation.md. Pick
the variant matching the stakeholder's tier (executive, manager, field, or
external). Pull the stakeholder's name, role, and contact info from
docs/project-memory/stakeholder-register.md.
```

### Synthesize an interview transcript

Use after every research interview to extract findings cleanly.

```
You are reading an interview transcript. Produce a synthesis using the template
at docs/project-memory/meeting-notes-template.md. Specifically:

  - Identify the top 3 surprises (where what we heard differs from what we expected).
  - Identify the top 3 confirmations (where what we heard matches expectations).
  - Extract follow-ups with owner and deadline.
  - List decisions the interviewee asked us to make, with the trade-offs they offered.
  - Map each finding to which deliverable in deliverables/* it feeds.
  - Capture 2-3 verbatim quotes worth using (with permission to attribute or not).

Working language: en.
Output format: markdown, ready to save as
research/interviews/YYYY-MM-DD-{{INTERVIEWEE_SLUG}}.md.
```

### Update phases-and-milestones after a sprint demo

```
The sprint demo just finished. Update docs/project-memory/phases-and-milestones.md:
  - Move accepted milestones to "complete" or "accepted" status.
  - Update at-risk milestones with the new target date and a one-line note.
  - If a new milestone was added during the demo, scaffold a row for it and
    create a deliverable file via `bash scripts/new-deliverable.sh "title"`.
  - Append a session-log entry capturing the demo, attendees, decisions, action items.
  - If a decision was made, also append to docs/project-memory/decisions.md.
  - Update docs/project-memory/budget-and-payments.md if a payment milestone moved.
```

### Re-skin the dashboard for a brand color change

```
The client provided a brand color: <#HEX>. Update blueprint-dashboard/index.html:
  - Find the THEME TOKENS block.
  - Set --color-brand to the new color.
  - Adjust --color-brand-2 (a 20% darker shade for hover states) and
    --color-brand-soft (a 90% lighter tint for backgrounds).
  - Verify both light and dark theme variants meet WCAG 2.1 AA contrast for
    text on brand-soft backgrounds.
  - Take a screenshot at default zoom and one at 200% zoom for accessibility check.
  - If the change is large, append a session-log entry.
```

### Refresh AI telemetry

```
Run python3 blueprint-dashboard/telemetry/extract-telemetry.py /path/to/session.jsonl
and update blueprint-dashboard/telemetry/panel-interno-telemetry.json.

Then summarize:
  - Tokens used this session.
  - AI cost (USD).
  - Equivalent human cost (10x multiplier).
  - The 3 most expensive prompts (by output token count).
  - Cumulative cost this phase, pulled from prior telemetry snapshots.

Append the session-log entry with these numbers.
```

### Generate a new ADR

```
We just decided <decision>. The rationale: <rationale>. Alternatives we considered:
<alternatives>. Generate the next ADR via:

  bash scripts/new-adr.sh "<short title>"

Then fill in:
  - Context: why this came up now.
  - Options: at least 2, with pros/cons each.
  - Decision: which we picked and why.
  - Consequences: what becomes easier and harder.

Add a one-line entry to docs/project-memory/decisions.md linking to the ADR.
```

### Generate a kickoff agenda

```
Use docs/project-memory/kickoff-agenda.md as the template. Fill in:
  - Date, time, attendees (from stakeholder-register.md, Tier 1 only).
  - Project name, client name, working language.
  - The current state from status.md.
  - The next milestone from phases-and-milestones.md.
  - Talking points: 3-5 specific outcomes we want from the meeting.

Output a markdown file ready for the meeting, plus a separate "speaker notes"
section gated as data-admin-only on the dashboard.
```

### Run the naming-and-writing lint locally

```
Run: bash scripts/lint-naming.sh

Read the output. If there are violations:
  - For path-naming violations, propose renames.
  - For em-dash violations, replace each with the natural alternative
    documented in docs/project-memory/writing-conventions.md.

Do not commit until lint passes.
```

## Operational patterns

### When a new file is added to the project

```
1. Update docs/project-memory/context-index.md with the new file and its purpose.
2. If it's a top-level folder change, also update docs/project-memory/folder-structure.md.
3. If it's a deliverable, add a row to docs/project-memory/phases-and-milestones.md.
4. If it changes a convention, document it in docs/project-memory/decisions.md.
```

### When a meeting happens

```
1. Take notes during the meeting (or transcribe after).
2. Run the "Synthesize an interview transcript" prompt.
3. Save the synthesis under research/interviews/YYYY-MM-DD-<slug>.md.
4. Update stakeholder-register.md "Communications log" with one row.
5. Append a session-log.md entry.
6. If decisions were made, append to decisions.md.
```

### When the dashboard needs a content update

```
1. Edit blueprint-dashboard/index.html.
2. Verify both ES and EN attributes are updated for any text node.
3. Verify light and dark theme variants both render cleanly.
4. Verify guest view (no admin-only content visible).
5. Push to main; Vercel auto-deploys (or run deploy.sh for Vultr).
```

### When something breaks in production

```
1. Check the live URL. Capture the error.
2. Roll back: re-deploy a known-good version.
   - Vercel: in dashboard → Deployments → "Promote to Production" on the last good deploy.
   - Vultr: open an earlier copy of index.html, run deploy.sh.
3. Investigate root cause.
4. Append a session-log entry capturing what broke, why, and the fix.
5. If the cause is structural, add a risk to risk-register.md.
```

## Project-specific prompts

Add prompts that are specific to this engagement here. Generic prompts go above; this section is the engagement's own playbook.

### {{PROJECT_SPECIFIC_PROMPT_1_NAME}}

```
{{PROJECT_SPECIFIC_PROMPT_1}}
```

### {{PROJECT_SPECIFIC_PROMPT_2_NAME}}

```
{{PROJECT_SPECIFIC_PROMPT_2}}
```

## Anti-patterns

What NOT to ask the AI to do on this project:

- **Do not** generate content from scratch without grounding in `docs/project-memory/` or `research/`. Hallucinated context is the fastest way to lose client trust.
- **Do not** push to `main` without running the lint locally. CI will catch it but you'll have a dirty commit history.
- **Do not** edit the dashboard's structural CSS without re-checking dark mode + mobile breakpoints. They drift fast.
- **Do not** put confidential text behind `data-admin-only` on a public Vercel deployment. The gating is cosmetic. See `blueprint-dashboard/docs/client-vs-internal.md`.
- **Do not** rename anything in `03 - Client Documents/` (Drive). Their original names are the audit trail.

## Maintenance

- Add a new prompt here every time you discover one that worked well. Future sessions benefit immediately.
- Retire prompts that don't match how the project works anymore. Stale prompts are worse than no prompts.
