# Writing conventions, Rockcrete USA Website Rebuild

How text inside files should be written across the project. Complements `naming-conventions.md` (which covers file and folder names). The goal: every document, screen, email, or comment in this project reads as natural human prose — professional, accessible to a non-technical reader, and free of stylistic tells that scream "machine-generated".

**Last updated:** 2026-05-15

## 1. Em-dashes (`—`) are forbidden

**Rule:** Do not use the em-dash character (`—`, U+2014) anywhere in this project. Not in dashboards, deliverables, emails, code comments, commit messages, or any other surface.

**Why:** Em-dashes are widely read as a tell that AI generated the text. Every deliverable should read as natural human writing so any reader (the client, a reviewer, the public) can engage with it without it feeling machine-generated.

**What to use instead.** The replacement depends on the role the em-dash was playing:

| Em-dash role | Natural replacement |
|---|---|
| Introducing an explanation or restatement (e.g. `X — clarification`) | colon `:` or split into two sentences with a period |
| Parenthetical aside (e.g. `X — note — Y`) | commas around the aside, or wrap in parentheses `()` |
| Separating equal items in a label (e.g. `Title — Subtitle`) | mid-dot ` · ` or colon `:` |
| Adding an emphatic continuation | start a new sentence |
| Conjunction continuation (`X — y …`, `X — and …`) | comma plus the conjunction |

**What stays allowed:**

- En-dashes (`–`, U+2013) for true date or number ranges (`Apr 21 – Jun 30`, `8–15×`). That is standard typography, not an AI tell.
- Hyphens (`-`, U+002D) in compound words and code identifiers. Standard.
- Mid-dot (`·`, U+00B7) as a list separator.

**How to enforce:**

- After any large content change, grep for `—` in the file or folder. There should be zero occurrences.
- Optional pre-commit hook in `scripts/pre-commit-em-dash-check.sh` (add if your team wants automated enforcement).

## 2. Tone and register

- **Working language:** en for everything client-facing. en for grant reporting, internal docs, or code identifiers if the project is bilingual.
- **Code comments:** flexible (primary or secondary language), but stay consistent within a file.
- **Bilingual UI strings** (if the dashboard supports it) use `data-es="…" data-en="…"` (or equivalent attribute pairs); both versions must be edited together. See `blueprint-dashboard/docs/bilingual.md`.

## 3. Voice

- Plain, professional, direct. No marketing language. No buzzwords.
- Active voice over passive when the actor is known.
- Avoid stylistic tics that read as AI:
  - The em-dash (covered above).
  - Triple-pattern lists at every opportunity ("clear, concise, and effective"). Vary sentence structure.
  - Unnecessary disclaimers ("It's important to note that…", "Indeed,").
  - Boilerplate transitions ("In essence,", "Ultimately,", "At its core,", "It's worth noting that").
  - Hedge words that signal AI uncertainty ("delve into", "navigate the complexities of", "leverage", "robust").
- Numbers stay numerals (5, not "five") in tables, KPIs, and any technical context. Spelled out only in narrative prose under 10.

## 4. Provenance markers (optional)

For projects where claims need attribution (research-heavy work, government deliverables, audit reports), tag claims with provenance chips:

- **Public** — data extracted from open documentary sources (decrees, executive reports, organization charts, budgets).
- **Hypothesis** — pending validation in interviews or experiments; not yet confirmed with the direct source.
- **Validated** — hypothesis confirmed in interview with the direct source, or evidence documentally verified.
- **Planned** — planned work, not yet started.

The dashboard supports this visually via `.fuente fuente--{publico|hipotesis|validado|planificado}` chips. Delete this section if your project does not need provenance tracking.

## 5. Where this applies

These conventions apply to:

- The Blueprint Dashboard (`blueprint-dashboard/index.html` and all `.md`, `.html`, `.py`, `.js`, `.sh` in that subtree).
- Project memory (`docs/project-memory/*.md`).
- Decision records (`docs/decision-records/*.md`).
- Architecture docs (`docs/architecture/*.md`).
- Per-engagement deliverables (wherever they live in the repo).
- Emails sent on behalf of the project.
- Commit messages and PR descriptions.

If you are writing anything that lives inside this project's surface area, this convention applies.

## 6. Length and structure

- **Section headers:** active and specific. Not "Introduction" but "What this project is".
- **Paragraphs:** 2 to 5 sentences. Long paragraphs make markdown unreadable.
- **Lists:** every bullet at least one full sentence. If items are shorter, prose is usually better.
- **Tables:** for data with parallel structure. Not for bulleted concepts.
- **Code blocks:** for code, paths, and commands. Not for quotes or emphasis.

## 7. When in doubt

Read what you wrote out loud. If it sounds like a person who knows the work talking to a smart colleague, it is good. If it sounds like a press release or a chat assistant, rewrite it.
