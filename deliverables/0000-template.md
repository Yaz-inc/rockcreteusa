# 0000: Template (rename when copying)

Replace `0000` with the next sequence number and `Template` with the deliverable's actual title.

| Field | Value |
|---|---|
| **ID** | 0000 |
| **Title** | {{DELIVERABLE_TITLE}} |
| **Phase** | {{PHASE_NAME}} (D / F / E / H / O) |
| **Milestone tag** | {{MILESTONE_ID}} (e.g. `D-01`, matches `phases-and-milestones.md`) |
| **Status** | draft |
| **Owner** | {{OWNER_NAME}} (@{{OWNER_GH}}) |
| **Reviewer(s)** | {{REVIEWERS}} |
| **Approver (signs off)** | {{APPROVER}} |
| **Due date** | {{DUE_DATE}} |
| **Payment trigger** | {{PAYMENT_TRIGGER}} (e.g. "10% on acceptance" or "none") |
| **Format** | {{FORMAT}} (e.g. "this markdown file", "Figma file at <link>", "PDF in Drive at <path>") |
| **Working language** | en |

## Purpose

One paragraph: what this deliverable is, why it exists, and what changes once it ships.

## Acceptance criteria

The bar for "accepted". The reviewer reads this section and decides whether the deliverable is done. Each criterion is verifiable.

- [ ] {{CRITERION_1}}
- [ ] {{CRITERION_2}}
- [ ] {{CRITERION_3}}

## Sources

The interviews, captures, decisions, and prior artifacts that feed this deliverable. Anyone reading the deliverable should be able to trace each claim back here.

| Source | Type | Date | Note |
|---|---|---|---|
| {{SOURCE_1}} | interview / document / decision / data | YYYY-MM-DD | {{SOURCE_1_NOTE}} |
| {{SOURCE_2}} | | | |

## Table of contents

The structure of the actual deliverable. Edit this list before writing the body so the structure is reviewable on its own.

1. {{TOC_1}}
2. {{TOC_2}}
3. {{TOC_3}}
4. ...

## Dependencies

What this deliverable depends on. If any of these are not in place, the deliverable is blocked.

- {{DEPENDENCY_1}}
- {{DEPENDENCY_2}}

## Risks specific to this deliverable

Pulled from `docs/project-memory/risk-register.md` if applicable.

- {{RISK_REF_1}}
- {{RISK_REF_2}}

---

<!-- BODY -->
<!--
If this deliverable IS a markdown document (e.g. a brief, spec, runbook, ADR rollup),
write its actual content below this line. Use the TOC above as your section structure.

If this deliverable lives elsewhere (a Figma file, a PDF, a working app), use this
section to:
  1. Link to where it lives.
  2. Note the version reviewed.
  3. Capture any design decisions made specifically for this deliverable.
-->

## Body

(Write the deliverable here, or link to it.)

---

## Review log

Append-only. Every meaningful review goes here.

| Date | Reviewer | Round | Outcome | Notes |
|---|---|---|---|---|
| YYYY-MM-DD | {{REVIEWER_1}} | 1 | revision requested | {{NOTES_1}} |
| YYYY-MM-DD | {{REVIEWER_1}} | 2 | accepted | {{NOTES_2}} |

## Sign-off

When accepted, paste the evidence here.

- **Accepted on:** YYYY-MM-DD
- **Accepted by:** {{APPROVER}}
- **Evidence:**
  - Email subject and date, OR
  - Link to signed PDF in Drive, OR
  - Quote from meeting transcript with attendees and date.

## Post-acceptance changes

If the deliverable is changed after acceptance (which should be rare), log each change here. Major post-acceptance changes also need an entry in `docs/project-memory/decisions.md`.

| Date | What changed | Why | Approved by |
|---|---|---|---|
