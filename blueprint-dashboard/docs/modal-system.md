# Modal System

The reusable dialog component that replaces browser `prompt()` / `alert()` / `confirm()` with in-app modals styled to match the design language.

## Why a custom modal system

Browser native dialogs are ugly, can't be styled, can't be made bilingual, and break the "the dashboard is the artifact" principle. A custom modal system is non-negotiable for any product that takes UX seriously.

Two implementation choices:

1. Build modals from scratch with `<div role="dialog">` and manual focus management
2. Use the native `<dialog>` element

This template uses option 2. The native `<dialog>` element has been well-supported since 2022, handles focus trap and Escape key dismissal automatically, and integrates cleanly with the browser's modal stacking. No external dependency, no accessibility footguns.

## Public API

One function, `showModal(options)`, returns a Promise.

```js
const result = await showModal({
  title: 'Modal title',
  sub: 'Optional subtitle / context',
  fields: [
    { type: 'text', name: 'first_name', label_es: 'Nombre', label_en: 'Name', required: true },
    { type: 'date', name: 'date', label_es: 'Fecha', label_en: 'Date', value: '2026-04-27' },
    { type: 'textarea', name: 'note', label_es: 'Nota', label_en: 'Note',
      placeholder_es: 'Ej: ...', placeholder_en: 'E.g: ...' }
  ],
  confirmText: 'Save',     // optional
  cancelText: 'Cancel',    // optional
  hideCancel: false        // optional, true for alert-style modals
});

if (result === null) {
  // user cancelled
} else {
  // result is { first_name, date, note }
  console.log(result.first_name);
}
```

## Field types

| Type | Renders as | Returns |
|---|---|---|
| `text` | `<input type="text">` | string |
| `textarea` | `<textarea>` | string |
| `number` | `<input type="number" min={f.min}>` | string (parse with `parseInt` / `parseFloat`) |
| `date` | `<input type="date">` | ISO date string `YYYY-MM-DD` |
| `time` | `<input type="time">` | `HH:MM` |
| `select` | `<select>` with `f.options` | the selected option's `value` |
| `info` | read-only display block | (not in form data; for displaying context) |

## Field options

Every field accepts:

- `name`, required; the key in the returned object
- `label_es` / `label_en`, required; bilingual label
- `value`, optional; default value
- `placeholder_es` / `placeholder_en`, optional; placeholder text
- `hint_es` / `hint_en`, optional; helper text below the field
- `required`, optional boolean; HTML5 validation
- `col: 'half'`, optional; pairs adjacent fields side-by-side in a row

For `select` type, also:

- `options`, array of `{ value, label_es, label_en }`

For `number` type, also:

- `min`, minimum value

## Convenience wrappers

`showAlert(title, sub)`, for simple dismissable notifications. Hides the cancel button.

```js
await showAlert('Time saved', 'Your entry is logged to the active task.');
```

## Multi-field layout

Fields render stacked by default. To pair two fields side-by-side, set `col: 'half'` on consecutive fields:

```js
fields: [
  { type: 'date', name: 'date', label_es: 'Fecha', label_en: 'Date', col: 'half' },
  { type: 'text', name: 'consultant', label_es: 'Consultor', label_en: 'Consultant', col: 'half' },
  // ...stacks below
]
```

The renderer groups consecutive `col: 'half'` fields into a single `.field-row` (CSS grid `1fr 1fr`). On screens narrower than 480px, the row collapses to a single column.

## Bilingual

The modal reads `lang()` (from the global language toggle) at the moment it's opened, so the appropriate `label_es` / `label_en` / `placeholder_es` / `placeholder_en` are picked. If the user toggles language while a modal is open, the modal text doesn't update, it'll be in the language that was active when the modal opened. Closing and reopening picks up the new language.

## Accessibility

The native `<dialog>` element handles:

- **Focus trap**, focus stays within the modal until it closes
- **Escape key** dismissal (resolves with `null`)
- **`inert` semantics** on the rest of the page so screen readers don't navigate away

The template's `showModal()` wrapper adds:

- Auto-focus on the first input after the dialog opens (50ms delay to avoid race with `showModal()` painting)
- Form-style submission (Enter key in any field submits the form)

## Visual design

Modals are positioned via `position: fixed; inset: 0; margin: auto;` for guaranteed centering on every browser. Dimensions:

- Default max-width: 520px (`--modal-max-width`)
- Mobile (≤ 480px): `width: calc(100% - 1rem)` so it fills the viewport edges
- Max-height: `calc(100vh - 2rem)` so tall forms scroll within the modal body

Visual elements:

- Backdrop with blur (`backdrop-filter: blur(4px)`)
- Header section with title and optional sub
- Body section with form fields (scrollable if tall)
- Action footer with Cancel + Confirm buttons (right-aligned on desktop, full-width stacked on mobile)

## Dark mode

Modals follow the global theme automatically. In dark mode:

- Backdrop opacity bumped to 0.65 (since underlying surface is already dark)
- Form inputs use `--color-surface-3` background for visual distinction
- Calendar / clock picker icons inverted via `color-scheme: dark`
- Placeholder color explicitly set for readability

## Limitations

- One modal at a time (no nested modals, by design)
- No drag-to-resize, no minimize/restore (modals are modal, not floating)
- No async field validation (HTML5 `required` only), for cross-field validation, do it in the Promise resolution and re-open the modal if invalid

## Examples used in the template

The template's own use cases, all replaced from `prompt()`/`alert()`:

- **Stop & log timer**, `info` field showing duration, `date` for backdate, `text` for consultant, `textarea` for note
- **Manual time entry**, `select` for task, `date` + `text` (consultant) on a half-half row, `time` + `time` for start/end on another half-half row, `number` for fallback minutes, `textarea` for note
- **Change active task**, single `select` field
- **New task**, `text` for name, `select` + `select` half-half for category and milestone, `text` for owner, `textarea` for description

These five patterns cover virtually every form interaction the dashboard needs.
