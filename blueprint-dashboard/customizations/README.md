# Customizations folder

Per-client visual overrides that don't require touching the template's core files.

## When to use this folder

- A client wants their brand color applied across the dashboard
- A client wants a custom display font (their own brand serif)
- A client wants spacing, radius, or component variants tweaked for their style
- You want to keep the template upgradeable (Git submodule or vendored copy) without losing per-client tweaks

## When NOT to use this folder

- The change is generic enough to belong in the template itself, backport it instead
- The change requires HTML structure modifications, those go in the per-engagement copy of `dashboard/index.html`

## How it works

Drop a CSS file into this folder named `[client-name]-overrides.css`. Then in the per-engagement copy of `dashboard/index.html`, add one `<link>` after the inline `<style>` block:

```html
<link rel="stylesheet" href="../customizations/[client-name]-overrides.css">
```

CSS cascade resolves the overrides on top of the template defaults. Updating the template upstream just means re-vendoring; the overrides survive.

## Example: Acme Corp override (light brand)

Hypothetical `customizations/acme-corp-overrides.css`:

```css
/* Acme brand color: water-and-government teal */
:root {
  --color-brand:      #0d5b54;
  --color-brand-2:    #0a4640;
  --color-brand-soft: #d6ebe6;
}

:root[data-theme="dark"] {
  --color-brand:      #4ec9bb;
  --color-brand-2:    #6cdacf;
  --color-brand-soft: #103834;
}
```

That's the entire customization. Everything else carries through, the layout, components, motion, accessibility posture.

## Example: brand serif override

Hypothetical `customizations/brand-with-custom-serif-overrides.css`:

```css
/* Use the client's brand serif for hero headlines */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');

:root {
  --font-display: 'Playfair Display', Georgia, serif;
}
```

`Inter` stays as the body font (because it's the most legible at dashboard density) but the editorial heroes use the client's serif.

## Example: per-component tweak

A client wants the buttons more rounded:

```css
.btn { border-radius: 999px; }
```

Or wants the topbar taller:

```css
:root { --topbar-h: 72px; }
.topbar { padding: 0 2rem; }
```

Whatever the client wants, as long as it's purely visual, lives here. Keep the template generic.

## Naming convention

`[lowercase-client-name]-overrides.css`. Examples:

- `acme-corp-overrides.css`
- `client-name-overrides.css`
- `enterprise-style-overrides.css`

Use lowercase ASCII with hyphens, same convention as the rest of the file system.

## Versioning

If you fork this template into a real Git repo, commit each client override here so they're audit-able. When the engagement ends, archive the file (rename to `[client-name]-overrides.archive.css` or move to a `archive/` subfolder).

## Multi-tenant pattern (advanced)

For a consultancy running many engagements, you can build a tiny "brand picker" that swaps the `<link>` href dynamically:

```html
<script>
  const client = new URLSearchParams(location.search).get('client') || 'default';
  if (client !== 'default') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `../customizations/${client}-overrides.css`;
    document.head.appendChild(link);
  }
</script>
```

Then `?client=acme-corp` loads Acme's overrides, `?client=other-client` loads another client's. Useful for sales demos.
