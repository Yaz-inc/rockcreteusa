# Decision records (ADRs)

Architecture Decision Records for Rockcrete USA Website Rebuild. One ADR per architecturally significant decision.

## What goes here vs. in `decisions.md`

- **`docs/project-memory/decisions.md`**: every meaningful decision, captured in 5 to 15 lines. Append-only.
- **`docs/decision-records/NNNN-title.md`** (this folder): the **architecturally significant** decisions, captured in full ADR format with context, options, decision, consequences. Linked from `decisions.md`.

A decision is "architecturally significant" if it changes:

- The shape of the system (which services exist, how they communicate).
- The data model in a way that requires migration.
- A non-negotiable constraint (security, compliance, deployment target).
- The team's process in a way that affects more than one person.
- Something that would surprise a new teammate reading the code six months later.

If a decision passes any of those bars, it deserves a full ADR.

## Naming

`NNNN-short-title.md`, where `NNNN` is a zero-padded sequence number starting at `0001`. Use `scripts/new-adr.sh` to scaffold the next one:

```bash
bash scripts/new-adr.sh "use postgres with postgis for parcel geometry"
```

That creates `0007-use-postgres-with-postgis-for-parcel-geometry.md` (next available number) prefilled from `0000-template.md`.

## Format

See `0000-template.md`. Each ADR has:

1. **Title and number**.
2. **Status** (Proposed / Accepted / Deprecated / Superseded by NNNN).
3. **Context** (the constraint or question that drove the decision).
4. **Options** (at least two, with pros/cons each).
5. **Decision** (what was chosen).
6. **Consequences** (what becomes easier and harder because of this).
7. **Date** (ISO-8601).
8. **Authors / approvers**.

## Lifecycle

- **Proposed**: draft is open in a PR; not yet decided.
- **Accepted**: decision is made; team is acting on it.
- **Deprecated**: decision is no longer the right call; new work should not follow it. Add a `Deprecated by` line at top.
- **Superseded by**: replaced by a later ADR. Add a `Superseded by ADR-NNNN` line at top.

ADRs are append-only history. **Never edit a past ADR's substance.** If a decision changes, write a new ADR that supersedes the old one.

## How to read this folder

`ls docs/decision-records/` shows the chronological list of accepted decisions. To understand why the architecture is what it is, read them in order. The numbers match the order they were accepted, not the order of importance, so do not skim by number alone.

## Linking from `decisions.md`

Every ADR should be linked from `docs/project-memory/decisions.md` with a short summary. The ADR is the long form; the entry in `decisions.md` is the index.
