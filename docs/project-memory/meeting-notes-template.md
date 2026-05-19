# Meeting / interview notes template, Rockcrete USA Website Rebuild

Use this template for every meeting, interview, or workshop. Save each session as `research/interviews/YYYY-MM-DD-{slug}.md` (or `research/meetings/...` for non-research meetings).

The template has two purposes:

1. Force a consistent capture format so any AI session can synthesize across meetings.
2. Surface the items that need follow-up before they slip.

Copy this file as a starting point for each session.

---

# Meeting: {{TITLE}}

| Field | Value |
|---|---|
| **Date** | YYYY-MM-DD |
| **Time** | HH:MM-HH:MM (TZ) |
| **Format** | in-person / video / phone / async |
| **Location / link** | {{LOCATION_OR_LINK}} |
| **Working language** | {{LANGUAGE}} |
| **Recording** | yes / no (and where stored) |
| **Type** | discovery interview / status meeting / decision meeting / workshop / other |
| **Phase** | {{PHASE_NAME}} |
| **Feeds deliverable(s)** | (list deliverable IDs from `phases-and-milestones.md`) |

## Attendees

| Name | Role | Org | Tier (per stakeholder-register) |
|---|---|---|---|
| {{ATTENDEE_1}} | {{ROLE_1}} | {{ORG_1}} | 1 / 2 / 3 / N/A |
| {{ATTENDEE_2}} | | | |

## Agenda

What we said we would cover.

1.
2.
3.

## Top 3 surprises

What we heard that did NOT match our prior expectations. Format: "We expected X, we heard Y, the implication is Z."

1. **Expected:** ... **Heard:** ... **Implication:** ...
2.
3.

## Top 3 confirmations

What we heard that matches our prior expectations and is now verified.

1.
2.
3.

## Decisions made in this meeting

Decisions explicitly agreed in the meeting. Each decision goes into `decisions.md` (and an ADR if architecturally significant) within 24 hours.

| Decision | Made by | Rationale | Goes into |
|---|---|---|---|
| | | | `decisions.md` / ADR-NNNN |

## Open questions raised

Things we discussed but didn't close. Format the question in a way that has a yes/no or specific answer.

1. {{QUESTION_1}}
2. {{QUESTION_2}}

These should also land in `status.md` "Blocked / open questions" if not closed within 48 hours.

## Action items

Format: who, what, by when. No "the team will..." (assign a person).

| # | Owner | Action | Due | Status |
|---|---|---|---|---|
| 1 | | | YYYY-MM-DD | open |
| 2 | | | YYYY-MM-DD | open |

## Verbatim quotes

Quotes worth using in deliverables. Mark each with permission status.

> "{{QUOTE}}"
>   - {{ATTRIBUTION}}, {{DATE}}
>   - Permission to attribute publicly: yes / no / ask later
>   - Permission to use anonymously: yes / no

## Risks surfaced

New risks that came up. Add to `risk-register.md`.

- {{RISK_DESCRIPTION_1}} (severity: low / medium / high)

## Follow-up needed

Things to do AFTER this meeting that aren't action items per se. (Reading material to send, calendar holds to set, additional people to loop in.)

-

## Next meeting

If a follow-up was scheduled:

| Field | Value |
|---|---|
| Date | YYYY-MM-DD HH:MM (TZ) |
| Format | |
| Attendees | |
| Goal | |

## Mapping to deliverables

Which deliverables this meeting feeds, with one line of context per mapping.

| Deliverable | What this meeting contributes |
|---|---|
| `deliverables/0001-{{slug}}.md` | |
| `deliverables/0002-{{slug}}.md` | |

## Synthesis notes (for the synthesizer / AI agent)

Free-form notes that don't fit the structured sections. The AI agent that synthesizes across meetings will read these.

---

## After-meeting checklist

The 24-hour rule. Within 24 hours of the meeting:

- [ ] File saved as `research/interviews/YYYY-MM-DD-{slug}.md` (or appropriate subfolder).
- [ ] Decisions appended to `docs/project-memory/decisions.md`.
- [ ] Action items in your tracker (Linear / Asana / etc.) or in `tasks.json`.
- [ ] `stakeholder-register.md` "Communications log" updated.
- [ ] Quotes with `Permission to attribute publicly: ask later` flagged in your follow-up list.
- [ ] Open questions added to `status.md`.
- [ ] New risks added to `risk-register.md`.
- [ ] Session-log entry appended to `session-log.md`.
- [ ] Recap email sent to attendees (if applicable).
