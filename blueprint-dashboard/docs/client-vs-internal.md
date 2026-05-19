# Client-facing vs. internal sections

The Blueprint Dashboard is a single URL that serves two audiences with different visibility:

- **Guests** (the client, the funder, the public if the URL is shared): see the polished narrative, status, deliverables, results.
- **Admins** (the consultant team, the project lead): see all of the above PLUS the operational tools: kickoff agendas, dress-rehearsal checklists, raw telemetry, contract details, internal notes.

This doc explains how the dashboard implements that split and how to extend it cleanly.

## The pattern

Every node that should be hidden from guests carries the attribute `data-admin-only`:

```html
<!-- visible to everyone -->
<section class="screen" id="screen-inicio">
  <h1>Rockcrete USA Website Rebuild Blueprint</h1>
  ...
</section>

<!-- visible only to admins -->
<a class="nav-link" data-route="agenda-kickoff" data-admin-only>Agenda Kickoff</a>
<section class="screen" id="screen-agenda-kickoff" data-admin-only>
  ...
</section>
```

A single CSS rule scoped to `body.role-guest` hides every `[data-admin-only]` for guest visitors:

```css
body.role-guest [data-admin-only] {
  display: none !important;
}
```

A small JS shim stores the viewer role in **`localStorage.rockcrete_role`** as `guest` (default), `client`, `client_admin`, `webdev`, or `admin`. Choosing **Client admin**, **Web dev**, or **Admin** requires the Sign in dialog: the visitor enters the same **`BLUEPRINT_PASSWORD`** configured for Vercel Edge Middleware Basic Auth (see `middleware.js`). Verification is **`POST /api/session`** — the password is **not** embedded in static HTML. Saved **`team`** is migrated once to **`webdev`** on load.

```text
guest / client → client-style view
client_admin / webdev / admin → can edit tracker, staff notes; admin also sees data-admin-only
```

## How to escalate / de-escalate

- **Choose a role:** open **Sign in** in the top bar, enter the same password as Vercel Basic Auth (`BLUEPRINT_PASSWORD`), then **Continue as Client**, **Continue as Client admin**, **Continue as Web dev**, or **Continue as Admin**.
- **Sign out:** **Sign out** clears `localStorage.rockcrete_role` and reloads.
- **Meeting / dual screen:** sign in as **Admin**, **Web dev**, or **Client admin** on your device; leave the projector on the default **guest** session (or **Client**).

## What goes behind `data-admin-only`

Default rules of thumb:

**Always admin-only:**

- Internal Panel (raw telemetry, AI cost data, time entries, manual-entry forms).
- Kickoff agendas, meeting prep notes, "talking points".
- Dress-rehearsal checklists, pre-meeting QA checklists.
- Backup / restore tools.
- Internal tooling references (commands the team runs, not the client).
- The "Toggle role" button itself.

**Sometimes admin-only:**

- Contract details (depends on whether the engagement is fully transparent to the client).
- Stakeholder register details (yes for some projects, no for others).
- Risk register (often yes; clients see a summary but not the full register).
- Open-questions tracker that contains things you're still deciding internally.

**Always guest-visible:**

- Project overview, vision, scope.
- Phase / milestone calendar.
- Done deliverables and their acceptance evidence.
- Public KPIs and metrics.
- Team members and their roles.
- Public references and source documents.

When in doubt, default to guest-visible. The dashboard's purpose is transparency. The admin-only carve-outs are for operational tooling, not for hiding decisions.

## Caveats

**This is cosmetic gating, not security.**

- Anyone with developer tools can disable the CSS rule and see the elements.
- **`ADMIN_TOKEN` was removed** for Rockcrete USA: roles use password + **`POST /api/session`** matching **`BLUEPRINT_PASSWORD`**, not leaked query strings.
- Admin-only content is fully present in the HTML payload that ships to every visitor.

What this means in practice:

- **Do not put confidential text** behind `data-admin-only` on a publicly reachable URL. If the content is genuinely confidential (contract amounts, PII, raw client interview transcripts), gate the whole URL with real auth (Vultr+htpasswd or Vercel Edge Middleware basic-auth) before sharing.
- **The pattern works well for "polish vs. operational"**: hiding the dress-rehearsal checklist from the client because it's noise to them, not because it's secret.

## Mapping to your Vercel project

Rockcrete USA on Vercel (HTTP Basic Auth + Sign in dialog):

| Audience | Flow | What they see |
|---|---|---|
| Browser first load | HTTP Basic Auth (password = `BLUEPRINT_PASSWORD`) then default **guest/client** styling | Same as client unless they Sign in |
| Client | Sign in dialog → shared password → **Continue as Client** | Guest-visible areas; no pricing / admin tooling |
| Client admin | Same password → **Continue as Client admin** | Same tracker edit access as Web dev (assignees, staff notes); no admin-only screens |
| Web dev | Same password → **Continue as Web dev** | Same as Client admin |
| Operations lead (NMG) | Same password → **Continue as Admin** | Full dashboard including admin-only |

If you need real auth in front of the URL (e.g. the dashboard contains anything from `client-intake.md` that the client hasn't seen yet), move to Vultr+nginx+htpasswd, see `../deploy/DEPLOY.md`.

## Adding a new admin-only screen

1. Add the screen container with `data-admin-only`:
   ```html
   <section class="screen" id="screen-NAME" data-admin-only>
     ...
   </section>
   ```
2. Add the matching nav link with `data-admin-only`:
   ```html
   <a class="nav-link" data-route="NAME" data-admin-only>Section name</a>
   ```
3. (Optional) Add the screen to the help panel and Cmd+K palette with the same admin-only flag so it doesn't appear in search for guests.
4. If the screen needs admin-only behavior in JS (e.g. a button that triggers a deploy), gate the handler with `if (window.__role.isAdmin())` rather than relying on the DOM being absent.

## Quick test

After every change to an admin-only section, verify the guest view:

```js
// In the browser console
localStorage.removeItem('rockcrete_role')
location.reload()
// You should now see only the guest / default client styling.
```

Then re-escalate via **Sign in** with the blueprint password and **Continue as Admin** (or Client admin / Web dev).

## Maintenance

- Keep the admin-only set small. Every flag is a place where the client could feel something is hidden from them.
- When you add a new admin-only screen, document why it's admin-only in `docs/project-memory/decisions.md` if it's non-obvious.
- Audit the admin-only set at the end of every phase. Things that started as internal-only often graduate to client-visible as the project matures.
