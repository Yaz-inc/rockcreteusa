# Communication templates, Rockcrete USA Website Rebuild

Paste-ready templates for the most common written communications during an engagement. Each one is reusable across phases and lives in this folder as a single source of truth.

These complement `docs/project-memory/ai-playbook.md` (which has the AI prompts for generating these) and `docs/project-memory/meeting-notes-template.md` (which is the per-meeting capture format).

## Files

| Template | When to use |
|---|---|
| [`biweekly-update.md`](biweekly-update.md) | Every 2 weeks, to the client / sponsor / funder. The single biggest recurring deliverable. |
| [`weekly-update.md`](weekly-update.md) | Every Friday, to the client. Shorter than biweekly; pure progress. |
| [`interview-invitation.md`](interview-invitation.md) | When inviting a stakeholder to a discovery interview or research session. Three flavors: executive, manager, field. |
| [`kickoff-recap-email.md`](kickoff-recap-email.md) | Within 24 hours of the kickoff meeting. Captures decisions, action items, and the URL. |
| [`milestone-acceptance-request.md`](milestone-acceptance-request.md) | When asking the client to formally accept a deliverable. |
| [`closeout-report-email.md`](closeout-report-email.md) | At engagement close, to all stakeholders. |
| [`change-order-request.md`](change-order-request.md) | When proposing a scope change. |

## Conventions

Every template:

- Carries `{{PLACEHOLDERS}}` for project / client / dates / amounts so it's reusable.
- Is written in the project's primary working language. If bilingual, ships a sister file in the secondary language (e.g. `biweekly-update.es.md` if primary is English).
- Is read by humans, not LLMs. No em-dashes; use natural punctuation (colon, comma, parentheses).
- Has a 3-line opening, a tight body, a 3-line closing. Keep it short. People skim emails.
- Includes a subject line, the body, and a sign-off pattern.

## How to use

1. Open the relevant template.
2. Search-and-replace the `{{PLACEHOLDERS}}`.
3. Paste into your email client (Gmail, Outlook, etc.) or your team channel.
4. Send.
5. After sending, log it in `docs/project-memory/stakeholder-register.md` "Communications log".

If the template doesn't quite fit your situation, edit it. Common edits:

- The greeting (formal / informal depending on the relationship).
- The level of detail in the "what's next" section.
- The call-to-action wording.

After editing, if the edit would apply to future engagements too, backport to this folder so the next engagement benefits.

## Adding a new template

If your engagement needs a recurring communication not yet in this folder:

1. Add `templates/your-template.md`.
2. Update this README's table with a row.
3. Update `docs/project-memory/ai-playbook.md` with a prompt the AI can use to generate it.
4. After the engagement, decide if the template is general enough to backport to `project-blueprint-template`.

## What does NOT go here

- Per-instance copies of completed communications (those go in `deliverables/NNNN-<communication-name>.md` if you want them tracked, or `01 - Procurement and Contracts/Sent/` in Drive).
- Internal team memos (those go in `docs/project-memory/session-log.md` or as separate research notes).
- Documents that need approval workflow (those go in `deliverables/` as tracked deliverables).
