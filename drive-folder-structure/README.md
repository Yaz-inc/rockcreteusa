# Drive folder structure

The parallel Google Drive (or OneDrive, Box, SharePoint) folder structure for Rockcrete USA Website Rebuild. This is the **one-way mirror** of the Git repository for non-technical teammates plus a few large binaries that don't belong in Git.

## The source-of-truth rule (read this first)

**Git is canonical. Drive mirrors Git, never the reverse.** Per `docs/project-memory/source-of-truth.md`:

- The Git repo at `https://github.com/newmindsgroup/rockcreteusa-project-blueprint` holds everything except secrets.
- The Drive folder holds: a human-readable copy of `docs/project-memory/*.md` in `00 - Project Memory/*.MD`, plus large binaries (>50 MB) and contractually-restricted artifacts that can't be versioned.
- If a teammate edits a memory file in Drive, that change is **not yet in the project** until someone copies it back to Git, runs lint, and pushes.
- If Drive and Git disagree on a file's contents, **Git wins.** Re-mirror from Git.
- Drive is for human-readable redundancy and binary storage, not for parallel authoring of memory content.

This is the most important thing to internalize about Drive in this engagement. The rest of the folder structure follows.

## Why this exists

Most engagements have a Drive folder for contracts, slides, large PDFs, and other artifacts that don't belong in Git. Without a convention, those folders become a swamp. This structure mirrors the Git repo's ethos (numbered prefixes, clear ownership per folder) while allowing the comforts that Drive users expect (spaces, accents, Title Case).

## Top-level layout

Create the following six folders inside your project's Drive root:

```
rockcreteusa-website-project/
├── 00 - Project Memory/             AI context + team memory (start here)
├── 01 - Procurement and Contracts/  Active SOWs, change orders, historical proposals
├── 02 - Team/                       CVs, IDs, NDAs, profiles
├── 03 - Client Documents/           Client-supplied reference (never rename)
├── 04 - Ideation/                   Brainstorm, exploratory artifacts
└── 99 - Archive/                    Backups, superseded drafts
```

Numbered prefixes enforce visual sort order so the memory folder always opens first.

## How to use this folder

1. Create the six numbered subfolders inside your project's Drive root.
2. Copy each `*.template.md` file in this directory into the corresponding Drive subfolder, renaming to `README.md`.
3. Edit each Drive `README.md` to describe what actually lives in that subfolder.
4. Keep the numbering consistent. If you add a new top-level Drive folder, give it a number that fits the sort order (`05`, `06`, etc., reserving `99` for archive).
5. Mirror the Git `docs/project-memory/*.md` files into Drive `00 - Project Memory/*.MD` (SCREAMING_CASE). One-way: Git is canonical, Drive is the human-readable mirror. After every push to `main` that touches a memory file, refresh the Drive copy.

## Naming inside Drive

Allowed:

- Spanish/Latin accents and spaces.
- Title Case.
- ASCII hyphen `-` (U+002D).
- Numbered prefixes.
- Parentheses for clarifying suffixes (e.g. `Profile (English).docx`).

Forbidden anywhere in the Drive folder:

- En-dash `–`, em-dash `—`, curly quotes `' ' " "`.
- OS-reserved characters: `/ \ : * ? " < > |`.
- Leading or trailing whitespace.

If you find a file with a forbidden character, rename it on sight and log the rename in `docs/project-memory/session-log.md`.

## Optional folders

Some engagements need additional top-level Drive folders. If you add one, document it here:

- `05 - Blueprint Dashboard/` if the dashboard's working files (HTML, telemetry source data, deploy logs) live in Drive rather than Git. Common for engagements where the dashboard is edited frequently from Drive-mounted Cowork or Cursor sessions.
- `06 - Deliverables/` if Drive holds the polished PDFs/Word/slides delivered to the client (separate from the Git `deliverables/` tree which holds source markdown).
- `07 - Communications/` if the team archives client emails, kickoff materials, weekly updates.

Add them with the next available number; do not renumber existing folders.

## What does NOT go in Drive

- Source code → Git only.
- Secrets and credentials → a credentials manager. (Some teams keep a `server-credentials/` subfolder in Drive for VPS root passwords; if you do, keep it locked-down and **never** commit it to Git.)
- Auto-generated build outputs → Git CI artifacts or local builds.

## File templates in this folder

Each `*.template.md` is a starter README for one of the numbered Drive subfolders. They explain what belongs in each folder and what does not.

| Template file | For Drive folder |
|---|---|
| `00-project-memory.template.md` | `00 - Project Memory/` |
| `01-procurement-and-contracts.template.md` | `01 - Procurement and Contracts/` |
| `02-team.template.md` | `02 - Team/` |
| `03-client-documents.template.md` | `03 - Client Documents/` |
| `04-ideation.template.md` | `04 - Ideation/` |
| `99-archive.template.md` | `99 - Archive/` |

After copying into Drive, rename each to `README.md` (or `LEEME.md`, or your team's convention).
