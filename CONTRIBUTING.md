# Contributing

This file applies to anyone contributing **to the template itself**. Each engagement that uses this template will have its own per-engagement `CONTRIBUTING.md` (which is created when you run `init.sh`).

## Backport rule

Every engagement that uses this template should produce **at least one improvement** that gets backported here. If you discover a missing placeholder, a clearer way to describe a section, a better deploy step, a new project-type guide, or a bug in the dashboard, open a PR against this repo.

The flow:

1. Fix it in the engagement's repo first (so the engagement is unblocked).
2. Open a PR here that lifts the fix back to the template.
3. Reference the engagement repo's commit SHA in the PR description so reviewers can see the original context.

## Branch and PR conventions

- Branch off `main`. Branch names: `type/short-description`, e.g. `fix/init-script-windows-paths`, `feat/add-project-type-data`.
- PRs require at least one approval from a CODEOWNER.
- CI must pass: naming-lint and any future template-validation checks.
- Squash-merge into `main`. The squashed commit message follows Conventional Commits 1.0.0:
  - `feat(scope): subject` for new capabilities
  - `fix(scope): subject` for bug fixes
  - `docs(scope): subject` for docs-only changes
  - `chore(scope): subject` for dependency / tooling updates
  - `refactor(scope): subject` for code reshuffling without behavior change

Example: `feat(project-types): add starter guide for data engagements`.

## What to update when you change the template

A change to the template usually touches more than one place. Use this checklist:

- Updated a placeholder name → update `.template/placeholders.json` AND every file that references the placeholder. Run `grep -rn "{{OLD_NAME}}"` to find stragglers.
- Added a new file under `docs/project-memory/` → update `docs/project-memory/README.md` and `docs/project-memory/folder-structure.md`. Add to `.template/post-init-checklist.md` if the user needs to act on it.
- Added a new project type → create `docs/project-types/{slug}.md`, add an option to `init.sh`'s project-type prompt, and add a row to `docs/project-types/README.md`.
- Changed the dashboard structure → update `blueprint-dashboard/ARCHITECTURE.md` and `blueprint-dashboard/CHANGELOG.md`. If the change affects how `init.sh` rewrites text in `index.html`, update `init.sh` too.
- Bumped a placeholder default or added validation → keep the regex simple, document it in `.template/placeholders.json`'s `description` field.

## Naming and writing conventions for template content

The template's own files follow the same naming and writing conventions the template enforces in client engagements:

- **Paths:** kebab-case ASCII for all paths under Git's tree, see `docs/project-memory/naming-conventions.md`. The only exceptions are GitHub-mandated SCREAMING_CASE files like `.github/CODEOWNERS`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/*`, `README.md`, `LICENSE`, `CONTRIBUTING.md`, `CHANGELOG.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`.
- **Em-dashes:** do not use em-dashes (`—`, U+2014) anywhere in this template. They read as a tell that AI generated the text. Use a colon, comma, parentheses, or two sentences instead. See `docs/project-memory/writing-conventions.md`.
- **Curly placeholders:** use double-brace style `{{NAME}}` consistently. Don't introduce alternative syntaxes (single brace, dollar-sign, mustache).
- **Dates:** ISO-8601 (`YYYY-MM-DD`) everywhere.

## Versioning

Calendar versioning (`YYYY-MM-DD`) for the template itself. Bump `CHANGELOG.md` in the same PR that ships the change. Tag a release once a meaningful set of improvements has accumulated, typically every 4 to 6 weeks.

## Testing the init script

Before merging a PR that touches `init.sh` or `init.ps1`:

1. Clone the template into a scratch directory: `git clone . /tmp/blueprint-test`.
2. Run the init script with realistic answers.
3. Verify no `{{` or `}}` strings remain: `grep -rn "{{" /tmp/blueprint-test || echo OK`.
4. Verify the dashboard opens cleanly: `cd /tmp/blueprint-test/blueprint-dashboard && python3 -m http.server 8765`.
5. Run the naming-lint: `bash scripts/lint-naming.sh`.

If any of those fail, the PR is not ready.

## Reporting issues

Use the issue templates under `.github/ISSUE_TEMPLATE/`. The decision-record template is for proposing a change to a documented convention (not for bugs).

## Code of conduct

See `CODE_OF_CONDUCT.md`.
