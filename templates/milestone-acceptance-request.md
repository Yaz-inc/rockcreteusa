# Milestone acceptance request template

Send when a deliverable is ready and the client needs to formally accept it. Triggers a payment milestone in many engagements, so the email itself is a contractual artifact: keep a copy.

Subject line:

```
Rockcrete USA Website Rebuild: requesting acceptance of {{DELIVERABLE_TITLE}}
```

Body:

```
Hi {{APPROVER_NAME}},

The {{DELIVERABLE_TITLE}} ({{DELIVERABLE_ID}}, due {{DUE_DATE}}) is complete and ready for your formal acceptance.

WHAT'S BEING ACCEPTED
{{ONE_PARAGRAPH_DESCRIPTION}}

WHERE IT LIVES
- Primary: {{PRIMARY_LOCATION}} (e.g. the deliverable file in the repo at https://github.com/newmindsgroup/rockcreteusa-project-blueprint/blob/main/deliverables/{{DELIVERABLE_FILE}})
- Supporting: {{SUPPORTING_LOCATION}} (e.g. the live dashboard at https://rockcreteusa.projectizer.ai/, the PDF at {{DRIVE_PATH}})

ACCEPTANCE CRITERIA (from the SOW / kickoff)
The criteria we agreed to are listed in the deliverable file. Highlights:
- {{CRITERION_1}}: ✓ met
- {{CRITERION_2}}: ✓ met
- {{CRITERION_3}}: ✓ met

(If any criterion is partially met, list it here with a one-sentence explanation and the proposed remediation. Don't hide partial completion.)

REVIEW WINDOW
Please respond by {{REVIEW_DEADLINE}} (typically 5 to 10 business days) with one of:
- Accepted as-is.
- Accepted with the changes listed below, to be incorporated before {{REVISION_DEADLINE}}.
- Not accepted: please describe why.

If I don't hear back by {{REVIEW_DEADLINE}}, I'll follow up; an extended silence isn't acceptance and we'll work together to unblock.

PAYMENT MILESTONE
{{IF_APPLICABLE}}: Acceptance of this deliverable triggers payment milestone {{MILESTONE_NUMBER}} ({{PERCENT}}% of total, {{AMOUNT}}). I'll send the invoice within 24 hours of your written acceptance.

Thanks,
Daniel Gonell
info@newmindsgroup.com · {{PROJECT_LEAD_PHONE}}
```

## Acceptance evidence to capture

After the approver replies, paste the evidence in the deliverable file's "Sign-off" section:

- The full reply email (screenshot or quoted text with date).
- The approver's name and role.
- The acceptance date.
- Any conditions attached.

Without explicit written acceptance, the deliverable is not accepted, regardless of what was said verbally.

## Variants

### If the deliverable is a live dashboard, not a document

Adapt the "Where it lives" section:

```
WHERE IT LIVES
- Live dashboard: https://rockcreteusa.projectizer.ai/
- Snapshot PDF (for reference): {{PDF_PATH}}
- Source: https://github.com/newmindsgroup/rockcreteusa-project-blueprint/blob/main/blueprint-dashboard/index.html
```

### If acceptance has multiple approvers

```
APPROVERS
- {{APPROVER_1}}: {{ROLE_1}}
- {{APPROVER_2}}: {{ROLE_2}}

Acceptance requires written confirmation from both. {{APPROVER_2}} is copied on this email.
```

### If the deliverable was revised based on feedback

Add before "Where it lives":

```
WHAT CHANGED SINCE YOUR LAST REVIEW
- {{CHANGE_1}}
- {{CHANGE_2}}
```

## After receiving acceptance

1. Update the deliverable file's status to "accepted".
2. Paste the acceptance evidence in the file's "Sign-off" section.
3. Update `phases-and-milestones.md`: change the milestone status to "accepted".
4. Update `budget-and-payments.md`: change the milestone status to `earned, awaiting invoice`.
5. Send the invoice (if applicable).
6. Append `decisions.md`: "{{DELIVERABLE_TITLE}} accepted on {{DATE}} by {{APPROVER}}."
7. Append `session-log.md`: short entry describing the acceptance.
8. Commit and push.

## What if the approver pushes back

If they don't accept:

1. Don't argue in email. Schedule a 15-30 minute call.
2. Capture their specific objections in `meeting-notes-template.md` format.
3. Decide together: is this a revision request (within the scope you committed to), a change order (out of scope, needs a separate agreement), or a different problem?
4. Document the path forward in `decisions.md`.

Never let an unsigned deliverable linger. Either get it accepted with explicit changes, or escalate to a change order, or document a path to resolution. Ambiguity here costs money and trust.
