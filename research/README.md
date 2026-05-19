# Research

Working notes, transcripts, and synthesis artifacts that feed the engagement's deliverables. Per `docs/project-memory/source-of-truth.md`: this folder lives in Git because the project context needs to be portable across teammates and AI agents.

## Layout

```
research/
├── meetings/                 status meetings, internal team meetings, steering committees
├── interviews/               discovery / research interviews with stakeholders or users
├── workshops/                facilitated multi-person sessions
└── README.md                 this file
```

The three subfolders are created lazily by `bash scripts/new-meeting.sh "<title>" [type]`. Type defaults to `meetings`; use `interviews` or `workshops` when applicable.

## File naming

`YYYY-MM-DD-{slug}.md`. Use the `meeting-notes-template.md` from `docs/project-memory/` as the structure (the `new-meeting.sh` script does this for you).

## Privacy

Most interview transcripts and meeting notes belong in Git per the source-of-truth doctrine. Exceptions, per `docs/project-memory/source-of-truth.md` "What does NOT go in Git, ever":

- If the engagement is contractually restricted from versioning specific stakeholders' raw quotes or PII, store the raw recording in Drive with locked sharing and put only the synthesized findings in Git.
- If a transcript contains medical, financial, or other regulated personal information, redact before committing.

When in doubt, redact and commit. The synthesis is what feeds deliverables; the raw transcript is rarely the artifact that needs to be versioned.

## What goes here vs. elsewhere

- **Per-meeting notes** (status, planning, retro): `research/meetings/`.
- **Discovery / research interviews with stakeholders or end users**: `research/interviews/`.
- **Multi-person facilitated sessions**: `research/workshops/`.
- **Decisions made in any of the above**: get extracted to `docs/project-memory/decisions.md` (and to an ADR in `docs/decision-records/` if architecturally significant). The original meeting note keeps the full context; `decisions.md` is the index.
- **Action items**: also extracted from the meeting note. Land in `docs/project-memory/phases-and-milestones.md` if dated, or in the team's task tracker.

The meeting note itself stays here as the durable record.
