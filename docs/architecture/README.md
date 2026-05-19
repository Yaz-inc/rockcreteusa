# Architecture

This folder is where the architecture diagrams and high-level system docs for Rockcrete USA Website Rebuild live. The narrative lives in `../project-memory/overview.md`. Decisions live in `../decision-records/`. This folder is for the **diagrams**.

## What goes here

For software / website / AI-implementation projects, expect:

- `system-context.md` or `system-context.png` - C4 Level 1 (the system in its environment).
- `containers.md` or `containers.png` - C4 Level 2 (the deployable units inside the system).
- `components.md` - C4 Level 3 (only the most-changed containers; do not draw every component).
- `data-flow.md` - how data moves between components for the most important user journeys.
- `sequence-{{INTERACTION_NAME}}.md` - sequence diagrams for tricky interactions (auth flow, payment flow, multi-step workflows).
- `deployment.md` - what runs where (VPS, cloud, edge).
- `data-model.md` or an ERD - tables, relationships, indexes.

For branding projects, this folder is usually empty or holds:

- `system-map.md` - touchpoint inventory.
- `brand-architecture.md` - sub-brand relationships, naming hierarchy.

## Format

Diagrams as code where possible:

- **Mermaid** for sequence and flow diagrams (renders natively in GitHub).
- **PlantUML** for C4 (the C4-PlantUML extension is the standard).
- **D2** if your team prefers.

For raster diagrams, save the source file alongside the image so future contributors can edit. Acceptable: `.drawio`, `.fig`, `.excalidraw`, `.svg`.

## Naming

Kebab-case ASCII per `../project-memory/naming-conventions.md`. Examples:

- `system-context.md`
- `auth-sequence.md`
- `er-diagram.svg`
- `er-diagram.drawio` (source)

## Maintenance

Diagrams go stale faster than text. The discipline:

1. When a containerization or topology change ships, update the diagram in the same PR.
2. When you read a diagram that is wrong, fix it in the same session you spotted the drift.
3. Date the diagram in its caption: "Last verified: 2026-05-06".

If a diagram has not been verified in 6 months, it is suspect. Read it skeptically.

## What does NOT go here

- Code-level UML (class diagrams). Read the code.
- Wireframes and UI screens. Those live in Figma; link from `../project-memory/context-index.md`.
- Decisions. Those live in `../decision-records/`.
