# Naming conventions, Rockcrete USA Website Rebuild

How files and folders should be named across the three surfaces. The goal: every path is safe to read, type, copy-paste, and version-control, for both humans and AI agents.

**Last updated:** 2026-05-15

## The three surfaces have different rules

| Surface | Primary audience | Allowed | Forbidden |
|---|---|---|---|
| **Drive folder** (rockcreteusa-website-project) | Humans + AI (mixed) | Spanish/Latin accents, spaces, numbered prefixes. ASCII-hyphen `-` only. | En-dash `–`, em-dash `—`, curly quotes `' ' " "`, null bytes, forward slash, backslash, colon, asterisk, question mark, pipe, `<`, `>`, leading/trailing whitespace. |
| **Git repository** (https://github.com/newmindsgroup/rockcreteusa-project-blueprint) | AI + IDEs (primary), humans second | ASCII letters/digits, `-`, `_`, `.`, `/`. `kebab-case` for folders and multi-word files. `SCREAMING_CASE.md` only for root-level governance docs. | Spaces, accents, parentheses, ampersands, any non-ASCII, uppercase for source directories. |
| **VPS** (https://rockcreteusa.projectizer.ai/) | AI + IDEs + web | Same as Git. URL-safe only. | Same as Git. Plus: no characters that require URL-encoding. |

**Why the split:** the Drive folder is where non-technical teammates navigate by eye in Finder/Explorer/Drive web UI. Kebab-case English would make it unusable for them. The Git repo and VPS are cross-platform, command-line-first, primarily consumed by AI agents and CI; they need to be pristine ASCII.

## Drive folder rules

### Top-level folders (numbered-prefix pattern)

```
NN - Title in Working Language with Spaces/
```

- Two-digit zero-padded prefix (`00`, `01`, ..., `99`) enforces sort order.
- Separator is ` - ` (space hyphen space), always using **ASCII hyphen** (U+002D).
- Title is in the project's primary working language, with accents if grammatically correct.
- Archive or de-emphasized folders use `99 -` so they sort to the bottom.

Standard roster (see `drive-folder-structure/README.md` for content):

```
00 - Project Memory
01 - Procurement and Contracts
02 - Team
03 - Client Documents
04 - Ideation
99 - Archive
```

### Subfolders

Title Case, spaces allowed, accents allowed, ASCII-hyphen only.

### File naming inside `00 - Project Memory/`

AI-governance docs use `SCREAMING_CASE.md`, flat and scannable:

`OVERVIEW.md`, `STATUS.md`, `DECISIONS.md`, `SESSION_LOG.md`, `CONTEXT_INDEX.md`, `TEAM_STRUCTURE.md`, `INSTRUCTIONS.md`, `FOLDER_STRUCTURE.md`, `NAMING_CONVENTIONS.md`, `WRITING_CONVENTIONS.md`.

**Do not nest the memory folder.** It is intentionally flat so any AI loading it can read every file without recursive directory walks.

### Client-owned content

Anything in `03 - Client Documents/` is the client's own material. **Do not rename.** The original names may have been distributed externally, referenced by URL, or cited in other systems. Renaming breaks audit trails. Accept whatever naming the client uses.

### Hard bans (in any Drive path)

These have caused concrete problems and are forbidden anywhere:

- **En-dash `–`** (U+2013): looks identical to a hyphen but is not. Shell copy-paste, Git normalization, and LLM tokenization all mishandle it.
- **Em-dash `—`** (U+2014): same problem as en-dash.
- **Curly quotes** `'` `'` `"` `"` (U+2018, U+2019, U+201C, U+201D): same problem.
- **OS-reserved characters** `/ \ : * ? " < > |`: break at least one of macOS/Windows/Linux.
- **Leading or trailing whitespace** in any filename.

If you see one of these in an existing file, fix it on sight and log the rename in `session-log.md`.

## Git repository rules

When the Git repo is created, these rules apply to everything committed:

### Core rules

1. **ASCII-only.** No accents, no diacritics, no non-ASCII symbols. Spanish proper nouns in filenames get transliterated (`Ideacion` not `Ideación`, `Español` becomes `espanol`). Non-negotiable: macOS normalizes filenames to NFD and Linux/Windows normalize to NFC, so a file named `Ideación.md` on a consultant's Mac will show up as a different filename in CI on Linux and silently fail.
2. **`kebab-case` for multi-word folders and files.** Lowercase letters, digits, and ASCII-hyphen `-`. No underscores in paths (they are fine inside identifiers in code).
   - OK: `etapa-1-discovery/`, `auth-module/`, `sprint-01-plan.md`.
   - Not OK: `Etapa 1 Discovery/`, `Etapa_1_Discovery/`, `EtapaUnoDiscovery/`.
3. **`SCREAMING_CASE` reserved for root-level governance docs.** Exactly these names are acceptable in SCREAMING_CASE: `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `LICENSE`, `.github/CODEOWNERS`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/*`. Everything else is kebab-case.
4. **No spaces anywhere** in committed paths.
5. **No parentheses, ampersands, or shell-special characters** in committed paths.
6. **File extensions are lowercase.** `.md`, `.pdf`, `.docx`, `.jpeg`, never `.MD`, `.PDF`, `.JPEG`.
7. **Dates in filenames use ISO-8601.** `sprint-01-demo-2026-05-05.md`. Never `5-5-26`, `May-5-2026`, or `2026_05_05`.

### Commit message convention

Conventional Commits 1.0.0 (`type(scope): subject`):

- `feat(auth): add JWT refresh flow`
- `fix(solicitudes): correct Prisma relation on producer_id`
- `docs(project-memory): update status.md for sprint 2 kickoff`
- `chore(ci): pin node to v20 LTS`

Commit subjects are lowercase English. Do not include personal names or firm names in commit messages.

### Branches

- `main` is protected. PRs only.
- Feature branches: `type/short-description`, e.g. `feat/auth-flow`, `fix/login-redirect`.
- Hotfix branches: `hotfix/short-description`.

## VPS rules

- URLs must be ASCII-only and URL-safe (same rules as Git paths).
- Deployment paths use kebab-case: `/var/www/rockcreteusa-website-rebuild/...`.
- Environment variable names use `SCREAMING_SNAKE_CASE` per POSIX convention.
- Subdomains use kebab-case: `dashboard.rockcreteusa-website-rebuild.{{DOMAIN}}`, `api.rockcreteusa-website-rebuild.{{DOMAIN}}`.

## Spanish (or other non-English) content across the Git/VPS boundary

If your project's working language is Spanish (or any non-English language), the rule:

- **UI strings, translations, database content:** full localized text with accents. Use i18n files (`es-DO.json`, `pt-BR.json`, etc.) and UTF-8 encoding throughout.
- **File and folder names, URL paths, environment variables, database table/column names:** ASCII only. Always.
- **Code comments and documentation:** English in code; localized in `/docs`. Bilingual content is fine; accent-free filenames are not negotiable.

Example:

```
apps/backend/src/solicitudes/
  └── solicitudes.controller.ts
      // The controller serves /solicitudes endpoints
      // for the "Módulo de Solicitudes" (see docs/modules/solicitudes.md)
```

## Enforcement

`scripts/lint-naming.sh` runs in CI on every push (see `.github/workflows/lint-naming.yml`). It scans tracked-file paths and fails the build if any of these appear in the Git tree:

- En-dash, em-dash, curly quotes
- OS-reserved characters
- Spaces
- Non-ASCII characters
- Uppercase outside the SCREAMING_CASE allowlist

Run locally before pushing: `bash scripts/lint-naming.sh`.

## What to do when you find a naming violation

1. **In Drive, hard-ban character (en-dash, em-dash, curly quotes, OS-reserved characters):** rename immediately, log the rename in `session-log.md`, and update `context-index.md` if the file was indexed.
2. **In Drive, just "ugly" (spaces, Title Case) but not a hard ban:** leave it; renaming risks breaking external references. Add a note in `context-index.md` only if navigation is confusing.
3. **In Git:** fix it in the same PR that introduced it, before merge. CI enforces this.
4. **Client-owned content (`03 - Client Documents/`):** never rename. Flag typos to the project lead verbally; do not touch the file.
