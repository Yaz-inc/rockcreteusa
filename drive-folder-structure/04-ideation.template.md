# 04 - Ideation

Brainstorm artifacts, exploratory notes, and candidate-use-case inventories for Rockcrete USA Website Rebuild.

## What goes here

- Brainstorm documents (Google Docs, Notion exports, mind maps).
- Candidate use-case inventories.
- Reference moodboards and inspiration sets.
- Workshop outputs (whiteboard photos, sticky-note exports).
- Research that hasn't yet been formalized into a deliverable.
- Half-baked ideas worth keeping.

## What does NOT go here

- Formal deliverables → Git repo's `deliverables/` tree.
- Decisions made → `docs/project-memory/decisions.md`.
- Decisions made and architecturally significant → `docs/decision-records/`.
- Open questions blocking work → `docs/project-memory/status.md` (numbered list).

## Suggested subfolders

```
04 - Ideation/
├── Brainstorms/
├── Use Cases/
├── Moodboards/
├── Workshop Outputs/
└── Reference Material/
```

## Lifecycle

Items here are typically intermediate. They graduate in one of three directions:

1. **Into a deliverable** in the Git repo, when the idea matures and ships.
2. **Into a decision** in `docs/project-memory/decisions.md` (or an ADR), when the idea is "this is how we'll do it."
3. **Into `99 - Archive/`** when the idea is superseded or proven not viable.

If an item has been here for longer than 90 days without graduating, it's a candidate for archive. Don't let the folder become a graveyard.

## Naming

Less strict than other folders here, since these are working drafts. Still avoid the hard-ban characters (en-dash, em-dash, curly quotes, OS-reserved characters). ISO dates in filenames are encouraged so the chronology is obvious:

- `Brainstorm-{{TOPIC}}-2026-05-06.gdoc`
- `Use-Cases-Round-1-2026-05-08.docx`
