# Budget and payments, Rockcrete USA Website Rebuild

Money in (what the client / funder pays), money out (what the engagement costs to deliver), and milestones that release each tranche.

**Last updated:** 2026-05-15

## Total contract value

- **Total contract:** {{BUDGET}} {{CURRENCY}}
- **Period:** 2026-05-15 to 2026-10-26
- **Payer:** {{PAYER_NAME}}
- **Payee:** {{PAYEE_NAME}}
- **Payment terms:** {{PAYMENT_TERMS}} (e.g. "Net 30 from invoice date" or "5 business days from milestone acceptance")

## Payment milestones

Each tranche is tied to a deliverable acceptance. The "Status" column is the engagement's heartbeat.

| # | % | Amount | Trigger (deliverable accepted) | Target date | Invoice # | Status | Paid date |
|---|---|---|---|---|---|---|---|
| 1 | {{P1_PCT}}% | {{P1_AMT}} | {{P1_TRIGGER}} | {{P1_DATE}} |  | not yet earned |  |
| 2 | {{P2_PCT}}% | {{P2_AMT}} | {{P2_TRIGGER}} | {{P2_DATE}} |  | not yet earned |  |
| 3 | {{P3_PCT}}% | {{P3_AMT}} | {{P3_TRIGGER}} | {{P3_DATE}} |  | not yet earned |  |
| 4 | {{P4_PCT}}% | {{P4_AMT}} | {{P4_TRIGGER}} | {{P4_DATE}} |  | not yet earned |  |
| **Total** | **100%** | **{{BUDGET}}** | | | | | |

Status values: `not yet earned`, `earned, awaiting invoice`, `invoiced YYYY-MM-DD`, `paid YYYY-MM-DD`, `disputed`, `late`.

## Cost side

Where the budget goes. Categories match the dashboard's `tasks.json` so the live cost tracker stays in sync.

| Category | Allocation | Spent to date | Remaining | Notes |
|---|---|---|---|---|
| Analysis & architecture | {{CAT_AA_ALLOC}} |  | | |
| UX & design | {{CAT_UX_ALLOC}} |  | | |
| Backend development | {{CAT_BE_ALLOC}} |  | | |
| Frontend development | {{CAT_FE_ALLOC}} |  | | |
| Mobile development | {{CAT_M_ALLOC}} |  | | |
| DevOps & infra | {{CAT_DO_ALLOC}} |  | | |
| QA & testing | {{CAT_QA_ALLOC}} |  | | |
| Documentation | {{CAT_D_ALLOC}} |  | | |
| Change management & training | {{CAT_CM_ALLOC}} |  | | |
| Project management | {{CAT_PM_ALLOC}} |  | | |
| AI / tooling cost | {{CAT_AI_ALLOC}} |  | | |
| Subcontractor & external | {{CAT_S_ALLOC}} |  | | |
| Reserve / contingency | {{CAT_R_ALLOC}} |  | | |
| **Total** | **{{BUDGET}}** | | | |

For branding / website projects, swap the categories for: `Discovery & research`, `Concept`, `Refinement`, `Production & delivery`, `Project management`, `Reserve`.

## AI tooling costs

The dashboard's Internal Panel reads `blueprint-dashboard/telemetry/panel-interno-telemetry.json` and shows live AI session costs. To keep this section current, refresh the telemetry JSON after every meaningful Cowork session:

```bash
python3 blueprint-dashboard/telemetry/extract-telemetry.py /path/to/session.jsonl
```

Then summarize cumulative cost here at the end of each phase:

| Phase | Tokens used | AI cost (USD) | Equivalent human cost (10x) | Notes |
|---|---|---|---|---|
| Phase 1 | | | | |
| Phase 2 | | | | |

## Invoice log

Append every invoice. Do not delete on payment; mark it paid.

| # | Date | Amount | For (milestone / deliverable) | Sent to | PO # | Status |
|---|---|---|---|---|---|---|

## Disputes / late payments

If an invoice slips its terms, log here with date, amount, who is chasing it, and what the resolution looked like. Helps avoid repeating the pattern and gives ammunition for retrospective decisions on payment terms.

## Maintenance

- After each milestone is accepted, update the corresponding row in "Payment milestones" the same day. Move status to `earned, awaiting invoice`.
- After each invoice goes out, paste the PDF / link to it in `01 - Procurement and Contracts/Invoices/` (Drive) and update status here to `invoiced YYYY-MM-DD`.
- After payment lands, update status to `paid YYYY-MM-DD` and reconcile to the cost-side table if a category line moved.
- Update the AI tooling row at the end of each phase, not in real time. Sub-daily noise isn't useful here.
