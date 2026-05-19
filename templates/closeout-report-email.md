# Closeout report email template

Send at engagement close, to all stakeholders. Pairs with the closeout report deliverable saved under `deliverables/`.

Subject line:

```
Rockcrete USA Website Rebuild: engagement closeout
```

Body:

```
Hi everyone,

Rockcrete USA Website Rebuild closes today. Thank you for the partnership.

WHAT WE SHIPPED
- {{DELIVERABLE_1}}: {{DELIVERABLE_1_SUMMARY}}
- {{DELIVERABLE_2}}: {{DELIVERABLE_2_SUMMARY}}
- {{DELIVERABLE_3}}: {{DELIVERABLE_3_SUMMARY}}
- {{DELIVERABLE_4}}: {{DELIVERABLE_4_SUMMARY}}

(See the full list in the closeout report at {{CLOSEOUT_REPORT_LINK}}.)

WHAT WE LEARNED
{{TOP_3_LESSONS_AS_PARAGRAPH}}

WHAT'S NEXT FOR YOU
- {{ARTIFACT_HANDOVER}}: the complete engagement repo is at https://github.com/newmindsgroup/rockcreteusa-project-blueprint. The live dashboard at https://rockcreteusa.projectizer.ai/ will continue running until {{DASHBOARD_END_DATE}} (or transfer to your team per the agreement).
- {{KNOWLEDGE_TRANSFER}}: any open follow-ups are listed in the closeout report.
- {{SUPPORT}}: I'm available for {{SUPPORT_WINDOW}} days of post-engagement questions at no additional charge. Reach me at info@newmindsgroup.com.

WHAT'S NEXT FOR US
{{TEAM_NEXT_STEPS}}: e.g. "The team will archive the repo on {{ARCHIVE_DATE}}. The Vercel project transfers to your team on {{TRANSFER_DATE}}. Drive folder access will remain in place per the SOW's confidentiality clause."

INVOICE STATUS
{{FINAL_INVOICE_STATUS}}: e.g. "Final invoice was sent on {{FINAL_INVOICE_DATE}}. Payment due by {{FINAL_PAYMENT_DUE}}."

A FAVOR
If the engagement met your expectations, a short note for our portfolio / reference would be appreciated. No pressure.

It was a pleasure working with you. Wishing the team success in what comes next.

Best,
Daniel Gonell
info@newmindsgroup.com
```

## Variants

### If the engagement is transferring the system to the client

Add a dedicated handover section:

```
HANDOVER ARTIFACTS
We're transferring these artifacts to your team today:
- Codebase: https://github.com/newmindsgroup/rockcreteusa-project-blueprint (you receive owner rights at {{TRANSFER_DATETIME}})
- Live dashboard: https://rockcreteusa.projectizer.ai/ (Vercel project ownership transfers at {{TRANSFER_DATETIME}})
- Documentation: see {{DOCUMENTATION_LINK}}
- Credentials: see {{CREDENTIALS_LINK}} (secured channel; please confirm receipt)
- Domain names: {{DOMAINS}} (transfer requested with registrar; ETA {{ETA}})
- Cloud services: {{CLOUD_SERVICES}} (account credentials in {{CRED_LOCATION}})

HANDOVER DOCUMENT
A complete inventory of every artifact, where it lives, and how to maintain it: {{HANDOVER_DOC_LINK}}
```

### If you'd like a formal retrospective with the client

```
RETROSPECTIVE
I'd love a 45-minute retrospective with your team to capture what worked and what would change. Three available slots:
- {{SLOT_1}}
- {{SLOT_2}}
- {{SLOT_3}}

Optional but valuable; let me know if any work.
```

## After sending

1. Save a copy: `deliverables/NNNN-closeout-email-{{CLOSEOUT_DATE}}.md`.
2. Update `phases-and-milestones.md`: mark the engagement as closed.
3. Update `overview.md`: add a "Status: closed on {{CLOSEOUT_DATE}}" header at the top.
4. Append `decisions.md`: "Engagement closed on {{CLOSEOUT_DATE}}."
5. Append `lessons-learned.md`: append the engagement-level retrospective.
6. Append `session-log.md`: final entry summarizing the engagement.
7. Commit and push.
8. Per the closeout task in `lifecycle-orchestrator.md`, either archive the GitHub repo, delete the Vercel project, or transfer ownership per the agreement.

## Tone

- Warm but unsentimental. Don't oversell the relationship; let the work speak.
- Direct on logistics: what they receive, when, from where.
- Brief on lessons; the closeout report has the depth, this email is the headline.
- No em-dashes. No filler.
