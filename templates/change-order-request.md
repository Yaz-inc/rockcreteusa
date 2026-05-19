# Change order request template

Send when the client asks for something outside the agreed scope. Documents the scope change, the cost / time impact, and asks for written approval before the team picks up the new work.

Skipping this step is the most common way a fixed-bid engagement loses money. Document, scope, price, approve. Then do the work.

Subject line:

```
Rockcrete USA Website Rebuild: change order request for {{CHANGE_TITLE}}
```

Body:

```
Hi {{APPROVER_NAME}},

Following our conversation on {{REQUEST_DATE}}, you asked us to {{REQUESTED_CHANGE_DESCRIPTION}}.

This sits outside the scope agreed in the {{CONTRACT_REFERENCE}} signed on {{CONTRACT_DATE}}. Before we pick it up, I'd like to document the change and confirm we're aligned on the cost and time impact.

WHAT'S CHANGING
{{ONE_PARAGRAPH_DESCRIPTION_OF_THE_CHANGE}}

WHAT'S NOT CHANGING
Everything else in the SOW remains as agreed. The deliverables already committed in {{PHASE_NAME}} are not affected unless explicitly noted below.

IMPACT
- **Cost:** {{COST_IMPACT}} (e.g. "+{{AMOUNT}} {{CURRENCY}}, due upon acceptance of the change order")
- **Schedule:** {{SCHEDULE_IMPACT}} (e.g. "extends {{MILESTONE_NAME}} by {{DAYS}} days, new target {{NEW_DATE}}")
- **Team:** {{TEAM_IMPACT}} (e.g. "no change" / "requires additional {{SKILL}} capacity")
- **Other deliverables:** {{OTHER_IMPACT}} (e.g. "none" / "delays {{DELIVERABLE_X}} by {{DAYS}}")

WHAT WE'RE ASKING FOR
1. Your written approval of the impact above.
2. Confirmation of the funding source (same engagement budget / contingency / separate authorization).
3. (If applicable) An amended SOW signed by both sides.

If approved, we'll update `phases-and-milestones.md`, `budget-and-payments.md`, and start work within {{LEAD_TIME}}.

If you'd rather not proceed: that's fine. We continue with the original scope and the deliverable list as committed.

ALTERNATIVES YOU MIGHT CONSIDER
{{ALTERNATIVES_PARAGRAPH}}: e.g. "Option A: full change order as scoped above ({{AMOUNT}}, {{DAYS}} days). Option B: a lighter version that delivers {{SUBSET}} for half the cost. Option C: defer to a follow-on engagement after {{CURRENT_ENGAGEMENT}} closes."

Happy to discuss live if helpful.

Best,
Daniel Gonell
info@newmindsgroup.com · {{PROJECT_LEAD_PHONE}}
```

## When to skip the change order

The default is NOT to skip. But three situations where a change order is overkill:

1. The change costs zero additional time and money (rare, but real for small clarifications).
2. The change is explicitly inside the contracted contingency line (some SOWs allocate "discretionary" hours for small in-flight adjustments).
3. The change is correcting a defect in a delivered artifact (that's warranty work, not change-order work).

In all three cases, document the conversation in `decisions.md` even though you're not sending a formal change order.

## After sending

1. Save the email as `deliverables/NNNN-change-order-request-{{REQUEST_DATE}}.md`.
2. Update `risk-register.md` if the change introduces a new risk.
3. Append `session-log.md` with the request and the rationale.
4. Wait for written approval before doing anything.
5. On approval:
   - Update the relevant deliverable file with the new scope.
   - Update `phases-and-milestones.md` with the schedule change.
   - Update `budget-and-payments.md` with the cost change.
   - Append `decisions.md` with the approval and its terms.
   - Commit and push.
6. On rejection:
   - Append `decisions.md` with the rejection and the original scope confirmed.
   - Continue with the unchanged plan.

## Tone

- Neutral and procedural. This is not a sales email.
- Direct on impact. Don't bury the cost.
- Always offer an alternative. Even "do nothing" is an alternative. Choice respects the client.
- No em-dashes.

## What if the client refuses to sign a change order but insists on the new work

This is the situation the template exists to prevent. If you're already there:

1. Document the conversation in writing. Send a "summary of our conversation" email.
2. Schedule a call with the decision-maker.
3. Decide internally: do the work without payment (only if the relationship value justifies it, and document explicitly), refuse the work (last resort), or escalate to the contract's dispute-resolution clause.
4. Add a `lessons-learned.md` entry. This pattern will recur if you don't.

The template's job is to make this conversation procedural before it becomes confrontational.
