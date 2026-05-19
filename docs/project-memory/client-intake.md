# Client intake, Rockcrete USA Website Rebuild

The information the team needs to gather from Rockcrete USA before serious work starts. Run through this in the first one or two meetings, then keep it as a reference. Anything left blank after week 2 is a risk.

**Last updated:** 2026-05-15

## How to use

Status flags per item:

- ⬜ Not yet asked
- 🟡 Asked, awaiting answer
- 🟢 Answered (note where the answer lives)
- ⚪ Not applicable to this engagement

For each item: ask early, document the answer in the linked file, mark green.

## 1. Identity and intent

| Item | Status | Where it lives |
|---|---|---|
| Legal entity name and address | ⬜ | `01 - Procurement and Contracts/` (Drive) |
| Engagement objective in the client's own words | ⬜ | `overview.md` "What this project is" |
| What "success" looks like to the client by month 3 / 6 / 12 | ⬜ | `overview.md` "Goals" + "Success metrics" |
| What "failure" looks like (worst-case the client wants to avoid) | ⬜ | `overview.md` "Non-goals" + `risk-register.md` |
| Who is the executive sponsor (the person whose career is on the line) | ⬜ | `stakeholder-register.md` (Tier 1) |
| Who is the primary day-to-day contact | ⬜ | `stakeholder-register.md` (Tier 1) |
| Who has sign-off authority on each deliverable | ⬜ | `team-structure.md` "Review routing" |

## 2. Scope

| Item | Status | Where it lives |
|---|---|---|
| Final scope confirmed in writing | ⬜ | `01 - Procurement and Contracts/` (signed SOW) |
| Out-of-scope items explicitly listed | ⬜ | `overview.md` "Non-goals" |
| Anticipated changes that might trigger change orders | ⬜ | `risk-register.md` (operational risks) |
| Hard deadlines (regulatory, board, fiscal) | ⬜ | `phases-and-milestones.md` |
| Dependencies on third parties (vendors, regulators) | ⬜ | `context-index.md` "External systems" + `risk-register.md` |

## 3. People

| Item | Status | Where it lives |
|---|---|---|
| Full org chart relevant to this engagement | ⬜ | `02 - Team/` (Drive) and/or `stakeholder-register.md` |
| Tier 1 stakeholders identified, contacted, confirmed | ⬜ | `stakeholder-register.md` |
| Working time zones across the team and client | ⬜ | `team-structure.md` and `stakeholder-register.md` |
| Preferred languages per person | ⬜ | `stakeholder-register.md` |
| Anyone on PTO / parental / extended leave during the engagement | ⬜ | `team-structure.md` "Capacity picture" |

## 4. Process and access

| Item | Status | Where it lives |
|---|---|---|
| Existing systems we need read access to (CRM, ERP, project tracker) | ⬜ | `context-index.md` "External systems" |
| Existing documentation we need to read | ⬜ | `03 - Client Documents/` (Drive) |
| Communication channel of record (Slack, Teams, email, WhatsApp) | ⬜ | `team-structure.md` "Communication norms" |
| Cadence agreed: standup, demo, status update, steering committee | ⬜ | `team-structure.md` "Communication norms" |
| Decision turnaround SLA from the client | ⬜ | `team-structure.md` "Communication norms" |
| Off-hours expectation (or absence of) | ⬜ | `team-structure.md` |

## 5. Money

| Item | Status | Where it lives |
|---|---|---|
| Total contract value confirmed in writing | ⬜ | `budget-and-payments.md` |
| Currency and FX assumptions | ⬜ | `budget-and-payments.md` |
| Payment milestones agreed | ⬜ | `budget-and-payments.md` |
| Payment terms (Net N from invoice) | ⬜ | `budget-and-payments.md` |
| Invoice routing: who, what fields, what attachments | ⬜ | `budget-and-payments.md` |
| Tax / withholding situation (1099 vs. foreign payment) | ⬜ | `budget-and-payments.md` |
| Reserve / contingency line and approval flow for using it | ⬜ | `budget-and-payments.md` |

## 6. Compliance and legal

| Item | Status | Where it lives |
|---|---|---|
| NDA in place (signed both ways) | ⬜ | `01 - Procurement and Contracts/` |
| IP terms (who owns what, when transfer happens) | ⬜ | `overview.md` "Constraints" + `decisions.md` |
| Data protection regime (GDPR, HIPAA, local law) | ⬜ | `overview.md` "Constraints" |
| PII / sensitive-data handling rules | ⬜ | `SECURITY.md` |
| Required certifications (SOC2, ISO 27001) | ⬜ | `overview.md` "Constraints" |
| Conflict-of-interest disclosures filed | ⬜ | `01 - Procurement and Contracts/` |
| Insurance certificate provided to client (if required) | ⬜ | `01 - Procurement and Contracts/Insurance/` |

## 7. Brand and voice (if relevant)

For branding / website / content engagements:

| Item | Status | Where it lives |
|---|---|---|
| Existing brand assets (logo files, fonts, palette) | ⬜ | `03 - Client Documents/` (Drive) |
| Existing voice / style guide | ⬜ | `03 - Client Documents/` |
| Tone preferences and red lines | ⬜ | `glossary.md` "Translation rules" |
| Approved imagery / forbidden imagery | ⬜ | `decisions.md` |

## 8. Technical (if relevant)

For software / website / AI engagements:

| Item | Status | Where it lives |
|---|---|---|
| Existing tech stack constraints | ⬜ | `overview.md` "Tech stack" + ADR |
| Hosting environment (cloud account, region, ownership) | ⬜ | `decisions.md` + ADR |
| Existing CI/CD setup we need to integrate with | ⬜ | `context-index.md` |
| Domain registration and DNS access | ⬜ | `context-index.md` |
| Auth/SSO requirements (Okta, Azure AD, Google Workspace) | ⬜ | ADR |
| Performance budget | ⬜ | `decisions.md` + ADR |
| Accessibility target (WCAG 2.1 AA, AAA) | ⬜ | `overview.md` "Constraints" |

## 9. Risks raised by the client

What the client thinks could go wrong. Capture in their words; translate to entries in `risk-register.md`.

| Concern (in client's words) | Risk register ID | Status |
|---|---|---|
| | | |

## 10. Open questions from this intake

Anything left ⬜ or 🟡 by the end of week 2 becomes an entry in `status.md` "Blocked / open questions" and an item on the kickoff or first follow-up agenda.

## Maintenance

- Run through this list during the first internal team meeting after the kickoff. Mark every row.
- Re-run on day 14 (or end of week 2). Anything still ⬜ or 🟡 is now a risk; document it.
- Optional: rerun at the end of every phase to confirm the picture is still accurate.
