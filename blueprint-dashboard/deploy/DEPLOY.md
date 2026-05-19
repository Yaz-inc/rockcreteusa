# Deployment, Rockcrete USA Website Rebuild Blueprint

Two deploy targets are supported out of the box: **Vercel** (default, lightest) and **Vultr / VPS** (full control, multi-tenant). Pick one per engagement.

## Decision tree, Vercel vs. Vultr

| Use Vercel Hobby when... | Use Vultr / VPS when... |
|---|---|
| Pre-kickoff, discovery, or a small engagement. | Paid commercial work that doesn't fit Vercel Hobby's terms. |
| Internal sections can be gated cosmetically (URL param + localStorage). | Internal sections need real auth (htpasswd / OAuth / SSO). |
| One project, one client, one URL. | Multi-tenant: many client subfolders on one host. |
| Zero server maintenance. | Full control over nginx, headers, auth, cache. |

Default: **Vercel.** When the engagement outgrows Hobby (commercial, real auth, multi-tenant, custom server logic), migrate to Vultr.

- Vercel guide: [VERCEL.md](VERCEL.md)
- Vultr / VPS guide: this file (everything below).

## TL;DR, Vultr publish a change

```bash
bash blueprint-dashboard/deploy/deploy.sh
```

Idempotent. Takes a few seconds. If the live file already matches the local file, it is a no-op.

To auto-publish on every save while editing:

```bash
bash blueprint-dashboard/deploy/watch-and-deploy.sh
```

Polling watcher (no Homebrew dependency). Ctrl+C to stop. Leave it running in a Terminal window while you edit.

## First-time setup

If your VPS is fresh, run the bootstrap script (review it first; it is a root-level setup script):

```bash
bash blueprint-dashboard/deploy/vps-bootstrap.sh
```

This creates a `deploy` user, web root, nginx vhost, optional basic-auth, UFW firewall, fail2ban, and log rotation.

Then on your machine:

1. Copy `.env.example` to `.env`.
2. Fill in `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH`, `DEPLOY_SSH_KEY`, `URL`.
3. Add your local public key to `/home/deploy/.ssh/authorized_keys` on the VPS.
4. First publish: `bash deploy/deploy.sh`.

## Architecture

```
┌─────────────────────┐    edit     ┌──────────────────────────┐
│  Local source       │  ────────►  │ blueprint-dashboard/     │
│  (Cowork, Cursor,   │             │   index.html             │
│   any editor)       │             │                          │
└─────────────────────┘             └──────────┬───────────────┘
                                               │ deploy.sh
                                               │ (or watch-and-deploy.sh
                                               │  on every save)
                                               ▼
                                    ┌──────────────────────────┐
                                    │  rsync over SSH (key)    │
                                    │  + atomic .new → rename  │
                                    │  + sha256 verification   │
                                    │  + cache headers         │
                                    └──────────┬───────────────┘
                                               ▼
┌──────────────────────────────────────────────────────────────┐
│  VPS (e.g. Vultr, DigitalOcean, Hetzner)                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ /var/www/rockcreteusa-website-rebuild/index.html                    │  │
│  │ owner: deploy:www-data  perms: u=rwX,g=rX,o=rX          │  │
│  └────────────────────────────────────────────────────────┘  │
│                              ▲                                │
│                  nginx vhost (port 80 + 443)                  │
│                  + TLS (Cloudflare Origin Cert or             │
│                    Let's Encrypt)                             │
│                  + (optional) HTTP basic auth                 │
│                  + noindex / robots Disallow:/                │
└──────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTPS (Cloudflare Full mode if proxied)
                              │
                          https://rockcreteusa.projectizer.ai/
```

## Files in this folder

| File | Purpose | When to use |
|---|---|---|
| `deploy.sh` | Idempotent push of `index.html` → VPS | Every time you publish |
| `watch-and-deploy.sh` | Auto-publish daemon; runs `deploy.sh` whenever the source file changes | While actively editing |
| `vps-bootstrap.sh` | One-time VPS setup (root-level) | Provisioning a new VPS or onboarding a new client subfolder |
| `.env` | Local config (deploy host, SSH key path, target URL) | Already configured; never commit to git |
| `.env.example` | Template for `.env` | Reference |
| `github-actions-deploy.example.yml` | CI workflow if you prefer GitHub Actions over the local script | Optional |
| `DEPLOY.md` | This document | Read this |

## How it works under the hood

`deploy.sh`:

1. Sources `.env` (deploy user, host, key path, target path).
2. Verifies the source file exists and is bigger than 10 KB (guard against accidental clobbering with an empty file).
3. SSHes to the VPS, computes the SHA-256 of the live `index.html`, compares to local. **Skips if match.**
4. If different, `rsync -avz --checksum` to `index.html.new` on the VPS, then `mv index.html.new index.html` (atomic; readers always see a complete file).
5. `curl` HEAD on the public URL and asserts HTTP 200 or 401 (401 means basic-auth gate, expected during staging).
6. Logs the deploy server-side to `/var/www/rockcreteusa-website-rebuild/.deploy.log`.

`watch-and-deploy.sh`:

- Detects `fswatch` (event-driven) or falls back to a stdlib polling loop (`stat -f %m` / `stat -c %Y`).
- Debounces a burst of saves (2-second window) so you only get one deploy per save run.
- Single-flight lock at `/tmp/rockcreteusa-website-rebuild-deploy.lock` prevents overlapping deploys.
- Runs an initial deploy on start so on-screen state matches production.
- Logs to `.watch.log` next to the script.

## Common tasks

### Rotate the basic-auth password

```bash
ssh root@$DEPLOY_HOST
htpasswd -b /etc/nginx/.htpasswd-rockcreteusa-website-rebuild rockcreteusa-website-rebuild 'NEW_PASSWORD_HERE'
```

### Remove basic auth (when going public post-launch)

```bash
ssh root@$DEPLOY_HOST
sed -i 's/^[[:space:]]*auth_basic/    # &/' /etc/nginx/sites-available/rockcreteusa-website-rebuild.conf
nginx -t && systemctl reload nginx
```

### Add a new client subfolder (multi-tenant pattern)

```bash
ssh root@$DEPLOY_HOST
NEW=clientb
mkdir -p /var/www/blueprint/$NEW
chown deploy:www-data /var/www/blueprint/$NEW
htpasswd -c /etc/nginx/.htpasswd-$NEW $NEW   # set their password
# Then add a `location /blueprint/$NEW/ { ... }` block to the nginx vhost,
# mirroring the existing one.
nginx -t && systemctl reload nginx
```

### Purge Cloudflare cache (if applicable)

```bash
CF_TOKEN=$(cat ~/.cloudflare-token)
curl -X POST "https://api.cloudflare.com/client/v4/zones/{{CLOUDFLARE_ZONE_ID}}/purge_cache" \
  -H "Authorization: Bearer $CF_TOKEN" -H "Content-Type: application/json" \
  --data '{"prefixes":["{{DASHBOARD_HOST}}/rockcreteusa-website-rebuild/"]}'
```

### Roll back to the previous version

There is no built-in rollback in `deploy.sh`; it only ever has one version live. To recover an earlier version: open an earlier copy of `index.html` (Git history, your local backup), then run `deploy.sh` against it.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `ssh: connect to host ... port 22: Operation timed out` | `.env` set `DEPLOY_HOST` to a Cloudflare-proxied hostname (port 22 doesn't reach the origin) | Use the direct VPS IP in `.env` |
| `Permission denied (publickey)` to `deploy@...` | Local SSH key missing or pointed at wrong path in `.env` | Verify `cat ~/.ssh/id_*.pub` exists and matches `/home/deploy/.ssh/authorized_keys` on the VPS |
| `HTTP 526` from Cloudflare | Origin cert expired or zone is in Full Strict but origin presents self-signed | Verify cert; switch zone to `full` if not strict-ready |
| `HTTP 401` after deploying | Basic auth still enabled, expected during staging | Use the credentials from your secrets store |
| Deploy reports "nothing to do" | Local file is byte-identical to the live one | Not an error, script is idempotent |

## What is intentionally NOT part of this pipeline

- **GitHub Actions / CI by default.** The default flow is direct from your local edit to the VPS, no CI step. If you want CI-driven deploys, see `github-actions-deploy.example.yml` and wire it up. For most consulting engagements the direct flow is faster and avoids CI cost.
- **Versioning the dashboard HTML in Git history.** The dashboard's source file IS in Git (`blueprint-dashboard/index.html`), but the deploy script does not depend on Git state. You could deploy a working draft that is not yet committed; that is fine for staging.
- **Multiple environments.** The default model is one staging URL behind basic auth, going public when the engagement launches. If you need separate staging and production URLs, duplicate the `location` block in the nginx vhost and the `.env` file.

## Credentials and ownership

Credentials live in `.env` (git-ignored) and your VPS-side secrets manager. Never commit them.

Recommended layout:

- `.env` (this folder, git-ignored) for SSH and target details.
- `~/.cloudflare-token` (mode 600, outside the repo) for Cloudflare API token.
- VPS root password in your team's secrets manager (1Password, Bitwarden, etc.).
