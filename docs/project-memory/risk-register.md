# Risk register, Rockcrete USA Website Rebuild

Every credible risk that could derail the project, with probability, impact, mitigation, and owner. Risks are not the same as open questions: a risk is something that could go wrong; an open question is something we don't know yet. Open questions live in `status.md`.

**Last updated:** 2026-05-15

## Conventions

Each risk has:

- **ID:** `R-{phase prefix}-{NN}`. Phase prefixes: `D` discovery, `F` foundation, `E` expansion, `H` handover, `O` operational (cuts across phases).
- **Probability:** `low` (~10%) / `medium` (~30%) / `high` (~60%).
- **Impact:** `low` (recoverable in a sprint) / `medium` (delays a phase) / `high` (kills a deliverable or the engagement).
- **Score:** P × I where each maps to 1/2/3. Score 1-2 = low priority, 3-4 = medium, 6-9 = high.
- **Status:** `open`, `mitigating`, `accepted` (consciously chose to accept), `materialized` (it happened), `closed` (the trigger has passed).
- **Owner:** the person responsible for tracking and mitigating.
- **Mitigation:** what reduces the probability or the impact.
- **Trigger:** what would tell us the risk is starting to materialize.

## Active risks

### R-D-01: {{RISK_1_TITLE}}

- **Phase:** Discovery
- **Probability / Impact / Score:** {{R1_P}} / {{R1_I}} / {{R1_SCORE}}
- **Status:** open
- **Owner:** {{R1_OWNER}}
- **Description:** {{R1_DESCRIPTION}}
- **Mitigation:** {{R1_MITIGATION}}
- **Trigger:** {{R1_TRIGGER}}
- **Next review:** {{R1_REVIEW_DATE}}

### R-D-02: {{RISK_2_TITLE}}

(same structure)

### R-F-01: {{RISK_3_TITLE}}

(same structure)

### R-O-01: {{RISK_4_TITLE}}

(same structure; operational risk that cuts across phases)

## Common risks by project type

If you don't know what to put here yet, start with the typical risks for your project type and refine.

### Software / app development

- Engineering-capacity gap (UX-heavy team underestimating backend, QA, DevOps).
- Data-model churn forcing late migrations.
- Third-party API "easy in demo, hard in production".
- Performance assumptions without a load test.
- Compliance discovery surfacing mid-build.

### Branding / identity

- Stakeholder spread blocking decisions.
- Concept-stage scope creep ("one more direction").
- Late legal / trademark review.
- Font licensing edge cases.
- Asset-format gaps for unexpected client tools.

### Website / marketing

- Copy as the long pole.
- Image rights and unlicensed photos.
- CMS choice churn.
- Performance regressions late in QA.
- Analytics misconfiguration.

### AI implementation

- Eval set drift.
- Single-provider outage with no fallback.
- Cost explosion from a retry loop.
- Prompt injection.
- Hallucination at the seam (correct in isolation, wrong in flow).
- "Demo plateau" (prompt-tuning stops paying).

## Risk matrix view

Sorted by score (P × I), high first. Use this to focus your weekly review on what matters.

| Score | ID | Title | Status | Owner | Next review |
|---|---|---|---|---|---|
| 9 | R-?-?? | (high P, high I) | | | |
| 6 | R-?-?? | (high P, medium I or vv) | | | |
| 4 | R-?-?? | | | | |
| 3 | R-?-?? | | | | |
| 2 | R-?-?? | | | | |
| 1 | R-?-?? | | | | |

## Materialized risks

When a risk happens, do not delete it. Move it here, log what actually occurred, what it cost, and what the corrective action was. The retro reads this section.

### R-?-??: {{MATERIALIZED_RISK_TITLE}}

- **Date materialized:** {{DATE}}
- **What happened:** {{WHAT_HAPPENED}}
- **Impact (actual):** {{ACTUAL_IMPACT}}
- **Corrective action:** {{CORRECTIVE_ACTION}}
- **Lesson:** {{LESSON}}

## Closed risks

Risks whose trigger has passed without materializing. Keep them; the historical record matters.

### R-?-??: {{CLOSED_RISK_TITLE}}

- **Closed date:** {{CLOSE_DATE}}
- **Why closed:** {{WHY_CLOSED}}

## Maintenance

- **Weekly:** review every `open` and `mitigating` risk. Update probability if it shifted. Log the review in `session-log.md`.
- **On materialization:** move to "Materialized risks" the same day. Add a `decisions.md` entry if the corrective action is non-trivial.
- **On phase end:** sweep through and close anything whose trigger has passed.
- **New risks:** add as you find them, do not batch. A risk you noticed but did not log will bite you.
