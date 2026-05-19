# Kickoff agenda, Rockcrete USA Website Rebuild

The first formal meeting between the team and Rockcrete USA. Sets expectations, introduces the team, walks through the Blueprint, locks the cadence, and surfaces the first open questions.

**Status:** template, fill in actual values once a kickoff date is locked.

## Meeting metadata

| Field | Value |
|---|---|
| **Date** | {{KICKOFF_DATE}} |
| **Time** | {{KICKOFF_TIME}} ({{KICKOFF_TZ}}) |
| **Format** | {{KICKOFF_FORMAT}} (in-person / video / hybrid) |
| **Location** | {{KICKOFF_LOCATION}} |
| **Duration** | {{KICKOFF_DURATION}} (typical: 60-90 minutes) |
| **Working language** | en (with en support if bilingual) |
| **Recording** | {{KICKOFF_RECORDING}} (yes / no, by whom) |

## Attendees

Pulled from `stakeholder-register.md` (Tier 1) plus team. Send the calendar invite at least 5 business days ahead.

**From the team:**

- Daniel Gonell ({{PROJECT_LEAD_ROLE}})
- {{TEAM_MEMBER_2}} ({{TEAM_MEMBER_2_ROLE}})
- {{TEAM_MEMBER_3}} ({{TEAM_MEMBER_3_ROLE}})

**From the client:**

- {{CLIENT_PRIMARY_CONTACT}} ({{CLIENT_PRIMARY_ROLE}})
- {{CLIENT_DECISION_MAKER}} ({{CLIENT_DECISION_ROLE}})
- {{CLIENT_OTHER_1}}

**From the funder / reviewer (if applicable):**

- {{REVIEWER_NAME}} ({{REVIEWER_ROLE}})

## Outcomes we want

What the meeting must produce. If we don't get these by the end, the kickoff didn't land.

1. {{OUTCOME_1}}
2. {{OUTCOME_2}}
3. {{OUTCOME_3}}

Common outcomes:

- Confirm the {{PHASE_1_NAME}} dates and lock the calendar.
- Lock the cadence (weekly / biweekly demo, status update format).
- Get the first batch of stakeholder names + emails for upcoming interviews.
- Confirm the four open questions the engagement can't proceed without.
- Walk the client through the live Blueprint Dashboard URL.

## Agenda (minute-by-minute)

Adjust the timing to match the actual duration. The skeleton:

| Time | Block | What happens | What we say |
|---|---|---|---|
| 00:00–00:07 | Welcome | Hosts welcome, introductions around the room. | "Thanks for making the time. Brief intros, then we'll walk through the Blueprint." |
| 00:07–00:17 | Team introduction | Each team member: 60 seconds. Background + role on this engagement. | One slide per person OR live narration. |
| 00:17–00:25 | Context and progress so far | What's already been done in pre-kickoff. Why we're here today. | Three slides max. |
| 00:25–00:55 | Walk the Blueprint | Tour the live dashboard at https://rockcreteusa.projectizer.ai/. Show the phase calendar, deliverables, live status. | "This is the same URL you'll have for the duration. Here's how it works." Pause at the cronograma for client questions. |
| 00:55–01:10 | Stakeholders + interview calendar | Identify additional stakeholders. Discuss the upcoming interview schedule. | "Names and emails are enough today. We'll handle scheduling in the next 2-3 days." |
| 01:10–01:25 | Open questions to close | Walk through the 3-5 open questions from `status.md` that the team needs decisions on. | "Here are the things we can't progress without. Can we get a yes/no/we'll-revert per item?" |
| 01:25–01:30 | Close + next steps | Confirm cadence. Confirm next meeting date. Send-off. | "Thanks. Recap of action items goes out today." |

## Plan B for common failure modes

| If... | Then... |
|---|---|
| Projector / video fails | Use the printed handout (PDF version of the dashboard) and walk verbally. |
| Decision-maker is virtual or arrives late | Cover everything that doesn't need their decision first. Park decision items for a follow-up. |
| Client resists sharing direct contact info for stakeholders | Don't push. Take whatever framing they offer ("we'll set up the meetings ourselves"). Adjust the Plan accordingly. |
| You're running short on time | Cut the team intros from 60 to 30 seconds. Cut "Context and progress so far". Never cut the Open Questions block. |
| A stakeholder dominates with off-topic concerns | Acknowledge, take the concern as a follow-up, redirect to the next agenda block. Don't argue. |

## Pre-meeting checklist (T-30 minutes)

- [ ] Live dashboard URL works on the projection device.
- [ ] Logged in as admin on the speaker / tablet device.
- [ ] Logged in as **guest** on the projection device (so the client sees the guest view).
- [ ] Backup PDF / printed handout in case projector fails.
- [ ] Audio / video tested.
- [ ] Recording started (if applicable; with attendee permission).
- [ ] Coffee / water available.
- [ ] Notebook + pen in case the digital tools fail.

## Post-meeting actions

The first 24 hours after kickoff are decisive. Run these the same day:

1. Send the recap email to all attendees within 24 hours. Include:
   - Decisions made.
   - Open items + owners + due dates.
   - The next meeting date.
   - The dashboard URL with a reminder of the bookmark.
2. Update `phases-and-milestones.md` with any date changes from the meeting.
3. Update `decisions.md` with anything material.
4. Update `stakeholder-register.md` with the new contacts.
5. Append a session-log entry with attendance, notable moments, and what to fix for the next meeting.
6. Schedule the next meeting if it isn't on the calendar yet.

## Speaker notes (admin-only on the dashboard)

These are for the team lead, not for the client. Mark `data-admin-only` if rendering on the dashboard.

- The decision-maker tends to {{DECISION_MAKER_TENDENCY}}. Plan for it.
- The primary contact prefers {{CONTACT_PREFERENCE}}. Lean into that channel.
- Avoid the topic of {{SENSITIVE_TOPIC}} unless the client raises it. {{REASON}}.
- The most likely point of friction is {{FRICTION_POINT}}. The script for handling it: {{SCRIPT}}.

## Outputs

The kickoff produces these artifacts (track in `phases-and-milestones.md` as deliverables):

- Recap email (sent to all attendees).
- Updated `stakeholder-register.md`.
- Updated `phases-and-milestones.md`.
- Calendar holds for the next 4-8 weeks.
- A session-log entry capturing the meeting.
