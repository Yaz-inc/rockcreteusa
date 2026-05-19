# Vercel deployment, Rockcrete USA Website Rebuild Blueprint

The default and lightest deploy target for the Blueprint Dashboard. One Vercel project per client engagement, free on the Hobby plan, ships in under five minutes.

## When to pick Vercel vs. Vultr

| Use Vercel Hobby when... | Use Vultr / VPS when... |
|---|---|
| The dashboard fits the Hobby plan limits (100 GB bandwidth/mo, no commercial use). | The engagement is paid commercial work. Hobby plan terms forbid this. Move to Vercel Pro or to Vultr. |
| The "internal" content is acceptable to gate cosmetically (URL param + localStorage). | The internal content needs real auth (htpasswd, OAuth, SSO). |
| One project, one client, one URL. | Multi-tenant setup: many clients on one host, per-client subfolders. |
| You want zero server maintenance. | You want full control over nginx, the headers, the auth flow, the cache behavior. |
| Hobby plan limits feel comfortable. | You need custom server-side logic, cron jobs, larger uploads, persistent storage. |

For most consulting engagements during pre-kickoff and discovery, Vercel Hobby is the right call. Move to Vultr when the engagement scales or needs real auth.

## Conventions

| Item | Default value |
|---|---|
| Vercel project name | `rockcreteusa-blueprint` |
| Default URL (free) | `https://rockcreteusa-blueprint.vercel.app/` |
| Custom domain (optional) | `https://blueprint.rockcreteusa.com/` or a subfolder of your firm's domain |
| Source path | `blueprint-dashboard/` (the `output_directory` Vercel publishes) |
| Routing | Pure static; `index.html` at root |
| Admin gating | URL param `?admin=7c63ef71e1ba66344ddfcdf1` once, persists via localStorage |

The `vercel.json` in this folder encodes that. Read it before you push.

## One-time setup (per engagement)

### Option A: connect via the Vercel dashboard (easiest)

1. Push your engagement repo to GitHub (the template's `git push` already did this).
2. Go to [vercel.com/new](https://vercel.com/new) and **Import** the GitHub repo.
3. On the import screen:
   - **Project name:** `rockcreteusa-blueprint`
   - **Framework preset:** *Other* (no framework).
   - **Root directory:** `blueprint-dashboard`
   - **Build command:** leave empty (no build step).
   - **Output directory:** `.` (the dashboard folder itself).
   - **Install command:** leave empty.
4. Click **Deploy**. The first deploy completes in ~30 seconds.
5. Vercel assigns `https://rockcreteusa-blueprint.vercel.app/` automatically.

Every push to `main` after that auto-redeploys. PR branches get preview URLs.

### Option B: connect via the Vercel CLI

```bash
# Install once
npm i -g vercel

# Inside the engagement repo
cd blueprint-dashboard
vercel link            # pick or create the project named rockcreteusa-blueprint
vercel deploy          # deploy a preview
vercel --prod          # promote to the production URL
```

The CLI reads `vercel.json` and inherits the same routing as Option A.

## vercel.json

The committed `vercel.json` (next to this file) configures:

```json
{
  "version": 2,
  "buildCommand": null,
  "installCommand": null,
  "outputDirectory": ".",
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }
      ]
    }
  ]
}
```

Key choices:

- **`buildCommand: null`**: no build step. Vercel uploads files as-is.
- **`outputDirectory: "."`**: Vercel publishes the folder you set as Root Directory.
- **`cleanUrls: true`**: `/foo` maps to `/foo.html` if it exists. We use one `index.html`, but the convention is set up if you split later.
- **`rewrites`**: every URL serves `index.html`. The dashboard is single-page; the hash router handles routing client-side.
- **Security headers**: same set the Vultr nginx config installs.
- **`Cache-Control` on index.html**: deploys go live immediately; CDN doesn't pin an old copy.

## Admin / internal gating on Vercel Hobby

Vercel Hobby does not have built-in password protection. The Blueprint dashboard handles "admin-only" content cosmetically:

1. The dashboard reads `?admin=<token>` from the URL.
2. If it matches `7c63ef71e1ba66344ddfcdf1` (set in `index.html`'s `__role` configuration), the page sets `localStorage.aquaflow_role = 'admin'` and reloads cleanly.
3. While `aquaflow_role === 'admin'`, the CSS rule `body.role-guest [data-admin-only] { display: none; }` is disabled and admin sections become visible.

This is **cosmetic only**. Do not put secrets, contracts, or PII inside `[data-admin-only]` sections on a public Vercel deployment. Cosmetic gating just hides things from a casual visitor; anyone with developer tools can disable the CSS and see the elements.

If the engagement needs real protection, either:

- Upgrade to Vercel Pro and use Password Protection (a $20/mo flag on the project), or
- Add a Vercel Edge Middleware that checks for a header / cookie before serving HTML, or
- Move to Vultr with htpasswd (see `DEPLOY.md`).

See `blueprint-dashboard/docs/client-vs-internal.md` for the full pattern.

## Custom domains (optional)

To use a real domain instead of `*.vercel.app`:

1. Settings → Domains in the Vercel project.
2. Add `blueprint.rockcreteusa.com` (or any subdomain on a domain you control).
3. Vercel shows the DNS record (CNAME `cname.vercel-dns.com` typically). Add it at your DNS provider.
4. Vercel issues a Let's Encrypt cert automatically; live in ~30 seconds.

Many engagements skip the custom domain and just use the `.vercel.app` URL. Both are HTTPS by default.

## Preview deploys (automatic)

Every PR branch gets a unique preview URL: `https://rockcreteusa-blueprint-git-<branch>-<team>.vercel.app/`. Useful for sharing draft dashboard updates with the client before merging to `main`.

## Re-deploys

Auto: every push to `main` triggers a redeploy. Done.

Manual: `vercel --prod` from the dashboard folder.

If you only edit content in the project memory or other parts of the repo (not the dashboard), no redeploy fires.

## Removing the deploy

When the engagement closes:

1. Vercel dashboard → project → Settings → Advanced → Delete Project.
2. Or: `vercel projects rm rockcreteusa-blueprint` from the CLI.
3. The `.vercel.app` URL stops resolving immediately.

If you used a custom domain, remove the DNS record at your DNS provider first to avoid a stale CNAME.

## Common issues

| Symptom | Fix |
|---|---|
| Vercel deploys but the dashboard 404s on subpaths | Check `vercel.json` rewrites; the `(.*)` rewrite catches every path. |
| Headers not applied | Vercel applies `headers` from `vercel.json` only on production deploys, not preview. Check on the prod URL. |
| Hobby plan bandwidth alert | Move to Vultr or upgrade to Pro. Hobby is 100 GB/mo. |
| Edge functions / middleware require Pro? | Edge Middleware is available on Hobby with limits. Check Vercel's current pricing page. |
| Custom domain shows "verifying" forever | DNS record not propagated. Check `dig CNAME blueprint.rockcreteusa.com`. |

## Security posture

The same posture as the VPS path:

- HTTPS everywhere (Vercel forces it).
- HSTS header set in `vercel.json`.
- `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` set.
- No secrets in client-side code.
- Admin gating is cosmetic; do not rely on it for confidentiality.

## What is NOT covered

- **Server-side persistence.** The dashboard's `tasks.json` and `panel-interno-telemetry.json` are read-only at runtime. Edits via the dashboard's manual-entry UI persist to localStorage only. To persist multi-user state, swap to Vultr+backend or Vercel+Postgres+API routes (a different pattern than this template ships).
- **Email sending, scheduled jobs.** Vercel Hobby does not run cron. Use a separate scheduler (Cron-job.org, GitHub Actions cron, or Vultr cron) if needed.
- **File uploads.** Hobby has 4.5 MB request limits. The dashboard does not need uploads at runtime, but if you add one, plan for the limit.

## When you outgrow Vercel

The migration to Vultr is mechanical:

1. Spin up the VPS via `blueprint-dashboard/deploy/vps-bootstrap.sh`.
2. Copy `blueprint-dashboard/deploy/.env.example` to `.env` and fill in.
3. `bash blueprint-dashboard/deploy/deploy.sh` to push.
4. Update DNS to point to the VPS (or keep both during a cutover window).
5. Delete the Vercel project once verified.

The dashboard HTML doesn't change; only the host changes.
