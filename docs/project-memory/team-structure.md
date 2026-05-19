# Team structure, Rockcrete USA Website Rebuild

How the team is organized, who owns what, who reviews what, and where the capacity gaps are.

**Last updated:** 2026-05-15

## The team

| Name | Role | Stage(s) | Github | Email | Notes |
|---|---|---|---|---|---|
| Daniel Gonell | Project lead | all | @newmindsgroup | info@newmindsgroup.com | Primary contact, owns the architecture and the client relationship. |
| {{TEAM_MEMBER_2}} | {{TEAM_MEMBER_2_ROLE}} | {{TEAM_MEMBER_2_STAGES}} | @{{TEAM_MEMBER_2_GH}} | {{TEAM_MEMBER_2_EMAIL}} | {{TEAM_MEMBER_2_NOTES}} |
| {{TEAM_MEMBER_3}} | {{TEAM_MEMBER_3_ROLE}} | {{TEAM_MEMBER_3_STAGES}} | @{{TEAM_MEMBER_3_GH}} | {{TEAM_MEMBER_3_EMAIL}} | {{TEAM_MEMBER_3_NOTES}} |
| {{TEAM_MEMBER_4}} | {{TEAM_MEMBER_4_ROLE}} | {{TEAM_MEMBER_4_STAGES}} | @{{TEAM_MEMBER_4_GH}} | {{TEAM_MEMBER_4_EMAIL}} | {{TEAM_MEMBER_4_NOTES}} |

Add or remove rows as needed. For solo engagements, the table is one row.

## Client side

| Name | Role at Rockcrete USA | Email | Notes |
|---|---|---|---|
| {{CLIENT_PRIMARY_CONTACT}} | {{CLIENT_PRIMARY_ROLE}} | {{CLIENT_PRIMARY_EMAIL}} | Primary day-to-day contact. |
| {{CLIENT_DECISION_MAKER}} | {{CLIENT_DECISION_ROLE}} | {{CLIENT_DECISION_EMAIL}} | Owns sign-off authority on deliverables. |

## Reviewers / counterparties (if any)

For projects with a third-party reviewer, funder, or auditor:

| Name | Organization | Role | Email |
|---|---|---|---|
| {{REVIEWER_NAME}} | {{REVIEWER_ORG}} | {{REVIEWER_ROLE}} | {{REVIEWER_EMAIL}} |

Delete this section if not applicable.

## Per-stage ownership (RACI)

For multi-stage engagements, indicate who is Responsible, Accountable, Consulted, Informed for each stage's deliverables.

| Stage | Deliverable | R | A | C | I |
|---|---|---|---|---|---|
| {{STAGE_1}} | {{STAGE_1_DELIVERABLE_1}} | {{STAGE_1_R}} | {{STAGE_1_A}} | {{STAGE_1_C}} | {{STAGE_1_I}} |
| {{STAGE_2}} | {{STAGE_2_DELIVERABLE_1}} | {{STAGE_2_R}} | {{STAGE_2_A}} | {{STAGE_2_C}} | {{STAGE_2_I}} |

If you do not need RACI, replace this section with a simpler "who owns what" list.

## Review routing

Who reviews what before it ships:

| Artifact type | Reviewer(s) | Approval threshold |
|---|---|---|
| Code (PRs into `main`) | At least one CODEOWNER | 1 approval |
| ADRs (architecturally significant decisions) | Daniel Gonell + {{ADR_REVIEWER}} | 2 approvals |
| Client-facing deliverables | Daniel Gonell + {{CLIENT_PRIMARY_CONTACT}} | client sign-off |
| External communications (emails, slides) | Daniel Gonell | 1 approval |

## Capacity picture

A short, honest paragraph about where the team has strength and where the gaps are. Update this if a teammate is unavailable for an extended period or if a gap is discovered late.

{{CAPACITY_SUMMARY}}

If gaps exist that the engagement requires (for example, the team is heavy on UX but light on backend, or strong on strategy but light on implementation), surface them to the client / sponsor early. Late-discovered gaps are a top cause of slippage.

## Communication norms

- **Channel:** {{TEAM_CHANNEL}} (Slack / Teams / Discord / WhatsApp)
- **Cadence:** {{CADENCE}} (e.g. "weekly Monday standup, biweekly sprint demo, monthly steering committee")
- **Decision turnaround:** {{DECISION_TURNAROUND}} (e.g. "decisions need responses within 48 hours")
- **Off-hours:** {{OFF_HOURS_RULE}} (e.g. "no expectation of response after 6pm local time or on weekends")

## How conflicts are resolved

If two team members disagree on an architectural or scope decision, the path is:

1. Discuss in the team channel; try to converge.
2. If no convergence after 24 hours, escalate to Daniel Gonell.
3. If Daniel Gonell cannot resolve it, escalate to {{CLIENT_DECISION_MAKER}}.
4. The decision is recorded in `decisions.md` with the rationale and what was decided.

## Onboarding a new teammate

Day 1:

1. Read all files in `docs/project-memory/` in the order listed in `README.md`.
2. Clone https://github.com/newmindsgroup/rockcreteusa-project-blueprint.
3. Run `cd rockcreteusa-website-rebuild && {{LOCAL_DEV_COMMAND}}` to verify local dev works.
4. Read the most recent 5 entries in `session-log.md`.
5. Pair with Daniel Gonell for 30 minutes to walk through the live dashboard at https://rockcreteusa.projectizer.ai/.

Week 1:

- Pick up a small "starter" task from the open backlog to land your first PR.
- Add yourself to `team-structure.md` (this file) and `.github/CODEOWNERS` if applicable.
