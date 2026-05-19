# Branding / identity

Use this guide when the engagement is naming, logo, voice, color, typography, brand book, or asset library work.

## Typical lifecycle

| Phase | Duration | Goal | Output |
|---|---|---|---|
| Discovery | 2 to 4 weeks | Understand the audience, the competition, the position. | Brand brief, audience profiles, competitive landscape, mood directions. |
| Concept | 2 to 3 weeks | Generate three distinct directions. | Three concept boards with mark, palette, type, voice samples. |
| Refinement | 2 to 4 weeks | Pick one and polish. | Final logo system, palette, typography, voice guide, primary applications. |
| Delivery | 1 to 2 weeks | Hand over with usage rules. | Brand book PDF, logo files (SVG/PNG/EPS), font licenses, asset library, applications samples. |

Branding projects are short, intense, and decision-heavy. The risk is not running out of time, it is decision drift.

## Standard deliverables

Discovery:

- Brand brief (one page).
- Audience profiles (3 to 5 representative users).
- Competitive landscape audit.
- Mood directions (3 to 5 visual paths).

Concept:

- 3 concept directions, each with: wordmark or logomark, primary palette, type stack, sample applications (business card, social post, web hero), voice samples.

Refinement:

- Selected direction expanded.
- Logo lockups (horizontal, vertical, mark-only, monochrome, knockout).
- Color tokens (HEX, RGB, CMYK, Pantone if needed).
- Type system (display, body, monospace) with weights and licenses.
- Voice and tone guide.
- Iconography starter set (if in scope).

Delivery:

- Brand book PDF (40 to 80 pages typical).
- Final asset library on a shared drive.
- Font license documentation.
- Source files (Figma, AI, Sketch).
- Usage do/don't sheet.

## Top-level folders to keep

```
brand/
  ├── logo/                   final logo files (SVG, PNG, EPS, PDF)
  ├── typography/             font files and licenses
  ├── color/                  swatches, palettes (.ase, .clr, JSON tokens)
  ├── voice-and-tone/         written guidelines and samples
  ├── photography/            (if in scope) art direction guide
  ├── iconography/            (if in scope) icon system
  └── usage-examples/         sample applications
research/
  ├── audience/               audience profile docs
  ├── competitive/            competitor audit
  └── interviews/             stakeholder interview notes
deliverables/
  ├── 01-brand-brief/
  ├── 02-mood-directions/
  ├── 03-concepts/
  ├── 04-refined-system/
  └── 05-brand-book/
```

## Common risks

1. **Stakeholder spread.** Three executives with different tastes block decisions. Identify one decision-maker upfront; the others advise.
2. **Concept-stage scope creep.** "Can we see one more direction?" extends Concept indefinitely. Lock to 3 from the start; clarify in the SOW.
3. **Late legal review.** Trademark conflicts surface after the logo is loved. Do trademark search in Concept, not Delivery.
4. **Font licensing.** Foundry licenses are restrictive (web, print, broadcast separate). Resolve in Refinement, not Delivery.
5. **Asset format gaps.** Client teams use unexpected tools (PowerPoint, Canva, custom CMS). Provide format coverage explicitly.

## Decision discipline

Branding work has more subjective decisions than software work. Two practices help:

- **Decision log per stage.** Every direction-shaping decision (audience, mood, concept, refinement) is logged in `docs/project-memory/decisions.md` with the rationale. The client sees the log; surprise is minimized.
- **One-decision-maker rule.** The SOW names one person on the client side who has final say. They can solicit input from anyone, but the call is theirs. This avoids design-by-committee paralysis.

## Dashboard customization for branding

The default dashboard works fine. Adjust the category labels in `blueprint-dashboard/telemetry/tasks.example.json`:

- `discovery-and-research`
- `concept-and-exploration`
- `refinement-and-systematization`
- `production-and-delivery`
- `meetings-and-reviews`
- `documentation`
- `project-management`

Use the dashboard's "Resultados" or equivalent screen to publish the final brand book or a viewer of the asset library.

## Pointers

- `../project-memory/` for the brief and decision log.
- `../decision-records/` for any architecturally relevant choices (asset hosting, brand-tokens-as-code, etc.).
- `blueprint-dashboard/customizations/` for per-client visual overrides on the dashboard itself.
