# Foundation Design System

The visual language of the dashboard. Calm, generous, modern, brand-agnostic by default, re-skinnable per client by editing one variables block.

## Design references (sensibility, not branding)

Linear, Stripe Docs, Vercel dashboards, Mercury, Notion. Editorial-grade product surfaces, high information density when needed, but never crowded. Treats "this is for serious work" as compatible with "this is beautiful to look at".

## Color tokens

All colors live as CSS custom properties on `:root`. Re-skinning means editing this block. Default palette is brand-agnostic, a deep slate-blue that reads as institutional and trustworthy without being generic-WB-navy or generic-Stripe-indigo.

### Light theme (default)

| Token | Default | Purpose | Contrast vs. text |
|---|---|---|---|
| `--color-bg` | `#fafaf7` | page background, warm off-white |, |
| `--color-surface` | `#ffffff` | cards, sidebar, topbar |, |
| `--color-surface-2` | `#f5f4ef` | subtle inset, secondary surface |, |
| `--color-surface-3` | `#ebe9e2` | deeper inset, input backgrounds |, |
| `--color-text` | `#0c0e10` | primary ink | 17:1 on bg (AAA) |
| `--color-text-2` | `#3a3f44` | secondary text | 9:1 on bg (AAA) |
| `--color-text-muted` | `#6b7177` | labels, meta | 5.5:1 on bg (AA) |
| `--color-border` | `#e7e4dc` | subtle divider |, |
| `--color-border-2` | `#d6d2c7` | stronger divider |, |
| `--color-brand` | `#1e3a5f` | primary: links, buttons, active states | 11:1 on bg (AAA) |
| `--color-brand-2` | `#14283f` | brand hover variant |, |
| `--color-brand-soft` | `#e2e8f0` | brand badge bg, subtle highlight |, |
| `--color-accent` | `#b45309` | secondary accent (used sparingly) | 5.7:1 on bg (AA) |
| `--color-success` / `-soft` | `#16704a` / `#d8ebdf` | confirmed / done |, |
| `--color-warn` / `-soft` | `#8a5a00` / `#f5e8c9` | pending / caution |, |
| `--color-danger` / `-soft` | `#9b2c2c` / `#f4d5d5` | blocking / error |, |
| `--color-info` / `-soft` | `#1d4ed8` / `#d8e4f8` | informational |, |

### Dark theme

Same names, different values. See [theme-system.md](theme-system.md) for the full dark palette and contrast verification.

## Typography

Three font families, each with a clearly-defined scope.

### `--font-body`, Inter

Used for: navigation, body text, labels, tables, forms, KPI numerics, operational page headers, badges, buttons.

Inter is the default body and UI font across every screen and every component. Excellent legibility on screens, comprehensive Latin/Cyrillic coverage, designed for software interfaces, free, ubiquitous on Google Fonts.

KPI numerics use Inter at weight 700 with `font-variant-numeric: tabular-nums` for proper aligned digit columns. This is measurably more legible than a serif at dashboard density.

### `--font-display`, Source Serif 4

Used for: editorial chapter heroes only. The single hero `<h1>` at the top of a story-driven section (Inicio, future Discovery / Plan / Results sections in your own engagement). Should appear at most 1–2 times per screen.

Source Serif 4 is by Frank Grießhammer at Adobe, designed specifically for screens, with optical-size and weight variable axes. Free. Pairs cleanly with Inter (similar x-height and proportions). Supports Spanish accents and extended Latin/Cyrillic.

**Why a serif at all?** Pure-sans dashboards (Linear, Notion, Vercel) look interchangeable. A deliberate serif moment at the top of editorial sections lifts the page above generic-SaaS-template feel without sacrificing the sans-led operational density elsewhere. Stripe does this same split between Press (serif) and Product (sans).

### `--font-mono`, JetBrains Mono

Used for: codes (deliverable IDs like `E1.4`, interview codes like `INT-E1-007`), token counts in dense tables, file paths in documentation, time stamps. Free. Excellent variable-width rendering.

## Type scale

| Class | Font family | Size (responsive) | Use |
|---|---|---|---|
| `h1.display` | display serif | clamp(2rem, 4vw + 1rem, 3.5rem) | hero of editorial sections |
| `h2.display` | display serif | clamp(1.5rem, 2vw + 1rem, 2.25rem) | sub-hero in editorial sections |
| `h1.op-heading` | body sans | clamp(1.75rem, 2.5vw + 0.75rem, 2.4rem) | hero of operational pages (Panel Interno, etc.) |
| `h2.op-heading` | body sans | clamp(1.25rem, 1.5vw + 0.75rem, 1.75rem) | sub-hero in operational pages |
| `h3` | body sans | 1.125rem | card titles, section labels |
| `.eyebrow` | body sans 600 uppercase | 0.7rem letter-spacing 0.1em | small label above a heading |
| `.kpi-value` | body sans 700 tabular-nums | clamp(1.6rem, 2.4vw + 0.5rem, 2.2rem) | KPI numerals |
| `.mono` | mono | 0.85em | inline codes |
| body default | body sans | 1rem (16px) | paragraphs, lists |

## Spacing & geometry

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | inputs, badges, small chips |
| `--radius` | 10px | cards, buttons |
| `--radius-lg` | 16px | modals, hero cards |
| `--radius-xl` | 24px | large feature surfaces |
| `--sidebar-w` | 272px | sidebar width on desktop |
| `--topbar-h` | 60px | topbar height |

Spacing in components uses `rem` units. Component padding is typically `1rem` (16px) to `1.25rem` (20px). Section spacing is `2rem` to `3rem`.

## Elevation (shadows)

| Token | Use |
|---|---|
| `--shadow-1` | hairline elevation (default cards on hover, KPI cards) |
| `--shadow-2` | floating elements (sidebar drawer when open, brand-mark) |
| `--shadow-3` | modals, popovers |

In dark mode, shadows use higher black opacity to compensate for the dark surfaces under them.

## Motion

| Token | Value | Use |
|---|---|---|
| `--ease` | `cubic-bezier(0.4, 0, 0.2, 1)` | standard ease (Material-style) |
| `--duration-1` | 140ms | hover, focus, theme swap |
| `--duration-2` | 240ms | nav drawer, screen transitions |
| `--duration-3` | 400ms | progress bar fills |

All animation respects `@media (prefers-reduced-motion: reduce)`.

## Components

Every component is documented in the HTML next to its CSS rules. The component vocabulary:

- **`.card`**, primary container; light border, subtle hover
- **`.card--accent`**, gradient-tinted card for hero / key moments
- **`.btn`** / **`.btn--primary`** / **`.btn--ghost`** / **`.btn--icon`**, buttons in three weight tiers + icon-only variant
- **`.badge`** / **`.badge--brand`** / **`.badge--success`** / etc., pill-shaped labels in semantic variants
- **`.kpi`**, number-card pattern with label, value, optional delta line
- **`.progress`**, thin progress bar
- **`.eyebrow`**, uppercase label that precedes a heading
- **`.lock-banner`**, restricted-area indicator (used at the top of admin-only screens)
- **`.active-task`**, gradient bar for the live timer in Panel Interno
- **`.task-row`**, collapsible task entry in the tracker
- **`.milestone-card`**, milestone roll-up with stats
- **`.meter`**, three-column row with label, bar, value (used for activity, tools breakdown)
- **`.accordion`**, `<details>`/`<summary>` styled accordion
- **`dialog.modal`**, full modal dialog system; see [modal-system.md](modal-system.md)
- **`.lang-toggle`** / **`.theme-toggle`**, segmented-control toggle pattern
- **`.tooltip`** (via `data-tooltip`), hover tooltip for acronyms

## Iconography

[Lucide](https://lucide.dev/) loaded via CDN. Default size 18px in nav, 14–16px inline. All icons are `<i data-lucide="ICON_NAME" aria-hidden="true">`, `aria-hidden` because they're decorative; if an icon carries semantic meaning without an accompanying label, add an `aria-label` to the parent button.

## Photography & illustration

The template ships with no images. Avoid stock photos in this kind of dashboard, they almost always cheapen the aesthetic. If you need imagery, prefer:

- Maps (subtle gray base map of the relevant geography)
- Charts and data visualizations (using brand color)
- Hand-drawn or geometric icons
- Letter-mark logo treatments

## When to break the rules

The defaults assume a serious, institutional, project-management context. If your engagement is for a brand with a more playful identity (consumer product, creative agency), the right move is usually:

- Brighten or soften the brand color
- Allow the display font to spread to more h2 / h3 headings
- Increase border radius (16–24px feels more friendly)
- Add subtle background patterns or gradients
- Loosen the line-height for warmer prose

The system supports all of this, every value is a CSS variable.
