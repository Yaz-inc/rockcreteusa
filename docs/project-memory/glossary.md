# Glossary, Rockcrete USA Website Rebuild

Project-specific terminology, acronyms, and translation pairs. Read on day one. Update as new terms surface. Bilingual projects expand the EN/ES (or other-language) pair as the canonical translation.

**Last updated:** 2026-05-15

## Conventions

- Each term has: the canonical form, a one-sentence definition in en, the translation in en if bilingual, and where it's first introduced.
- Acronyms get expanded once on first use in any deliverable. The glossary is the single place where the expansion lives.
- "Client-internal" terms are tagged so AI agents know when to use them and when to translate to plain language for outside readers.

## Terms

### Project / engagement

| Term | Definition | Translation | First used |
|---|---|---|---|
| {{TERM_1}} | {{DEFINITION_1}} | {{TRANSLATION_1}} | {{FIRST_USED_1}} |
| {{TERM_2}} | {{DEFINITION_2}} | {{TRANSLATION_2}} | {{FIRST_USED_2}} |

### Domain / industry

Terms specific to the client's domain that the team needs to know cold.

| Term | Definition | Translation | First used |
|---|---|---|---|
| | | | |

### Technical / system

For software / AI / website projects: the technical terms in the architecture that newcomers ask about.

| Term | Definition | Translation | First used |
|---|---|---|---|
| | | | |

### Acronyms

| Acronym | Expansion | Definition |
|---|---|---|
| {{ACRONYM_1}} | {{EXPANSION_1}} | {{ACRO_DEF_1}} |
| {{ACRONYM_2}} | {{EXPANSION_2}} | {{ACRO_DEF_2}} |

## Translation rules

If your project is bilingual:

- **Proper nouns** (company names, product names, regulatory frameworks): do NOT translate. Use the original.
- **Job titles**: translate when natural in the target language; leave in original when no clean equivalent.
- **Regulatory / legal terms**: cite the original-language phrase first, then the working translation. Example: "Ley 172-13 (Dominican Data Protection Law)".
- **UI strings**: full translation, both directions, in i18n files. Glossary tracks the canonical pair.

## What does NOT go here

- Generic technical terms (REST, JSON, SQL): out of scope; assume the reader knows them.
- People's names: in `team-structure.md` and `stakeholder-register.md`.
- File / folder names: in `naming-conventions.md`.
- Decisions about terminology: in `decisions.md` (e.g. "we chose 'producer' over 'farmer' for inclusivity").

## Maintenance

- Add a term the moment a teammate or AI agent asks "what does X mean".
- When a term changes meaning (often happens when a system gets renamed), update the entry and add a note in `decisions.md`.
- For bilingual projects: ensure both columns are filled. A term with one column is half-glossaried.
