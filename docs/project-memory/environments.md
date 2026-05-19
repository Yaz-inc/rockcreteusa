# Environments, Rockcrete USA Website Rebuild

Where each surface lives, what changes between them, and how to move between them. Read this before pushing anything to a URL.

**Last updated:** 2026-05-15

## The three surfaces (per `context-index.md`)

| Surface | Purpose | Change cadence |
|---|---|---|
| Git (https://github.com/newmindsgroup/rockcreteusa-project-blueprint) | Code, durable docs, ADRs. | Every commit. |
| Drive (rockcreteusa-website-project) | Non-technical artifacts, contracts, raw research, large binaries. | When humans add or move artifacts. |
| Live dashboard (https://rockcreteusa.projectizer.ai/) | The Blueprint Dashboard. Public face of the project. | On every push to main (Vercel) or every `deploy.sh` run (Vultr). |

## Hosting target

- **Hosting:** vercel (vercel | vultr)
- **Vercel project name:** rockcreteusa-blueprint (if vercel)
- **VPS hostname / IP:** {{DEPLOY_HOST}} (if vultr)
- **Custom domain (if any):** {{DASHBOARD_CUSTOM_DOMAIN}}

If hosting is `vercel`, see `blueprint-dashboard/deploy/VERCEL.md`. If `vultr`, see `blueprint-dashboard/deploy/DEPLOY.md`.

## Environments

This project uses {{ENVIRONMENT_COUNT}} environment(s).

### Production

- **URL:** https://rockcreteusa.projectizer.ai/
- **Branch:** `main`
- **Auto-deploy:** {{PROD_AUTO_DEPLOY}} (yes for Vercel, manual `deploy.sh` for Vultr default)
- **Auth:** {{PROD_AUTH}} (cosmetic / basic-auth / OAuth / SSO)
- **Robots:** {{PROD_ROBOTS}} (indexable / `Disallow: /`)
- **Audience:** {{PROD_AUDIENCE}} (everyone with the URL / authenticated only)

### Preview / staging (optional)

For projects that need a separate staging URL:

- **URL:** {{STAGING_URL}}
- **Branch:** `develop` (or auto-generated per PR on Vercel)
- **Auto-deploy:** yes
- **Auth:** typically basic-auth or `noindex` while pre-launch
- **Audience:** team only

If you don't have a staging environment, every PR on Vercel still gets a unique preview URL automatically (`*-git-<branch>.vercel.app`). That's often enough for review.

### Local

- **URL:** http://127.0.0.1:8765 (or whatever port `python3 -m http.server 8765` picks)
- **Auth:** none
- **Audience:** the developer running it
- **Run with:**
  ```bash
  cd blueprint-dashboard
  python3 -m http.server 8765
  ```

## Promotion path

```
local       (developer's machine)
   |
   | git commit + push
   v
preview     (Vercel preview URL on branch / PR)
   |
   | merge to main
   v
production  (https://rockcreteusa.projectizer.ai/)
```

If on Vultr, the path is:

```
local
   |
   | bash blueprint-dashboard/deploy/deploy.sh
   v
production
```

(Vultr has no preview by default. Add a separate vhost subfolder if you want one.)

## What changes between environments

| Setting | Local | Preview | Production |
|---|---|---|---|
| Robots | n/a | `noindex` | {{PROD_ROBOTS}} |
| Cache headers | none | short | {{PROD_CACHE}} |
| Telemetry data | example fixtures | example fixtures | latest extracted |
| Admin token | hardcoded for testing | hardcoded for testing | 7c63ef71e1ba66344ddfcdf1 (cosmetic) |
| Custom domain | n/a | `.vercel.app` | {{DASHBOARD_CUSTOM_DOMAIN}} or `.vercel.app` |

## Secrets per environment

Secrets and credentials by environment. None of these go in Git.

| Secret | Local | Preview | Production | Stored where |
|---|---|---|---|---|
| Deploy SSH key | `~/.ssh/id_*` | n/a (Vercel handles) | VPS-side `authorized_keys` | local + your secrets manager |
| Cloudflare API token | n/a | n/a | `~/.cloudflare-token` | local + secrets manager |
| Admin token (cosmetic) | in HTML | in HTML | in HTML | in HTML; cosmetic only |
| Real auth credentials (if used) | n/a | n/a | server-side (htpasswd / Vercel env) | secrets manager |

## DNS

| Hostname | Provider | Record type | Value | TTL |
|---|---|---|---|---|
| {{DASHBOARD_HOST}} | {{DNS_PROVIDER}} | {{DNS_TYPE}} | {{DNS_VALUE}} | {{DNS_TTL}} |

If using Cloudflare in front of a VPS, ensure the proxy mode (orange cloud) is set correctly. SSH does not work through proxied A records; either disable proxy on a separate `ssh.{{DASHBOARD_HOST}}` record or use the VPS IP directly for SSH.

## Health checks

After every deploy, verify production:

```bash
curl -I https://rockcreteusa.projectizer.ai/
# Expect HTTP 200 (or 401 if auth-gated). Any other code is a failure.

curl -s https://rockcreteusa.projectizer.ai/ | grep -c '<title>'
# Should be 1.
```

For Vercel, also check: `vercel project ls` shows the project, and `vercel deployments ls --prod` shows the latest production deploy succeeded.

## Disaster recovery

If production is broken:

1. **Vercel:** dashboard → Deployments → find the last green production deploy → "Promote to Production". Live in under a minute.
2. **Vultr:** open the prior `index.html` (Git history or local backup) and re-run `bash blueprint-dashboard/deploy/deploy.sh`. The atomic `.new` → rename means no half-deployed state is exposed.

Then investigate root cause and document in `decisions.md` if it indicates a process gap.

## Maintenance

- Update this file when adding a new environment, a new secret, or a new DNS record.
- Audit secrets quarterly; rotate any that are older than 12 months.
- After any DNS change, retest with `dig` from outside your network (e.g. via Cloudflare's `1.1.1.1` resolver) to verify propagation.
