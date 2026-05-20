# Project Blueprint Template

A reusable, self-contained dashboard template for managing professional services and consulting engagements. Designed to give clients, funders, and consultants one trustworthy window into the project they are participating in, and to be re-skinned for any future engagement in minutes, not days.

## What this template provides

- **A single-file HTML dashboard**, the production artifact. No build step, no framework, no dependencies beyond two CDN scripts (Tailwind + Lucide). Renders identically wherever a browser opens it.
- **A reusable design system** named *Foundation*. Generic, trustworthy slate-blue palette. Inter for body, Source Serif 4 for editorial headlines. Light + dark + auto theme. WCAG 2.1 AA compliant.
- **A complete bilingual scaffolding** (Spanish / English by default), every text node carries `data-es` / `data-en` and a single toggle swaps everything.
- **A real-data telemetry pipeline** that extracts AI session data (time, tokens, cost) from Cowork transcripts and renders it as live dashboards. Includes the human-vs-AI cost comparison view.
- **A full task and milestone tracking system** with time entries, AI cost attribution, expense logging, and milestone roll-ups, all in plain JSON, no database.
- **A modal/dialog system** for in-app prompts that respects the design language (no browser-default `prompt()`/`alert()`).
- **Role-gated views**, client-facing screens vs. consultant/admin-only Internal Panel.
- **Mobile-first responsive layout** with smooth drawer navigation.

## Why it exists

Every consulting engagement needs a place where the client, the funder, and the consulting team can see the same project state at the same time. Most teams cobble this together each engagement: a Notion page, a Trello board, an email thread, a Figma file. None of those are auditable, none survive the engagement, and none demonstrate that the work was done with discipline.

This template solves the problem once and lets every future engagement start at the finish line.

## What's in this folder

```
project-blueprint-template/
├── README.md                          (this file)
├── INSTALL.md                         step-by-step bootstrap for a new client engagement
├── ARCHITECTURE.md                    system architecture, data flow, design rationale
├── CHANGELOG.md                       version history of the template itself
├── docs/
│   ├── design-system.md              the Foundation visual system spec
│   ├── theme-system.md               light / dark / auto + per-client re-skinning
│   ├── bilingual.md                  the i18n pattern and how to extend it
│   ├── telemetry.md                  AI session-data extraction pipeline
│   ├── task-tracking.md              tasks, milestones, time entries, attribution
│   ├── auth-and-roles.md             role gating model (client vs. consultant)
│   ├── modal-system.md               the reusable dialog component
│   ├── accessibility.md              WCAG 2.1 AA approach + test checklist
│   └── deployment.md                 hosting, server, sync protocol
├── dashboard/
│   ├── index.html                    the dashboard itself, the production artifact
│   └── telemetry/
│       ├── extract-telemetry.py      JSONL → telemetry JSON extraction script
│       ├── panel-interno-telemetry.example.json
│       ├── tasks.example.json
│       └── README.md                 telemetry folder usage notes
└── customizations/
    └── README.md                     examples of how to re-skin per-client
```

## How to start a new project from this template

The short version: copy this folder, edit the placeholders, change the brand color, you're done.

The long version is in [INSTALL.md](INSTALL.md).

## Design philosophy

Five principles drove every decision in this template:

1. **No build step.** A consultant on a client laptop should be able to open `index.html` directly and see the dashboard. No `npm install`, no transpilation, no toolchain. The artifact is the source.
2. **Re-skinnable, not rewritten.** Every visual property is a CSS custom property. Re-skinning for a new client means editing one variables block, typography, color, brand mark.
3. **Bilingual is structural.** Not a future-feature. Every string carries both languages from day one because international funders and government clients require it.
4. **Real data only.** No mock dashboards. The telemetry pipeline reads actual session transcripts; if there's no real number to show, the dashboard shows a dash, not a fake one.
5. **Document the why, not just the what.** Every architectural decision in the template carries a `Why:` line explaining the constraint that drove it. This compounds across engagements.

## License & ownership

This template is intended to be moved to its own Git repository and reused indefinitely across client engagements. When you do that:

- Replace this README's "what's in this folder" section with whatever your team needs to onboard new contributors
- Add your team's contribution guidelines (CONTRIBUTING.md)
- Add your team's license (or keep it private)
- Tag versions (`v1.0`, `v1.1`, …) so each engagement can pin a known-good template version

## Maintenance

Treat this template as a living product. Each engagement should produce at least one improvement that gets backported here. Keep `CHANGELOG.md` honest about what changed and why.

## Provenance

This template was extracted from the AQUAFLOW · Blueprint del Proyecto work for Tecnificación Nacional de Riego (TNR), funded by the World Bank. The first deployment used it for that engagement. Any project-specific text in the dashboard HTML should be treated as placeholder content to be replaced for new engagements.
