# INSTALL, Bootstrap a new engagement from this template

This guide takes about **45 minutes** end-to-end. At the end you'll have a working dashboard for a new client at a clean URL.

## Prerequisites

- A web browser (Chrome, Safari, Firefox, any modern version)
- Python 3 (only needed for the telemetry extraction script, comes pre-installed on macOS and Linux)
- A text editor (VS Code, Sublime, even TextEdit works)
- A hosting target, for production: a small VPS (Vultr / DigitalOcean / Hetzner). For internal review: just `python3 -m http.server` locally
- Optional: a Git provider account if you'll be tracking changes per engagement

## Step 1, Copy the template into the new client folder

```
cp -R project-blueprint-template/   "Clients/NEW_CLIENT_NAME/dashboard-blueprint/"
cd "Clients/NEW_CLIENT_NAME/dashboard-blueprint/"
```

Or do it in Finder. The point is to fork the template into a per-engagement copy.

## Step 2, Edit the brand layer (5 minutes)

Open `dashboard/index.html`. Find the `THEME TOKENS` block near the top of the `<style>` section. Edit only:

| Variable | What it controls | Default |
|---|---|---|
| `--color-brand` | primary color: links, primary buttons, active nav, KPI accents | deep slate-blue `#1e3a5f` |
| `--color-brand-2` | hover variant of brand | `#14283f` |
| `--color-brand-soft` | subtle tints (badge backgrounds, brand highlights) | `#e2e8f0` |
| `--color-accent` | secondary accent for emphasis (used sparingly) | warm amber `#b45309` |
| `--font-display` | hero serif headlines | Source Serif 4 |
| `--font-body` | everything else | Inter |

If the client has provided a brand color, drop it into `--color-brand` and adjust `--color-brand-2` and `--color-brand-soft` to harmonize. If not, the defaults work as a generic professional palette.

## Step 3, Replace placeholder text (15 minutes)

Search and replace in `dashboard/index.html`:

| Find | Replace with |
|---|---|
| `[Programa] · Blueprint` (or any prior engagement's title in `<title>`) | `Rockcrete USA Website Rebuild · Blueprint` |
| `Foundation` (when referring to the design system in user-facing copy) | leave it, that's the system's own name |
| Any prior engagement's name, deliverable codes (`E1.x`), or seeded sample content | swap with your engagement's equivalents |

The dashboard's body content is split across screens (Inicio, Panel Interno, plus placeholder routes). Replace the sample content on Inicio with your engagement's narrative. The Panel Interno content is data-driven, it'll repopulate from your telemetry JSON automatically.

Every text node carries `data-es` and `data-en` attributes. **Edit both.** If your engagement is single-language, just put the same text in both attributes, keeps the toggle harmless.

## Step 4, Seed the data files (10 minutes)

Open `dashboard/telemetry/`:

1. **`tasks.json`**, copy `tasks.example.json` to `tasks.json` and edit:
   - Replace the example milestones with your engagement's actual milestones (with start/end dates and deliverable codes)
   - Replace the seed task with one called something like "Project setup and mobilization"
   - Update the `_meta.rates.human_hourly_usd` to your blended consultant rate
   - Update `_meta.categories` if your discipline uses different category names

2. **`panel-interno-telemetry.json`**, copy `panel-interno-telemetry.example.json` to `panel-interno-telemetry.json`. The first time you run a real Cowork session for the new engagement, run `python3 telemetry/extract-telemetry.py /path/to/your/session.jsonl` to overwrite this with real numbers. Until then, the example file makes the panel render with sample data so you can demo it.

## Step 5, Run it locally to verify

```
cd dashboard/
python3 -m http.server 8765
```

Open `http://127.0.0.1:8765` in Chrome. You should see:

- The dashboard rendering with your brand color
- The bilingual toggle working (top right)
- The light/dark/auto theme toggle working
- The Panel Interno populated with your seed/example telemetry
- Adding a manual time entry persists across reload (via `localStorage`)

## Step 6, Deploy to a real URL (production)

For internal client demos, the local server above is enough. For a permanent URL:

1. Provision a small VPS (the dashboard is static, even a $4/month box is overkill)
2. Install `nginx` and serve the `dashboard/` folder
3. Point a subdomain at it (e.g. `bitacora.client-name.com` or a path under your firm's domain)
4. Add HTTPS via Let's Encrypt
5. (Recommended) Put a basic-auth or OAuth gate in front, the Panel Interno is consultant-only and shouldn't be on a public URL

Detailed nginx config + Let's Encrypt walkthrough: [docs/deployment.md](docs/deployment.md)

## Step 7, Wire up your Git source-of-truth

Push the per-engagement copy to its own Git repo. The discipline that pays off:

- Commit the `tasks.json` after every meaningful update so milestone progress is auditable
- Commit each new `panel-interno-telemetry.json` extraction so AI cost over time is plottable
- Run a small CI step that re-deploys to the VPS on every push to `main`

## Step 8, Optional: per-client overrides without touching the template

If you keep the template as a Git submodule (or a vendored copy), put per-client CSS overrides in `customizations/CLIENT_NAME-overrides.css` and load it after the template's stylesheet. That way the template can be updated upstream without losing client-specific tweaks.

See [customizations/README.md](customizations/README.md) for examples.

## Common questions

**Q: Can I change the layout (sidebar position, topbar contents)?**
A: Yes. The HTML is plain semantic markup. Edit `<aside class="sidebar">` and `<header class="topbar">` directly. The CSS adapts via custom properties, `--sidebar-w` controls width, for example.

**Q: Can I add new screens beyond the seeded ones?**
A: Yes. Each screen is a `<div class="screen" id="screen-NAME">…</div>` inside `<main>`. Add a corresponding sidebar nav link with `data-route="NAME"`. The router (`showScreen()`) handles the rest.

**Q: Can I integrate this with a real backend (Postgres, Auth0, etc.) later?**
A: Yes. The data layer is already JSON files behind a `fetch()` call. Replacing those with real API endpoints is one function rewrite. The role gating is currently client-side cosmetic, for a real backend, gate by server-side session.

**Q: Can the telemetry pipeline work with Cursor or Claude Code transcripts that aren't in Cowork?**
A: Yes. The script reads JSONL transcripts. Point it at any transcript file with a similar shape, the parser is documented in [docs/telemetry.md](docs/telemetry.md).

**Q: How do I handle a client that wants single-language?**
A: Put the same text in both `data-es` and `data-en` attributes (or set both to the chosen language). Hide the language toggle button via CSS: `.lang-toggle { display: none; }`.
