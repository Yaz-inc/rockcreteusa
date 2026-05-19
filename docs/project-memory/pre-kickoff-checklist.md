# Pre-kickoff checklist, Rockcrete USA Website Rebuild

The 90-minute (or so) dress rehearsal the project lead runs before the kickoff meeting. Catches the failure modes that turn a smooth kickoff into a clumsy one. If any item is RED at T-30 minutes from the meeting, you're not ready.

**Kickoff date:** {{KICKOFF_DATE}} at {{KICKOFF_TIME}} ({{KICKOFF_TZ}})
**Run rehearsal by:** {{REHEARSAL_DEADLINE}} (typically 1 to 2 days before kickoff)

## How to use

Work top to bottom. Each block has a specific failure mode it prevents. Mark each item once tested live:

- ✅ verified working as expected
- ⚠️ has an issue; documented in "Plan B" below
- ❌ broken; must fix before kickoff
- ⚪ not applicable

## A. Dashboard technical

- [ ] Live dashboard URL loads in Chrome, Safari, Firefox, mobile Safari, mobile Chrome.
- [ ] HTTPS works (no certificate warnings).
- [ ] Both light and dark themes render cleanly.
- [ ] The bilingual toggle works (if bilingual).
- [ ] Admin escalation (via URL param `?admin=7c63ef71e1ba66344ddfcdf1`) works.
- [ ] Guest view (after clearing localStorage) hides all admin-only content.
- [ ] The dashboard renders at the projector's resolution (1080p typical, 4K possible).
- [ ] Print stylesheet works if you intend to hand out a PDF.
- [ ] Telemetry shows real data (not example fixtures).
- [ ] All navigation links work; no 404s.

**Plan B if dashboard fails:** {{DASHBOARD_PLAN_B}} (e.g. "use printed PDF handout from Drive at <path>").

## B. Captures and live data

- [ ] The dashboard's "Inicio" / landing page reflects the project's actual current state.
- [ ] Phases and milestones show real dates, not placeholders.
- [ ] Stakeholder register matches the actual confirmed attendee list.
- [ ] Risk register reflects current open risks.
- [ ] No `{{PLACEHOLDER}}` strings visible anywhere on the live dashboard.
- [ ] No `<!-- TODO -->` comments visible in rendered content.

## C. Presentation mode

If you'll demo the dashboard live during kickoff:

- [ ] Test "Presentar" / presentation mode (fullscreen).
- [ ] Test arrow-key navigation between sections.
- [ ] Test escape exits fullscreen cleanly.
- [ ] Verify the laptop has the right cable / adapter for the room's projector.
- [ ] Verify the laptop's display sleep is disabled during the meeting.
- [ ] If projecting from a tablet, verify the tablet doesn't auto-rotate or sleep.

## D. PDF handout (if you print one)

- [ ] PDF generated from the current dashboard state via the print stylesheet.
- [ ] PDF saved to `01 - Procurement and Contracts/Kickoff/handout-{{KICKOFF_DATE}}.pdf` in Drive.
- [ ] Printed copies for all attendees + 2-3 spares.
- [ ] Cover page / table of contents legible.

## E. Communication

- [ ] Calendar invite confirmed with all Tier 1 stakeholders (per `stakeholder-register.md`).
- [ ] Meeting location / video link in the invite.
- [ ] Pre-read material sent ahead (24-48 hours before).
- [ ] Phone number to reach the project lead if anyone's running late.

## F. Logistics

- [ ] Room booked (if in-person).
- [ ] Video conferencing tested if any attendee is remote.
- [ ] Recording permission collected from all attendees (if recording).
- [ ] Coffee / water / refreshments (if in-person).
- [ ] Whiteboard / markers available (if you'll sketch live).
- [ ] Power outlets verified.
- [ ] Wi-Fi password handy.

## G. Key facts to know cold

Don't fumble these in front of the client.

- [ ] Total project value: {{BUDGET}}
- [ ] Start / end dates: 2026-05-15 to 2026-10-26
- [ ] Number of phases: {{PHASE_COUNT}}
- [ ] First milestone date: {{FIRST_MILESTONE_DATE}}
- [ ] Working language(s): en (and en if bilingual)
- [ ] Hosting target: vercel
- [ ] Live dashboard URL (memorized): https://rockcreteusa.projectizer.ai/
- [ ] Names of the team and their roles (no peeking at notes).
- [ ] Top 3 risks and their mitigations.

## H. Mentality

- [ ] Slept well the night before. Caffeine but not too much.
- [ ] Read the most recent 3 entries in `session-log.md`.
- [ ] Re-read `kickoff-agenda.md` once.
- [ ] Reviewed `client-intake.md` to know which questions are still red.
- [ ] Prepared to say "I don't know, let me come back to you on that" when asked something you actually don't know.

## I. Final pre-meeting check (T-30 minutes)

Last sweep, 30 minutes before the meeting starts:

- [ ] Dashboard loads on the projection device.
- [ ] Admin view loads on your tablet / speaker device.
- [ ] Microphone tested.
- [ ] Notebook + pen ready (digital backup).
- [ ] Phone on silent.
- [ ] Slack / Teams / WhatsApp notifications muted (no incoming pings during the demo).
- [ ] Browser tabs irrelevant to the meeting are closed.

## Plan B section

For every ⚠️ or ❌ above, document the workaround here. Game-time failure modes the project lead reacts to without panicking.

| Failure | Likelihood | Workaround |
|---|---|---|
| Projector won't connect | low | Use printed PDF handout, walk through verbally. |
| Wi-Fi is down | medium | Pre-cached dashboard PDF on local laptop; walk through that. |
| Key attendee can't make it | medium | Note their absence in `session-log.md`; capture their input separately within 48 hours. |
| Client wants to discuss something off-agenda | high | Acknowledge, note it for follow-up, return to agenda. |
| Demo crashes mid-meeting | low | Apologize briefly, switch to printed handout, continue. |

## After the rehearsal

When the rehearsal completes, paste a one-paragraph summary into `session-log.md`:

> **{{REHEARSAL_DATE}} (Kickoff dress rehearsal)** · {{TOOL_USED}} · {{REHEARSAL_RUNNER}}
> Triggered by: pre-kickoff readiness check.
> What was tested: dashboard tech, captures, presentation mode, communication, logistics.
> Issues found: {{ISSUES_FOUND}}.
> Mitigations in place: see "Plan B" in `pre-kickoff-checklist.md`.
> Ready for kickoff on {{KICKOFF_DATE}}: yes / no.

## Maintenance

This file is reusable for every meaningful client-facing milestone meeting, not only kickoff. Copy it to:

- `docs/project-memory/pre-{{phase}}-review-checklist.md` for each phase-gate review.
- `docs/project-memory/pre-closeout-checklist.md` for the engagement closeout meeting.

Adapt the items to the specific meeting's stakes.
