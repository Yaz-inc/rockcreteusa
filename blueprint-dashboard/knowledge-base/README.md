# RockCrete USA — Blueprint Dashboard

> **Internal project dashboard** for the Rockcrete USA website rebuild.  
> Live: https://rockcreteusa-v18.vercel.app/

## Overview

A single-page web application that serves as the central hub for the Rockcrete USA website rebuild project. Tracks project phases, tasks, milestones, team assignments, and progress — all behind a role-based access control system.

## Current Version: V20

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla HTML/CSS/JS (single `index.html`, ~9,400 lines) |
| **Backend** | Vercel Serverless Functions (Node.js, `/api/*.js`) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | HTTP-only signed session cookies (HMAC-SHA256) |
| **Icons** | Lucide Icons v0.460.0 (CDN) |
| **Fonts** | DM Sans (Google Fonts) |
| **Deployment** | Vercel (production: `main` branch) |

## Project Structure

```
blueprint-dashboard/
├── index.html              # Full SPA (HTML + CSS + JS, ~9,400 lines)
├── vercel.json             # Vercel config (rewrites, headers, build)
├── middleware.js            # Vercel Edge Middleware (pass-through)
├── package.json            # Dependencies (Supabase, bcryptjs, etc.)
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore rules
│
├── api/                    # Serverless API functions
│   ├── db.js               # Shared DB helpers, session, Supabase client
│   ├── auth.js             # Login, logout, session, password reset
│   ├── users.js            # User CRUD (admin only)
│   ├── profile.js          # User self-service profile updates
│   ├── tracker.js          # Project tracker state GET/PUT
│   ├── milestones.js       # Milestone CRUD per task
│   ├── progress.js         # Progress updates/activity feed (GET/POST/PUT/DELETE)
│   ├── settings.js         # System settings CRUD + email verify/test + export/import
│   ├── setup.js            # Database setup API (migrate, test, export, import)
│   └── teams.js            # Team management CRUD
│
├── data/
│   └── project-tracker.json # Seed data: phases, tasks, roles, meetings
│
├── knowledge-base/         # AI agent documentation (this folder)
│   ├── README.md           # This file
│   ├── architecture.md     # System architecture & code map
│   ├── auth-system.md      # Auth flow, roles, sessions
│   ├── api-reference.md    # Full API endpoint reference
│   ├── database-schema.md  # Supabase table schemas
│   ├── tracker-system.md   # Tracker state management
│   ├── progress-milestones.md # Progress & milestones system
│   ├── ui-components.md    # CSS design system & components
│   ├── deployment.md       # Vercel deployment guide
│   └── known-issues.md     # Known issues & tech debt
│
├── CHANGELOG.md            # Full version history
│
└── sql/                    # Database setup scripts
    ├── 001-initial-schema.sql
    └── ...
```

## Git Branching

| Branch | Purpose |
|--------|---------|
| `main` | ✅ Production. Deployed to Vercel. All work goes here. |
| `V18` | Archive of V18 feature branch (preserved for reference) |

All other branches (V17_A, V17_Final, Version17, v19) have been merged into `main` and deleted.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `SESSION_SECRET` | ✅ | HMAC secret for session cookies |

Optional (can be configured via Settings UI instead):
- `RESEND_API_KEY` — Resend API key for transactional emails
- `RESEND_FROM_EMAIL` — Sender email address

## Quick Start

```bash
# Clone
git clone https://github.com/Yaz-inc/rockcreteusa.git
cd rockcreteusa/blueprint-dashboard

# Install deps
npm install

# Set env vars
cp .env.example .env
# Edit .env with your Supabase credentials

# Deploy to Vercel
npx vercel --prod
```

## Key Concepts

### Phases
The project is organized into 4 phases:
1. **Discovery & Architecture** (May 14 – Jun 16, 2026)
2. **Visual Design** (Jun 23 – Jul 7, 2026)
3. **Build, Migration & Go-Live** (Jul 21 – Sep 29, 2026)
4. **Post-Launch & Optimization** (Oct 6 – Oct 26, 2026)

### Roles
- **super_admin** — Full access, user management, system settings
- **admin** — Project management, all settings
- **pm** — Task management, progress updates
- **webdev** — Development tasks, tracker editing
- **designer** — Design tasks
- **client_admin** — Client-side admin
- **client** — Read-only client view
- **viewer** / **guest** — Minimal access

### State Persistence
- **Tracker state** → Supabase `tracker_state` table + localStorage fallback
- **User session** → HTTP-only cookie (`rockcrete_session`, 7-day expiry) + localStorage fallback
- **Milestones** → Supabase `milestones` table + localStorage cache
- **Progress** → Supabase `progress_updates` table + localStorage cache

### Staff Notes (Tracker Comments)
- Inline edit with Save/Cancel buttons (Ctrl+Enter / Escape)
- Inline delete with red confirmation bar
- URLs auto-linked as clickable links
- Toast notifications for all feedback

### Email Configuration
- Resend API integration for password resets and invitations
- Verify Connection checks domain status + domain mismatch
- Single API key input in Settings → Email Configuration
- Auto-saves before verify/test/usage check

## Improvement Tracking

All improvements are numbered sequentially (#1–#22+). Each improvement gets its own commit. To revert, use `git revert <commit>`.

| # | Description | Status |
|---|------------|--------|
| 20 | Self-service Supabase database setup via Settings | ✅ Backend done, UI pending |
| 21 | Edit/Delete buttons on staff notes + activity feed | ✅ Done |
| 22 | URL auto-linking in notes and activity feed | ✅ Done |

## Owner

**Yasir** (yazinc@gmail.com)  
Organization: Yaz-inc / New Minds Group
