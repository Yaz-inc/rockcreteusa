# 99 - Archive

Backups, redundant zips, and superseded drafts for Rockcrete USA Website Rebuild. Nothing here should be referenced from active work.

## What goes here

- ZIP backups of large folders.
- Superseded drafts (proposals, contracts, designs, briefs that lost out to a later version).
- Per-category zip bundles (often redundant with their unzipped originals; keep here as cold storage).
- Pre-rename backups when a sweeping rename happened (e.g. `pre-rename-backups/`).
- One-off captures (Google Docs exported to PDF, web pages saved as HTML).

## What does NOT go here

- Anything that an active piece of work still references → keep it in its source folder until the reference is gone.
- Files that are "old but might be useful" → move only when you are sure they will not be referenced again.
- Personal IDs, credentials, secrets → keep those in the appropriate locked subfolder, not archive.

## Why this is `99`

The numbered prefix `99` makes archive sort to the bottom in any folder listing. People who navigate by eye see `00 - Project Memory/` first and `99 - Archive/` last, in that order, regardless of language or alphabet.

## Naming

Use ISO dates in filenames so the archive's chronology is unambiguous. Use ASCII hyphens (no en-dash, em-dash, curly quotes, OS-reserved characters):

- `Pre-Restructure-Backup-2026-04-21.zip`
- `Old-Brief-Draft-v3-2026-03-15.docx`
- `Superseded-Proposal-FOTESIR-Only-2026-01-10.pdf`

If a file has a hard-banned character (en-dash, em-dash, curly quotes), rename before archiving. Archive is a read-only zone but renames here still need to follow the rules.

## Pruning

The archive should grow but not unbounded. Once a year, prune anything that:

1. Has not been referenced in the past 12 months.
2. Has a clear successor that ships everything the archived item carried.
3. Is not legally or contractually required to retain.

For legal-or-contractually-required artifacts (signed contracts, NDAs, audit trails), create a separate `99 - Archive/Legal Hold/` subfolder and exempt from pruning.

## Multi-format archives

If a deliverable shipped in PDF, Word, and slides, keep all three together when archiving:

```
99 - Archive/
└── Final-Brief-2026-05-06/
    ├── Brief-Final.docx
    ├── Brief-Final.pdf
    └── Brief-Final.pptx
```

This makes it easy to recover the full set if a future engagement asks.
