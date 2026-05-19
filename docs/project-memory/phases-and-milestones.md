# Phases and milestones, Rockcrete USA Website Rebuild

The single canonical tracker for **everything that has a deadline** on this project. Phases group milestones, milestones group deliverables and tasks, deliverables and tasks each have an owner and a due date.

If a piece of work has a date attached, it lives here. If it doesn't have a date, it lives in `status.md` (in-progress / blocked) until it earns one.

**Last updated:** 2026-05-15

## Conventions

- **Phase:** the largest unit. Has start and end dates, an objective, and a payment milestone (if applicable). Examples: `Discovery`, `Foundation`, `Expansion`, `Handover`. Branding projects often have phases like `Discovery`, `Concept`, `Refinement`, `Delivery`.
- **Milestone:** a verifiable point inside a phase. Has an absolute date. Tied to a deliverable or a payment trigger. Numbered with the phase prefix: `D-01`, `D-02`, `F-03`, etc.
- **Deliverable:** an artifact that ships at or before a milestone. Each deliverable has its own MD file in `deliverables/NNNN-slug.md`. Numbered: `01`, `02`, `03`, with no phase prefix in the filename (the phase is stamped inside the file).
- **Task:** a unit of work that contributes to a deliverable. Tasks live in `blueprint-dashboard/telemetry/tasks.json` (machine-readable, drives the Internal Panel) or in your tracker of choice (Linear, Asana, Jira) with a pointer here.

Status values: `not started`, `in progress`, `at risk`, `blocked`, `complete`, `accepted`. "Accepted" means the client signed off in writing.

## Phases

### Phase 1: {{PHASE_1_NAME}}

- **Dates:** {{PHASE_1_START}} to {{PHASE_1_END}}
- **Objective:** {{PHASE_1_OBJECTIVE}}
- **Owner:** {{PHASE_1_OWNER}}
- **Payment trigger:** {{PHASE_1_PAYMENT}}% on acceptance of {{PHASE_1_PAYMENT_DELIVERABLE}}
- **Status:** not started

| ID | Milestone | Date | Deliverable(s) | Owner | Status |
|---|---|---|---|---|---|
| D-01 | {{MILESTONE_1_1}} | {{MILESTONE_1_1_DATE}} | `deliverables/0001-{{SLUG_1_1}}.md` | {{MILESTONE_1_1_OWNER}} | not started |
| D-02 | {{MILESTONE_1_2}} | {{MILESTONE_1_2_DATE}} | `deliverables/0002-{{SLUG_1_2}}.md` | {{MILESTONE_1_2_OWNER}} | not started |
| D-03 | {{MILESTONE_1_3}} | {{MILESTONE_1_3_DATE}} | `deliverables/0003-{{SLUG_1_3}}.md` | {{MILESTONE_1_3_OWNER}} | not started |

### Phase 2: {{PHASE_2_NAME}}

- **Dates:** {{PHASE_2_START}} to {{PHASE_2_END}}
- **Objective:** {{PHASE_2_OBJECTIVE}}
- **Owner:** {{PHASE_2_OWNER}}
- **Payment trigger:** {{PHASE_2_PAYMENT}}% on acceptance of {{PHASE_2_PAYMENT_DELIVERABLE}}
- **Status:** not started

| ID | Milestone | Date | Deliverable(s) | Owner | Status |
|---|---|---|---|---|---|
| F-01 | {{MILESTONE_2_1}} | {{MILESTONE_2_1_DATE}} | `deliverables/0004-{{SLUG_2_1}}.md` | {{MILESTONE_2_1_OWNER}} | not started |
| F-02 | {{MILESTONE_2_2}} | {{MILESTONE_2_2_DATE}} | `deliverables/0005-{{SLUG_2_2}}.md` | {{MILESTONE_2_2_OWNER}} | not started |

### Phase 3: {{PHASE_3_NAME}} (optional)

Replicate the structure above. Delete this section if your project has fewer phases.

## Milestone calendar (chronological)

A flat view across all phases, sorted by date. Useful at-a-glance.

| Date | Phase | ID | Milestone | Owner | Status |
|---|---|---|---|---|---|
| {{MILESTONE_1_1_DATE}} | {{PHASE_1_NAME}} | D-01 | {{MILESTONE_1_1}} | {{MILESTONE_1_1_OWNER}} | not started |
| {{MILESTONE_1_2_DATE}} | {{PHASE_1_NAME}} | D-02 | {{MILESTONE_1_2}} | {{MILESTONE_1_2_OWNER}} | not started |
| {{MILESTONE_1_3_DATE}} | {{PHASE_1_NAME}} | D-03 | {{MILESTONE_1_3}} | {{MILESTONE_1_3_OWNER}} | not started |
| {{MILESTONE_2_1_DATE}} | {{PHASE_2_NAME}} | F-01 | {{MILESTONE_2_1}} | {{MILESTONE_2_1_OWNER}} | not started |
| {{MILESTONE_2_2_DATE}} | {{PHASE_2_NAME}} | F-02 | {{MILESTONE_2_2}} | {{MILESTONE_2_2_OWNER}} | not started |

When a milestone is missed, do not delete the row. Update `Status` to `at risk` or `blocked`, and add a note row immediately below explaining why and what the new target date is.

## Deliverables

Every milestone in the tables above points to a per-deliverable MD file under `deliverables/`. Each deliverable file has:

- TOC matched to the deliverable's purpose.
- Section prompts explaining what to write.
- "Sources" pointing to the interviews, captures, and decisions that feed it.
- A 5-step approval checklist.

Use `bash scripts/new-deliverable.sh "title"` to scaffold a new one (or copy `deliverables/0000-template.md` manually).

## Tasks

Tasks are tracked in two places, with a single source of truth:

1. **`blueprint-dashboard/telemetry/tasks.json`** is the machine-readable canonical store. The dashboard's Internal Panel reads it and renders the live timer, time entries, AI cost attribution, and milestone roll-ups.
2. **Linear / Asana / Jira / etc.** (if your team uses one): point to it from `context-index.md` and treat it as a mirror of `tasks.json`. Reconcile weekly.

If you do not use a separate tracker, `tasks.json` alone is enough. The dashboard UI lets you add and edit tasks without touching the JSON.

## Reporting cadence

| Cadence | Audience | Source data | Output |
|---|---|---|---|
| Daily | The team (Slack / Teams / WhatsApp) | `status.md` "in progress" | One-liner per teammate. |
| Weekly | The team + project lead | `status.md` + `phases-and-milestones.md` + `tasks.json` | Written status, 3-5 paragraphs, in `session-log.md`. |
| Biweekly | Client / sponsor | `phases-and-milestones.md` + completed deliverables | Stakeholder update (see `stakeholder-update.md` if you use one) or live dashboard walkthrough. |
| Monthly | Reviewer / funder (if applicable) | All of the above + `budget-and-payments.md` | Formal report. |

## Maintenance rules

- When a milestone date moves, update the entry **and** add a note row beneath. Do not silently change dates.
- When a deliverable is accepted, change the status to `accepted` and link the acceptance evidence (email screenshot, PDF, signed change order) in the deliverable's own MD file.
- Append payment events to `budget-and-payments.md`, not here.
- If you add a new phase mid-engagement, document the rationale in `decisions.md` and create the relevant deliverable files.
