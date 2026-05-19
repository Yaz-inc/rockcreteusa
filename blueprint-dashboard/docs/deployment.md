# Deployment

How to host the dashboard for real client use.

## The deployment shape

Because the dashboard is a static single-page artifact, deployment is unusually simple compared to typical web apps. There is no server runtime to maintain, no database to back up (in the v0.1.0 model), no build pipeline to manage.

For a typical engagement:

```
Internet ─► HTTPS reverse proxy (Caddy / nginx)
              │
              ├── /                 →  serves dashboard/index.html
              ├── /telemetry/*.json →  serves dashboard/telemetry/
              └── /customizations/* →  serves customizations/
              │
              └── (optional) basic-auth or OAuth gate in front of /
```

The reverse proxy handles HTTPS, optional auth gating, and serves the static files. Total cost: a $4–8/month VPS (Vultr / Hetzner / DigitalOcean basic droplet) or a Cloudflare Pages / Netlify / Vercel free tier deployment.

## Recommended hosts

| Option | Cost | Pros | Cons |
|---|---|---|---|
| **Cloudflare Pages / Netlify / Vercel** | Free | Zero ops, automatic HTTPS, global CDN, instant deploys | Less control over auth, harder to add a backend later, log retention is per-tier |
| **Vultr / Hetzner / DigitalOcean VPS** | $4–8/month | Full control, can later add a backend on the same box, easy to put behind a corporate VPN | Have to manage the OS, install nginx/Caddy, configure HTTPS |
| **Client's intranet** | varies | No public internet exposure, leverages client's existing identity system | Coordinating with client IT can take weeks |

Default choice: **VPS with Caddy** unless the client specifically requires intranet hosting. Caddy auto-handles HTTPS via Let's Encrypt with one config line.

## Caddy deployment (recommended)

Install Caddy on the VPS:

```
apt install caddy   # Debian/Ubuntu
```

`/etc/caddy/Caddyfile`:

```
bitacora.your-firm.com {
    root * /srv/dashboard
    file_server
    encode gzip zstd

    # Optional: basic-auth in front of /panel-only routes
    @internal path /telemetry/* /customizations/*
    basicauth @internal {
        admin $2a$14$<bcrypt-hashed-password>
    }

    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Frame-Options DENY
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
        Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.tailwindcss.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:;"
    }
}
```

Then `systemctl reload caddy`. HTTPS provisions automatically on first request.

## nginx deployment (alternative)

`/etc/nginx/sites-available/dashboard`:

```
server {
    listen 443 ssl http2;
    server_name bitacora.your-firm.com;

    ssl_certificate     /etc/letsencrypt/live/bitacora.your-firm.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bitacora.your-firm.com/privkey.pem;

    root /srv/dashboard;
    index index.html;

    location /telemetry/ {
        auth_basic "Internal";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }

    location / {
        try_files $uri $uri/ =404;
    }

    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options DENY always;
}

server {
    listen 80;
    server_name bitacora.your-firm.com;
    return 301 https://$host$request_uri;
}
```

Use `certbot --nginx` to provision the certificate.

## File deployment

Two clean options:

1. **rsync from local**, `rsync -avz --delete dashboard/ user@vps:/srv/dashboard/`
2. **Git pull on the VPS**, clone the engagement repo to `/srv/dashboard-repo`, set `root` in Caddy/nginx to `/srv/dashboard-repo/dashboard`, and run `git pull` (manually or via cron) to update.

For more discipline, set up a tiny CI step (GitHub Actions, GitLab CI) that pushes to the VPS on every merge to `main`. Two lines of YAML:

```yaml
- name: Deploy
  run: rsync -avz --delete dashboard/ ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:/srv/dashboard/
```

## Auth in front of the dashboard

For client-tier users (funders, leadership), basic-auth is acceptable but weak. Better options in increasing strength:

1. **Basic-auth**, fast, no infra; share the password securely with the client
2. **Cloudflare Access**, free for under 50 users, integrates with most identity providers; no code change needed
3. **Authentik / Authelia**, self-hosted, supports OIDC/SAML
4. **Auth.js v5 with TOTP MFA**, requires a small Node backend, but gives the most control

For admin-tier users (the consulting team), MFA is mandatory in production. Options:

1. **Authentik / Authelia + TOTP**
2. **Cloudflare Access + WebAuthn**

The current preview has no auth, it relies on URL secrecy. **Do not deploy without auth if the data is real.**

## Backup

Static files: backed up via Git already. The deployment is reproducible from the repo.

`tasks.json` and `panel-interno-telemetry.json` are the only mutable state. Recommended backup pattern:

1. CI commits the latest `tasks.json` to the engagement repo nightly
2. The VPS' own snapshot/backup feature covers any other state

If the dashboard later gains a real backend (Postgres), apply the standard backup discipline (daily logical dumps + WAL archiving for PITR).

## Logs

For audit / compliance:

- **Caddy access logs**, `log` directive in the Caddyfile, written to `/var/log/caddy/`
- **nginx access logs**, `access_log` directive
- Both should be retained per the engagement's compliance policy (often 7 years for World Bank-funded work)
- Ship logs to a central log aggregator (Loki, ELK, Grafana Cloud, Logtail) for queryability

## Performance posture

The dashboard is small, first-paint is well under 1 second on a typical connection. Optimization rarely needed, but if a deployment is on a high-latency link:

- Enable Caddy's `encode gzip zstd` (above)
- Set far-future cache headers on the static assets
- Self-host the Tailwind and Lucide CDN scripts to remove DNS lookups
- Inline critical CSS (already done, all CSS is inline in the HTML)

## Health check / uptime monitoring

A trivial `curl` check on the homepage is sufficient. UptimeRobot, BetterStack, or any equivalent service will alert you if the dashboard goes down. Free tiers cover a single endpoint check at 5-minute intervals, fine for this workload.

## Updating the dashboard

When you ship a new version of the engagement-specific dashboard:

1. Commit changes to the engagement repo
2. CI deploys to the VPS automatically
3. Tell the client (a one-line email), they're now on the new version on next refresh

When you ship a new version of the **template** itself (this folder pushed to its own repo), engagements that use the template as a Git submodule:

1. `git submodule update --remote` in the engagement repo to pull the new template
2. Resolve any conflicts in `customizations/CLIENT-overrides.css`
3. Test, then deploy

For engagements that vendored a copy of the template (no submodule), the upgrade is manual: cherry-pick the changes you want from the template's CHANGELOG.

## Decommissioning

When an engagement ends:

1. Take a final snapshot of `tasks.json` and `panel-interno-telemetry.json` and commit them to the repo
2. Generate a final PDF / HTML export of the dashboard for the client's records (run `wkhtmltopdf` or just print-to-PDF from Chrome)
3. Tear down the VPS or unhost the deployment
4. Archive the engagement repo (mark read-only)

The dashboard is the deliverable. The dashboard's source code, the data, and the documentation should outlive the deployment.
