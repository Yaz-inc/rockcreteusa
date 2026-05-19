# Project types

Each project type has its own lifecycle, deliverable categories, common risks, and typical tech-stack assumptions. The init script asks which type your project is and the answer drives a few defaults; the type-specific guidance lives in this folder.

## Supported types

| Type | Slug | Guide | When to pick it |
|---|---|---|---|
| Software / app development | `software` | [software-app.md](software-app.md) | Building a web app, mobile app, backend service, or platform from scratch or extending an existing one. |
| Branding / identity | `branding` | [branding-identity.md](branding-identity.md) | Naming, logo, voice, color, typography, brand book, asset library. |
| Website / marketing site | `website` | [website-marketing.md](website-marketing.md) | A marketing site, landing-page system, content site, or campaign microsite. May overlap with branding. |
| AI implementation | `ai-implementation` | [ai-implementation.md](ai-implementation.md) | Designing and shipping AI capabilities (LLM workflows, RAG, agents, evaluations, ops). |

## How the type changes the project

Picking a type during `init.sh` does the following:

1. Selects which `docs/project-types/{type}.md` file is referenced from `docs/project-memory/overview.md`.
2. Adjusts the example sprint / phase calendar in `docs/project-memory/status.md` to match the type's typical lifecycle.
3. Suggests which top-level folders to keep or drop in the Git repo (e.g., `apps/` for software, `brand/` for branding).
4. Pre-fills the dashboard's category labels in `blueprint-dashboard/telemetry/tasks.example.json` with type-appropriate names.

You can always pick more than one type (a website with branding work, an app with an AI capability). Keep all the relevant guides; delete the ones that do not apply.

## Adding a new type

If your engagement does not fit one of the four:

1. Create `docs/project-types/{new-slug}.md` modeled on `software-app.md`.
2. Add a row to the table above.
3. Add `{new-slug}` to the project-type prompt in `init.sh` and `init.ps1`.
4. Add `{new-slug}` to the validation regex in `.template/placeholders.json`.
5. Submit a PR back to the template repo so future engagements benefit.

Common types that are good candidates for adding: `data-platform`, `consulting-only`, `research-report`, `event-production`.
