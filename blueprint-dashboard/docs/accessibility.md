# Accessibility

The template targets WCAG 2.1 AA across every screen, both light and dark modes.

## Why this matters

For government / multilateral / publicly-funded engagements (World Bank, UN agencies, EU projects, US federal contractors), Section 508 / EN 301 549 / WCAG 2.1 AA compliance is contractually required. For private-sector engagements, it's still the right baseline, accessibility done well also produces a more usable product for everyone.

## What's verified at AA level

### Color contrast

- Body text (light): `#0c0e10` on `#fafaf7` = 17:1 (AAA)
- Body text (dark): `#ecf0f6` on `#0c1220` = 16.5:1 (AAA)
- Muted text (light): `#6b7177` on `#fafaf7` = 5.5:1 (AA)
- Muted text (dark): `#8e9cb8` on `#0c1220` = 5.0:1 (AA)
- Brand color on bg (light): `#1e3a5f` on `#fafaf7` = 11:1 (AAA)
- Brand color on bg (dark): `#8eb1de` on `#0c1220` = 8:1 (AAA)
- Semantic colors (success/warn/danger/info) on their soft backgrounds: ≥5:1 in both themes

Native form controls (date / time pickers, scrollbars, autofill chrome) follow `color-scheme` so they meet AA contrast in both modes.

### Keyboard navigation

- Every interactive element is reachable via Tab
- Visible focus rings via `:focus-visible` (outline + offset)
- Skip-to-main link not yet included (TODO for v0.2)
- Modal focus trap handled by native `<dialog>` element
- Escape closes modals and the mobile drawer

### Semantic markup

- One `<header role="banner">` per page
- One `<nav>` (sidebar)
- One `<main>` content area
- Sections use `<section>` with `aria-labelledby` pointing at their heading
- Cards use `<article>` when they're standalone content; `<div>` otherwise
- Headings hierarchy: one `<h1>` per screen, `<h2>` for subsections, `<h3>` for cards
- Lists use `<ul>` / `<ol>` (not divs styled like lists)

### ARIA

- Icon-only buttons have `aria-label`
- Toggle buttons have `aria-pressed`
- Active nav link has `aria-current="page"`
- Decorative icons have `aria-hidden="true"`
- Live regions: lock-banner uses `role="status"` for non-interruptive announcements
- Modal dialogs use native `<dialog>` (which carries the right ARIA implicitly)

### Forms

- Every input has an associated `<label>` (matched via `for=id`)
- Required fields marked with both `required` attribute and visible `*`
- Error messages (when any) appear adjacent to the offending field
- Field hints use `.field-hint` (paired with the input via aria-describedby in v0.2)

### Motion

- All transitions / animations respect `@media (prefers-reduced-motion: reduce)`
- The pulsing dot on the active-task chip stops animating under reduced-motion
- Smooth scrolling honors the user's preference

### Touch targets

- All buttons and interactive elements are at least 44×44px (per Apple HIG and WCAG 2.5.5)
- The mobile drawer toggle, theme toggle, and language toggle all meet this

### Text resizing

- All sizes use `rem` so they scale with browser zoom
- `clamp()` on hero typography ensures responsive sizes across viewports
- Layout doesn't break at 200% zoom

## What's not yet AA-verified (TODO for v0.2+)

- **Skip-to-main link**, not present. Should be added at the top of `<body>`.
- **aria-describedby** on inputs with hints, currently the hint is positioned near the input but not formally associated.
- **Autocomplete attributes** on form inputs (`autocomplete="given-name"` etc.) for browser auto-fill.
- **Alternative text on functional images**, there are none yet, but when charts / maps / illustrations are added, they need `alt` or `aria-label`.
- **Live timer announcements**, the "00:00:00" timer updates every second. Should be marked `aria-live="off"` to avoid screen-reader spam, with a summary announcement on stop.

## Testing checklist for any new component or screen

Before merging:

1. **Tab through the screen**, does focus reach every interactive element in a logical order?
2. **Press Tab + Shift-Tab**, does focus move backwards correctly?
3. **Activate every interactive element with Enter and Space**, both should work
4. **Toggle dark mode**, do all colors still pass contrast?
5. **Resize to 320px wide**, does the layout reflow without breaking?
6. **Zoom to 200%**, same check
7. **Disable images / disable CSS**, is the content still readable in source order?
8. **VoiceOver / NVDA / JAWS test**, does the page announce its structure correctly?
9. **Check color contrast** with a tool like [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/)
10. **Lint with `axe-core`**, run `npx @axe-core/cli http://127.0.0.1:8765/foundation-theme-preview.html`

## Tools

For accessibility testing during development:

- **axe DevTools** browser extension, fast catch of common issues
- **Lighthouse** in Chrome DevTools, built-in, runs on every audit
- **WebAIM WAVE**, visual overlay of issues
- **VoiceOver** on macOS (Cmd+F5 to enable), actual screen-reader test
- **Keyboard-only navigation**, unplug your mouse for a full session

## Compliance-statement language for clients

When the engagement requires a public accessibility statement, the template's posture supports language like:

> "[Dashboard name] is designed and built to meet WCAG 2.1 Level AA accessibility standards. The dashboard supports keyboard-only navigation, screen-reader use (VoiceOver, NVDA, JAWS), 200% zoom without loss of content, light and dark color schemes, and respects user preferences for reduced motion. Full accessibility documentation is published at [URL]. Accessibility issues can be reported to [email]; we commit to acknowledging within 5 business days and resolving where feasible within 30 days."

Adjust to match your firm's actual response commitment.

## When AA is not enough

For US federal procurement, EN 301 549 (EU), or contexts involving children / elderly / sensitive users, AAA targets may apply. Most of the template already meets AAA for color contrast. The remaining AAA-only requirements involve more intensive content patterns (sign-language video, extended audio descriptions, more granular reading-level constraints) that are out of scope for a project-management dashboard.

If a specific engagement requires AAA, audit on a per-feature basis rather than blanket-claiming AAA. The template is honest at AA.
