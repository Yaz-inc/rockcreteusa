# Deliverables, Rockcrete USA Website Rebuild

This folder holds one MD file per formally tracked deliverable. Each file is a structured spec: what the deliverable is, who owns it, the table of contents, the source material that feeds it, and the sign-off log.

The phase / milestone tracker in `docs/project-memory/phases-and-milestones.md` points at these files. The dashboard's Internal Panel can also link to them.

## Why per-deliverable files

A deliverable is not a single document or a single feature. It is a contract: a clearly bounded thing the engagement is committed to producing, that the client signs off on, that triggers a payment milestone. Putting each one in its own file means:

- The current state of every deliverable is visible at a glance.
- The TOC is checked into Git so it stops drifting from the document the team is actually writing.
- Sign-off acceptance evidence (email screenshot, PDF) lives with the deliverable.
- A new teammate or AI session can read one file and understand exactly what is being shipped, when, by whom, and what it depends on.

## File naming

`NNNN-kebab-slug.md` where `NNNN` is the deliverable's sequence number (zero-padded to four digits) and `kebab-slug` is a short identifier.

Examples:

- `0001-stakeholder-map.md`
- `0002-functional-spec.md`
- `0003-architecture-c4.md`
- `0010-mvp-launch.md`

The sequence number is global across the project (not per phase). New deliverable goes at `NNNN+1`.

To scaffold a new one:

```bash
bash scripts/new-deliverable.sh "stakeholder map"
```

That copies `0000-template.md`, increments the next number, and pre-fills the title.

## Status flow

```
draft -> in progress -> ready for review -> accepted
                                          |
                                          +-> revision requested -> in progress -> ...
```

- **draft**: file exists, sections are stubbed, work has not started in earnest.
- **in progress**: someone is actively writing it.
- **ready for review**: shipped to the reviewer / client; awaiting sign-off.
- **accepted**: client signed off in writing. Acceptance evidence is linked in the file. Payment milestone (if applicable) is now earned.
- **revision requested**: client returned with feedback; back to in progress.

Update the status at the top of the deliverable file every time it moves.

## Where the writing actually lives

Two patterns are common:

1. **The deliverable IS this file.** For deliverables that are themselves markdown (briefs, specs, ADRs, research summaries, runbooks). The `<!-- BODY -->` section in the template is where the actual content goes.
2. **The deliverable lives elsewhere; this file points to it.** For deliverables that are slide decks, working software, designs in Figma, or PDFs in Drive. The TOC section becomes a one-line "the deliverable lives at: ..." pointer, and the rest of the file is metadata + sign-off log.

Pick the pattern per deliverable and document the choice in the file's "Sources" section.

## Acceptance evidence

When a deliverable is accepted, paste evidence at the bottom of the file:

- Screenshot of the approval email, or
- Link to a Drive PDF with the signed acceptance, or
- A quote from the meeting transcript with date and attendee list.

Do not just write "accepted on YYYY-MM-DD". A future audit or retrospective needs proof.

## Maintenance

- One file per deliverable. Do not bundle two deliverables into one file even if they ship together.
- When status changes, update the file and update the corresponding row in `docs/project-memory/phases-and-milestones.md`.
- When a deliverable is descoped, change status to `cancelled` and add a note. Do not delete the file.
- If a deliverable is added mid-engagement, scaffold a file for it and document the addition in `docs/project-memory/decisions.md`.
