# Stakeholder register, Rockcrete USA Website Rebuild

Every person who has a say, a need, or a dependency on this project. The register exists so the team and any AI agent can reach the right person fast and route communications correctly.

**Last updated:** 2026-05-15

## Conventions

- **Roles** are short tags: `decision-maker`, `sponsor`, `primary-contact`, `subject-matter-expert`, `end-user`, `reviewer`, `funder`, `legal`, `procurement`, `it`, `security`, `change-champion`, `blocker-risk`. A person can carry multiple tags.
- **Tier** captures how much energy the engagement spends on this person:
  - **Tier 1**: regular contact (weekly+), on the kickoff invite, named in deliverables.
  - **Tier 2**: periodic contact (monthly), invited to phase reviews.
  - **Tier 3**: notify-only, on the distribution list for major milestones.
- **Status** captures the relationship's current state: `confirmed`, `pending introduction`, `cool`, `hostile`, `unavailable`.

## Tier 1, regular contact

### {{STAKEHOLDER_1_NAME}}

- **Org / role:** {{STAKEHOLDER_1_ORG}} / {{STAKEHOLDER_1_ROLE}}
- **Tags:** {{STAKEHOLDER_1_TAGS}}
- **Email:** {{STAKEHOLDER_1_EMAIL}}
- **Phone:** {{STAKEHOLDER_1_PHONE}}
- **Preferred channel:** {{STAKEHOLDER_1_CHANNEL}}
- **Time zone:** {{STAKEHOLDER_1_TZ}}
- **Languages:** {{STAKEHOLDER_1_LANG}}
- **Status:** {{STAKEHOLDER_1_STATUS}}
- **What they care about:** {{STAKEHOLDER_1_CARES}}
- **What they can block:** {{STAKEHOLDER_1_BLOCKERS}}
- **Notes:** {{STAKEHOLDER_1_NOTES}}

### {{STAKEHOLDER_2_NAME}}

(same structure)

## Tier 2, periodic contact

### {{STAKEHOLDER_3_NAME}}

(same structure)

## Tier 3, notify-only

### {{STAKEHOLDER_4_NAME}}

(same structure)

## Coverage matrix

A quick view of which stakeholder feeds which deliverable. Saves you from missing someone whose input is required for a specific output.

| Stakeholder | Tier | Feeds deliverable(s) | Validates deliverable(s) | Approves deliverable(s) |
|---|---|---|---|---|
| {{STAKEHOLDER_1_NAME}} | 1 | D-01, D-02 | D-01 | D-01, F-02 |
| {{STAKEHOLDER_2_NAME}} | 1 | D-03 | D-03 |  |
| {{STAKEHOLDER_3_NAME}} | 2 |  | D-02 |  |

## Communications log

A short, append-only log of meaningful interactions with stakeholders. Not every email; only the ones where a decision happened, a commitment was made, or a relationship moved.

| Date | Stakeholder | Channel | Topic | Outcome |
|---|---|---|---|---|
| {{COMMS_DATE_1}} | {{COMMS_PERSON_1}} | {{COMMS_CHANNEL_1}} | {{COMMS_TOPIC_1}} | {{COMMS_OUTCOME_1}} |

## Confirmation status

For projects that require explicit interview / availability confirmation per stakeholder (research-heavy or discovery work), track here:

| Stakeholder | Slot proposed | Slot confirmed | Conducted | Synthesized into |
|---|---|---|---|---|
| {{STAKEHOLDER_1_NAME}} | YYYY-MM-DD HH:MM | | | |
| {{STAKEHOLDER_2_NAME}} | | | | |

## Privacy

This file may contain personal information (phone numbers, time zones, preferred channels). It lives in Git only if the repo is private and the team is comfortable with the shared visibility. For external-facing projects, mirror to a Drive doc with restricted sharing instead, and keep only the `Stakeholder name | Role | Tier` columns in Git.

## Maintenance

- Add a new stakeholder when they enter your sphere; do not wait until a meeting.
- Move a stakeholder between tiers as the engagement evolves.
- Update `Status` if a relationship cools, the person becomes unavailable, or they leave the org.
- Append to the Communications log on every meaningful interaction.
- Mirror to `02 - Team/` in Drive if you keep the parallel structure (with privacy controls).
