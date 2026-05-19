# Bilingual System

How the dashboard ships in two languages from day one.

## The pattern

Every text node carries two attributes, `data-es` (Spanish) and `data-en` (English), and a single toggle in the topbar swaps which one is rendered.

```html
<button class="btn">
  <span data-es="Registro manual" data-en="Manual entry">Registro manual</span>
</button>
```

The visible text inside the element is the default (Spanish in this template). Clicking the EN button in the topbar swaps every text node's `textContent` to its `data-en` value and updates `<html lang>` to "en".

## Why this pattern

The alternative, splitting into separate `index.es.html` and `index.en.html` files, has serious drawbacks:

- Two files to maintain in sync; drift is inevitable
- Per-language URLs require server-side routing or duplicated bookmarks
- Mid-page language toggle isn't possible
- Search / TOC indexing splits across languages

The `data-es` / `data-en` pattern keeps both translations adjacent in source so they're maintained together, and the toggle is instant.

## How the toggle works

```js
function setLang(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-es][data-en]').forEach(el => {
    el.textContent = el.getAttribute('data-' + lang);
  });
  // Update aria-pressed on the toggle buttons
  // Persist choice to localStorage
}
```

The choice persists across reloads via `localStorage` under `foundation_lang`.

## Adding a new bilingual string

Anywhere you'd write:
```html
<span>Some text</span>
```

Write instead:
```html
<span data-es="Algo de texto" data-en="Some text">Algo de texto</span>
```

The visible content is always Spanish (the default for this template) but the toggle replaces it with `data-en` when EN is active.

For attributes other than text content (placeholders, aria-labels, titles), use a small JS extension:

```js
document.querySelectorAll('[data-es-placeholder]').forEach(el => {
  el.placeholder = el.getAttribute('data-' + lang + '-placeholder');
});
```

The template currently handles placeholders via the modal field definitions (`placeholder_es` / `placeholder_en`) rather than data attributes on every input, but the same pattern extends to titles, alt text, etc.

## Translation discipline

A few conventions that prevent drift:

1. **Both languages must be present.** A `data-es` without a `data-en` is a bug. CI can grep for orphans.
2. **Translations must be plain language.** Funders and government clients often read English as a second or third language. Avoid jargon, marketing prose, idioms.
3. **Numbers, dates, currency follow locale conventions when toggled.** The template uses `Intl.NumberFormat('es-DO')` for ES and `Intl.NumberFormat('en-US')` for EN. Currency is always USD here but the locale switches the thousands separator.
4. **Component-internal strings (modal field labels, button text, menu items) live in the modal field definitions** rather than being hardcoded, so they update via the same toggle.

## Adding a third language

The pattern extends to more languages by adding `data-fr`, `data-pt`, etc. and another button in the toggle. The `setLang()` function reads `data-${lang}` so it scales without code changes. The template ships with two languages because that's the immediate need; if a future engagement needs more, the change is mechanical.

## Single-language engagements

If a client wants only one language, two options:

1. **Hide the toggle**, `.lang-toggle { display: none; }` in your overrides
2. **Set both attributes to the same value**, keeps the markup pattern intact in case a second language is added later

Option 2 is preferable because it preserves the template's structural assumption.

## Translation review workflow

The cleanest workflow when both languages need to be reviewed by separate people:

1. Author writes the Spanish first (the default visible text)
2. Translator pulls a list of strings (`grep -oE 'data-es="[^"]*"' index.html`) and produces the English equivalents
3. Translator submits a PR that updates only the `data-en` attributes
4. Reviewer compares both languages side-by-side using the toggle in the local preview

For larger engagements, automate step 2 by extracting strings to a `translations.es.json` / `translations.en.json` and loading them at runtime instead of inline attributes, but that's only worth it past ~500 strings.
