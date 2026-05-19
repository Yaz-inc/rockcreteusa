# Biweekly update template

Subject line:

```
Rockcrete USA Website Rebuild biweekly update, {{PERIOD_START}} to {{PERIOD_END}}
```

Body:

```
Hi {{CLIENT_PRIMARY_CONTACT}},

A short update on Rockcrete USA Website Rebuild's progress over the last two weeks.

OVERALL STATUS: {{STATUS_TRAFFIC_LIGHT}} (green / yellow / red)
{{STATUS_ONE_LINER}}

WHAT SHIPPED THIS PERIOD
- {{SHIPPED_1}}
- {{SHIPPED_2}}
- {{SHIPPED_3}}

WHAT'S IN FLIGHT FOR THE NEXT TWO WEEKS
- {{NEXT_1}}
- {{NEXT_2}}
- {{NEXT_3}}

KEY METRICS
| Metric | Period start | Period end | Trend |
|---|---|---|---|
| {{METRIC_1}} | | | ↑ / → / ↓ |
| {{METRIC_2}} | | | |

RISKS AND BLOCKERS
{{RISKS_PARAGRAPH}} (or "Nothing material this period.")

DECISIONS WE NEED FROM YOU
- {{DECISION_NEEDED_1}}
- {{DECISION_NEEDED_2}}

(Or "None this period.")

FINANCIAL SNAPSHOT (if you include this)
- Period spend: {{PERIOD_SPEND}}
- Cumulative spend: {{CUMULATIVE_SPEND}} of {{TOTAL_BUDGET}} ({{PERCENT_SPENT}}%)
- Next payment milestone: {{NEXT_PAYMENT_MILESTONE}} on {{NEXT_PAYMENT_DATE}}

LIVE DASHBOARD
https://rockcreteusa.projectizer.ai/

The dashboard reflects everything above plus the full phase, deliverable, and risk detail. The admin layer is for the team; the public layer is what you see.

Please reply to confirm receipt and flag anything I should address before the next update.

Best,
Daniel Gonell
```

## Variants

### If you have a reviewer or funder

Append before the sign-off:

```
COPY: {{REVIEWER_NAME}} ({{REVIEWER_ORG}})

I'll also send a separate funder-format report by {{FUNDER_REPORT_DATE}} per the {{FUNDER_NAME}} reporting cadence.
```

### If the period had a major delivery

Bold the relevant `SHIPPED` line and add a one-line context underneath it. Don't make the email longer; just highlight.

### If status is yellow or red

The status line gets a brief explanation directly after it. Example:

```
OVERALL STATUS: YELLOW
The {{MILESTONE_NAME}} milestone is at risk of slipping by 1 week due to {{REASON}}. Mitigation: {{MITIGATION}}. Expected back to green by {{TARGET_DATE}}.
```

Never let a status be yellow or red without an immediate explanation in the same paragraph.

## After sending

1. Save a copy: `deliverables/NNNN-biweekly-update-{{PERIOD_END}}.md` (lifecycle prompt's "Draft this week's client update" task scaffolds this automatically).
2. Log in `stakeholder-register.md` "Communications log" with date, recipients, topic, outcome.
3. Update `phases-and-milestones.md` if anything moved during the drafting process.
4. Commit and push.

## Tone notes

- Plain, professional, direct. The client is busy.
- No em-dashes. No "I'm pleased to share". No "delve into".
- One subject. One status. One read-through.
- The "decisions we need from you" section is the most important. If there's nothing, say so. If there's something, make it specific and dated.
