# Kickoff recap email template

Send within 24 hours of the kickoff meeting. Captures decisions, action items, and the URL. Short and clean.

Subject line:

```
Rockcrete USA Website Rebuild kickoff recap, {{KICKOFF_DATE}}
```

Body:

```
Hi everyone,

Thank you for the kickoff meeting today (or yesterday). A short recap so we're all aligned.

WHAT WE DECIDED
- {{DECISION_1}}
- {{DECISION_2}}
- {{DECISION_3}}

WHAT'S NEXT
- {{ACTION_1}}: owner {{OWNER_1}}, due {{DUE_1}}
- {{ACTION_2}}: owner {{OWNER_2}}, due {{DUE_2}}
- {{ACTION_3}}: owner {{OWNER_3}}, due {{DUE_3}}

CADENCE WE AGREED
- Status updates: {{UPDATE_CADENCE}} (every {{UPDATE_FREQUENCY}})
- Next meeting: {{NEXT_MEETING_DATE}} at {{NEXT_MEETING_TIME}} ({{NEXT_MEETING_PURPOSE}})

LIVE DASHBOARD
https://rockcreteusa.projectizer.ai/

The dashboard is your window into the engagement. Bookmark it. The public sections are what's visible to everyone with the link; the team uses an admin layer behind the same URL.

OPEN QUESTIONS WE'LL CLOSE BY {{TARGET_DATE}}
- {{OPEN_QUESTION_1}}
- {{OPEN_QUESTION_2}}

If I missed anything or got something wrong, please reply with the correction. Otherwise this recap is the record of what we decided.

Best,
Daniel Gonell
info@newmindsgroup.com · {{PROJECT_LEAD_PHONE}}
```

## Variants

### If the kickoff had a long stakeholder-introduction segment

Add before "What we decided":

```
PEOPLE INTRODUCED TODAY
- {{INTRO_1}} ({{ROLE_1}}, {{ORG_1}})
- {{INTRO_2}} ({{ROLE_2}}, {{ORG_2}})
```

### If the kickoff did NOT close certain expected decisions

```
DECISIONS DEFERRED
- {{DEFERRED_1}}: will resolve by {{RESOLUTION_DATE_1}}
```

Don't pretend a decision was made if it wasn't. Be explicit about what's open.

### If the client wants the recap in a different language

Append a translated version below the original separated by `---`. Keep both in the same email; sending two emails creates ambiguity about which is the record.

## After sending

1. Save a copy to `deliverables/0001-kickoff-recap-{{KICKOFF_DATE}}.md`. This is the engagement's first formal deliverable.
2. Update `decisions.md` with each of the "What we decided" entries.
3. Update `phases-and-milestones.md` with the cadence and next meeting date.
4. Update `stakeholder-register.md` "Communications log".
5. Commit and push.
6. Append a session-log entry: "Kickoff complete, recap sent."

## Tone

- Warm. The kickoff is a relationship beginning; the recap is its handshake.
- Direct. Every bullet is something the recipient can act on or confirm.
- No em-dashes. No filler. No "Just wanted to circle back to."
- Names with last initial unless you know the recipient prefers first-name-only.
