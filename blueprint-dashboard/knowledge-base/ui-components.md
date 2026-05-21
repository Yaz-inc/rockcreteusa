# UI Components & Design System

## Typography

- **Font Family**: DM Sans (Google Fonts)
- **Loaded via**: `<link>` in `<head>`
- **Weights**: 400, 500, 700

## Color System

### Light Theme (`:root`)
```css
--color-primary: #0d5b54;    /* Teal green */
--color-accent: #e96d1f;     /* Orange */
--color-bg: #f5f5f0;         /* Warm off-white */
--color-surface: #ffffff;     /* Card backgrounds */
--color-text: #1a1a1a;       /* Primary text */
--color-text-muted: #666;    /* Secondary text */
--color-border: #e0ddd6;     /* Borders */
```

### Dark Theme (`[data-theme="dark"]`)
```css
--color-bg: #121212;
--color-surface: #1e1e1e;
--color-text: #e0e0e0;
--color-text-muted: #999;
--color-border: #333;
```

### Status Colors
```css
--done: #22c55e;           /* Green */
--in_progress: #3b82f6;   /* Blue */
--waiting_client: #f59e0b; /* Amber */
--not_started: #9ca3af;   /* Gray */
--ready_review: #a855f7;  /* Purple */
```

## Layout

### App Structure
```
┌─────────────────────────────────────────────┐
│ Topbar (fixed, 56px height)                 │
├─────────┬───────────────────────────────────┤
│ Sidebar │ Main Content (.screen)            │
│ (240px) │                                   │
│         │                                   │
└─────────┴───────────────────────────────────┘
```

### Responsive Breakpoints
- `1024px`: Sidebar collapses to off-canvas
- `768px`: Cards stack vertically
- `480px`: Compact mobile layout

## Key Components

### Login Gate (`.rc-login-gate`)
Full-screen overlay with 2 columns:
- Left: Login form (`.rc-login-left`)
- Right: Project info (`.rc-login-right`)
- Hidden via `[data-hidden]` attribute when authenticated

### Topbar (`.topbar`)
- Nav toggle button
- Brand logo + name + V18 badge
- Search button
- Dark mode toggle
- User dropdown

### Sidebar (`.sidebar`)
- Navigation groups: Project Basics, Phases of Work, What We're Building, etc.
- Active state via `.active` class
- Responsive: drawer on mobile
- Items filtered by `moduleAccess` permissions

### Cards & Surfaces
```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}
```

### KPI Cards (`.tracker-kpi`)
Grid layout (4 columns on desktop) showing:
- Label (small, muted)
- Value (large, bold)
- Sub-text (detail)

### Phase Cards (`.tracker-phase-card`)
Progress bar + task counts per phase.

### Status Badges (`.badge`)
Color-coded by status:
- `.badge--done`: Green
- `.badge--in-progress`: Blue
- `.badge--waiting`: Amber
- `.badge--not-started`: Gray

### Modal (`.modal-overlay`)
Generic modal with `showModal(title, body)` function.
- Backdrop blur
- Close on backdrop click or Escape key

### Toast Notifications
`.toast` positioned bottom-right, auto-dismiss after 3s.
Severity levels: info, success, warning, error.

## Theme Toggle

```javascript
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('rockcrete_theme', theme);
}
```

Toggle button in topbar switches between `'light'` and `'dark'`.

## Language System

Bilingual support (English/Spanish):
```javascript
function setLang(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-en][data-es]').forEach(el => {
    el.textContent = el.getAttribute('data-' + lang);
  });
}
```

Elements with `data-en="English text"` and `data-es="Spanish text"` attributes are auto-translated.

## Admin-Only UI

Elements with `[data-admin-only]` attribute are shown only for admin+ roles:
```css
[data-admin-only] { display: none; }
/* Shown when role is admin via JS: el.style.display = '' */
```

## Icon System

- **Library**: Lucide Icons v0.460.0
- **Loaded via**: CDN (`<script defer>`)
- **Usage**: `<i data-lucide="icon-name"></i>`
- **Initialization**: `lucide.createIcons()` on DOMContentLoaded and after dynamic renders
