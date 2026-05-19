# Security policy

## Reporting a vulnerability

If you find a security issue in this template (the dashboard, the deploy script, the init script, the CI workflows, the documented conventions), please **do not** open a public GitHub issue. Email the template owner instead, see the contact listed in the repo's `README.md`.

Include:

- A clear description of the issue.
- Steps to reproduce.
- The affected file(s) and version (template tag or commit SHA).
- Any proof-of-concept code or screenshots.

We will acknowledge receipt within 5 business days and aim to ship a fix within 30 days for high-severity issues.

## Supported versions

Only the `main` branch and the most recent tagged release receive security fixes. If you are pinning to an older tag, the fix will land in the next tag, but you will need to bump.

## Threat model for this template

This template ships:

1. A static HTML dashboard with no built-in auth (role gating is cosmetic).
2. A Bash deploy script that uses SSH and rsync.
3. A Python telemetry extractor that reads JSONL transcripts.
4. CI workflows that run shell scripts.

Concretely, the surfaces that need attention are:

- **Dashboard role gating is client-side only.** Anyone who can load the HTML can flip themselves to admin via the URL or localStorage. The Internal Panel must therefore not contain sensitive data unless the page is also gated by basic-auth, OAuth, or an auth proxy. See `blueprint-dashboard/docs/auth-and-roles.md`.
- **Deploy SSH credentials live in `.env`** (or `~/.ssh/`). `.env` is git-ignored. Never commit it. Never put it inside the dashboard folder if the dashboard is published statically.
- **Telemetry JSONL transcripts may contain prompts and secrets.** Treat them as sensitive. The extractor strips file contents and command outputs but does not redact API keys that may appear in a tool-result message. Review the extractor output before publishing.
- **CI workflows run untrusted PRs.** `lint-naming.sh` is shell. Keep it simple and self-contained. Do not add steps that fetch from arbitrary URLs.

## What's out of scope

- The content of any engagement that uses this template. Each engagement is responsible for its own threat model. The init script does not enable any defaults that would be unsafe in production.
- The hosting platform you choose (Vultr, DigitalOcean, AWS, Cloudflare Pages, etc.). Each has its own security posture.
- Third-party services the dashboard's `customizations/` may load (Google Fonts, analytics, error reporting). Audit these per-engagement.

## Hardening checklist for production deploys

Before exposing the dashboard publicly:

1. Enable HTTPS with a real TLS certificate.
2. Add an auth gate in front (basic-auth at minimum, OAuth or an auth proxy preferred).
3. Set `noindex` and `Disallow:/` in robots.txt while the dashboard is staging-only.
4. Review the dashboard's `customizations/` for any third-party `<script>` tags.
5. Disable directory listing on the web server.
6. Set security headers: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security: max-age=31536000`.
7. Rotate any deploy credentials that were in use during pre-production.
