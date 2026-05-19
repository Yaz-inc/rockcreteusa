# Theme System

How light, dark, and per-client re-skinning work in Foundation.

## Three modes

The template ships with three theme modes, switchable via the topbar three-button toggle:

- **Light** (sun icon), default for client-facing presentations and external review
- **Dark** (moon icon), for long-form internal use and lower-eye-fatigue viewing
- **Auto** (monitor icon), follows the user's OS preference (`prefers-color-scheme`)

The user's choice persists in `localStorage` under the key `foundation_theme`. On every page load, the saved preference is read and applied before the first paint to avoid a flash of unstyled content.

## How it works at the CSS level

The HTML root carries `data-theme="light"` (or `dark` or `auto`). All theme-sensitive CSS is scoped via attribute selectors:

```css
:root { color-scheme: light; /* + light tokens */ }
:root[data-theme="dark"] { color-scheme: dark; /* + dark tokens */ }
@media (prefers-color-scheme: dark) {
  :root[data-theme="auto"] { color-scheme: dark; /* + dark tokens */ }
}
```

The `color-scheme` declaration is critical, it tells the browser to render native form controls (date picker icon, time picker icon, scrollbars, autofill chrome) in dark style. Without it, you get black calendar icons stranded on dark navy backgrounds.

A belt-and-suspenders fallback also explicitly inverts the calendar/clock SVG glyphs in WebKit:

```css
:root[data-theme="dark"] input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1) brightness(0.9);
  opacity: 0.85;
}
```

## Dark palette and contrast verification

Every dark-mode color was lifted from a default Tailwind-style palette to meet WCAG 2.1 AA contrast minimums against the dark background.

| Token | Dark value | Contrast vs. `--color-bg` (#0c1220) | Level |
|---|---|---|---|
| `--color-text` | `#ecf0f6` | 16.5:1 | AAA |
| `--color-text-2` | `#c4cdde` | 11.5:1 | AAA |
| `--color-text-muted` | `#8e9cb8` | 5.0:1 | AA |
| `--color-brand` | `#8eb1de` | 8.0:1 | AAA |
| `--color-brand-2` | `#a9c4e6` | 9.5:1 | AAA |
| `--color-success` | `#4ade80` | 9.5:1 | AAA |
| `--color-warn` | `#fbbf24` | 11:1 | AAA |
| `--color-danger` | `#f87171` | 6.5:1 | AAA |
| `--color-info` | `#60a5fa` | 7:1 | AAA |

Border tokens (`#2c374f` and `#3e4a68`) are not text contrasts, they're visual separators, where the requirement is just being distinguishable from the bg, which they are.

## Per-component dark adjustments

Most components inherit theme tokens automatically. A handful needed explicit dark-mode overrides:

- **Active task gradient**, light brand on dark would have failed contrast for the white text. In dark mode the gradient becomes a darker navy (`#1e3a5f` → `#14283f`) so white text retains AA contrast.
- **Form inputs**, switched to `--color-surface-3` background (slightly lighter than the parent container) so inputs read as visually distinct interactive fields.
- **Placeholder text**, explicitly set to `#94a3b8` at 60% opacity, since the browser default in dark mode is often too dim.
- **Topbar background**, overridden to a translucent dark navy (`rgba(19,26,42,0.85)`) preserving the backdrop-blur effect.
- **Modal backdrop**, heavier black opacity in dark mode (0.65 vs 0.55) since the underlying surface is already dark.

## Re-skinning for a new client

The template's whole point is one-line re-skinning. To produce a brand-aligned variant for a new engagement:

```css
:root {
  --color-brand:      #YOUR_PRIMARY;
  --color-brand-2:    #YOUR_PRIMARY_DARKER;     /* hover variant */
  --color-brand-soft: #YOUR_PRIMARY_TINT;       /* subtle bg, badges */
}

:root[data-theme="dark"] {
  --color-brand:      #YOUR_PRIMARY_LIGHTENED;  /* needs to read on dark bg */
  --color-brand-2:    #YOUR_PRIMARY_LIGHTENED_HOVER;
  --color-brand-soft: #YOUR_PRIMARY_DARKENED;   /* subtle dark-mode bg */
}
```

That's the entire customization. Layouts, components, motion all carry through.

If you want to use a different display font (e.g. for a brand that owns a custom serif):

```css
:root {
  --font-display: 'YourBrandSerif', Georgia, serif;
}
```

And add the appropriate `<link>` in `<head>` to load it. Inter as `--font-body` should stay constant across engagements, it's the most legible at dashboard density and pairs cleanly with almost any display font.

## Per-client overrides without forking the template

If you keep the template as a Git submodule or vendored copy and want to apply per-client overrides without touching the template:

1. Create `customizations/CLIENT_NAME-overrides.css`
2. Put your `--color-brand` overrides in it (and any per-client component tweaks)
3. In the per-engagement copy of `index.html`, add a single `<link>` after the inline `<style>` block:

```html
<link rel="stylesheet" href="../customizations/CLIENT_NAME-overrides.css">
```

Cascade resolves the overrides on top of the template defaults. Updating the template upstream (a new version) just means re-vendoring; the overrides survive.

See [customizations/README.md](../customizations/README.md) for examples.

## Choosing brand colors that work in both modes

The hardest part of theming is picking a brand color that reads as institutional in both light and dark. Some heuristics:

- **Saturated mid-tones (HSL S=50–70%, L=35–50%) work well in light mode** but become too bright in dark mode and need to be lightened
- **Pure dark colors (L < 25%) work well in light mode for text and accents** but disappear on dark surfaces, need to be lightened to L=70+
- **Test contrast against both `--color-bg` values** before committing
- **Avoid pure red on dark mode**, it's hard for some color-blind users to distinguish from neutral on dark surfaces
- **Avoid pure yellow on light mode**, it almost never has enough contrast for text

A good baseline: pick a primary that's H=210–240 (blue), S=40–60%, L=30–35% for light mode. Lighten by ~35–40 L points for dark mode. The default slate-blue follows exactly this rule.

## Adding new components to the system

When you build a new component for an engagement that should backport to the template:

1. Use only theme tokens, never hardcode a color, font, or radius
2. Test in both light and dark before committing
3. Add a comment block above the component's CSS explaining what it is and why
4. Add it to the design-system.md component list

The discipline pays off across engagements.
