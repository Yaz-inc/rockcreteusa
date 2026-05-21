# Deployment Guide

## Vercel Configuration

### Project: `rockcreteusa-v18`
- **URL**: https://rockcreteusa-v18.vercel.app/
- **Branch**: `main`
- **Framework**: None (static + serverless functions)
- **Root Directory**: `blueprint-dashboard/`

### vercel.json

Located at `blueprint-dashboard/vercel.json`. Key configuration:

- **Rewrites**: SPA routing — all non-file, non-API requests rewrite to `/index.html`
- **Headers**: Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- **Functions**: API routes use Node.js 18.x runtime

### Environment Variables (Vercel Dashboard)

| Variable | Description | Set In |
|----------|-------------|--------|
| `SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server-side access | Production, Preview, Development |
| `SESSION_SECRET` | Random string for HMAC session signing | Production, Preview, Development |

> ⚠️ `BLUEPRINT_PASSWORD` has been removed. Auth is handled by the user management system.

### Deploy Commands

```bash
# Deploy to production (from blueprint-dashboard/)
npx vercel --prod --token <VERCEL_TOKEN>

# Force deploy (skip cache)
npx vercel --prod --force --token <VERCEL_TOKEN>

# Check deployment status
npx vercel ls --token <VERCEL_TOKEN>
```

### Vercel Token
The project uses a scoped Vercel token for CLI deployments. Store securely.

## Git Workflow

### Branching Strategy
- `main` — Production branch. All deployments come from here.
- Feature branches — Create from `main`, PR back to `main`.

### Push & Deploy
```bash
git add -A
git commit -m "feat: description"
git push origin main
npx vercel --prod --force
```

## Middleware

`blueprint-dashboard/middleware.js` is a **pass-through** — it does nothing. Auth is handled by:
1. **API-level**: Each API route checks `requireAuth(req)` from `db.js`
2. **Client-level**: Login gate in `index.html` blocks UI until authenticated

## Static Assets

All static files are served from the `blueprint-dashboard/` directory:
- `index.html` — Main SPA
- `rockcrete-logo-horizontal.svg` — Light mode logo
- `rockcrete-logo-horizontal-dark.svg` — Dark mode logo
- `data/project-tracker.json` — Seed data for project phases/tasks
- `robots.txt` — Blocks all crawlers

## Supabase Setup

### Required Tables
See `database-schema.md` for full schema. Run SQL scripts in `sql/` directory:
```bash
# In Supabase SQL editor, run in order:
001-initial-schema.sql
```

### First-Time Setup
1. Deploy to Vercel with env vars set
2. Visit the site
3. Login gate shows "Create Super Admin" button (when 0 users exist)
4. Create the first super_admin account
5. Additional users created via User Management panel

## Monitoring

- **Vercel Dashboard**: View function logs, deployment status
- **Supabase Dashboard**: View database queries, row counts
- **Browser DevTools**: Check for JS errors, network requests
