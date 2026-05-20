# Auth and Roles

How the dashboard separates client-facing screens from consultant/admin Internal Panel.

## The model

Two role tiers, both implemented as a structural pattern in the HTML:

- **Cliente** (client / funder / stakeholder), sees the engagement narrative, deliverables, status, knowledge base, team. Does not see internal cost / time / AI telemetry.
- **Consultor / Admin / Manager** (the team executing the engagement), sees everything Cliente sees plus the **Internal Panel**: time tracking, AI cost, task attribution, expenses, and any internal-only tooling.

The Internal Panel is structurally hidden from the Cliente role, not just visually CSS-hidden, but server-side gated in production.

## Preview-mode role gating (client-side)

In the current preview (no backend), the role gating is cosmetic:

- The sidebar group "Interno (Admins y Managers)" containing the Panel Interno link is always rendered
- Anyone who knows the URL hash `#panel` can navigate to it

This is fine for internal review and demos. **Do not deploy this preview to a public URL with real cost data inside.**

## Production-mode role gating (server-side)

For production deployment, the gating becomes real:

1. Put the dashboard behind authentication (basic-auth, OAuth, Auth.js, whatever your team uses)
2. After authentication, the server attaches a role claim to the user
3. The server-rendered version of `index.html` either includes or excludes the Panel Interno HTML based on role
4. The `telemetry/panel-interno-telemetry.json` and `telemetry/tasks.json` endpoints check the role claim and 403 for client-tier requests

The cleanest implementation is a tiny Express/Fastify/whatever wrapper:

```js
app.get('/dashboard', requireAuth, (req, res) => {
  const html = readFileSync('index.html', 'utf8');
  if (req.user.role !== 'admin') {
    // strip the screen-panel block before sending
    return res.send(stripInternalPanel(html));
  }
  res.send(html);
});

app.get('/telemetry/:file', requireAuth, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard/telemetry', req.params.file));
});
```

Or use any reverse-proxy (nginx, Caddy) with auth middleware in front of a fully-static deploy.

## Role claims structure

Recommended:

```json
{
  "user": {
    "email": "lloyola@worldbank.org",
    "name": "Luis Loyola",
    "role": "client",
    "organization": "World Bank"
  }
}
```

Or for admins:

```json
{
  "user": {
    "email": "consultant@example.com",
    "role": "admin",
    "organization": "Consulting Team"
  }
}
```

Just two roles in v0.1.0. Future versions may add `manager` (sees Internal Panel but cannot edit task data) for sub-tier roles.

## Who gets what login

The intended setup for a typical engagement:

| Tier | Role | Example users | Access |
|---|---|---|---|
| Client / Funder | `client` | Project sponsor, funder TTL, government counterpart | Full client surface (Inicio, Discovery, Plan, Construction, Knowledge, Team). No Internal Panel. |
| Admin / Consultant team | `admin` | Project lead, lead architect, BA, designer | Everything client sees + Internal Panel. Can edit tasks and time entries. |

If the engagement has a Korean fund, World Bank, government client, AND an internal consulting team, that's three separate logins, one shared `client` role for the first three (each sees the same client-facing dashboard), and one `admin` role for the consulting team.

The shared client role keeps the feature set simple; if a future engagement needs to differentiate "what the funder sees" from "what the leadership sees", the model can extend to per-organization role variants.

## MFA

Strongly recommended for `admin` role. The Internal Panel reveals consultant cost structure that no one outside the team should see. TOTP via Auth.js v5 is the lightest production setup; SMS-based MFA is acceptable but weaker.

`client` role MFA is a per-engagement decision. For most government/funder counterparts, a strong password + TLS is enough. For high-sensitivity engagements (financial services, defense, healthcare) require MFA for everyone.

## Audit log

Every login, every page view, every task edit should be logged in production. The schema:

```
{
  timestamp,
  user_email,
  role,
  action,         // login, view-screen, edit-task, log-time, ...
  target,         // screen name, task id, ...
  ip_address,
  user_agent
}
```

Append-only, retention per the engagement's compliance requirement (typically 7 years for World Bank-funded work).

The current preview does not implement audit logging, this is a production-only requirement.

## Self-service password reset

For `client` users, support self-service password reset via email magic link. For `admin` users, password resets should require manual intervention from the project lead (defends against social-engineering attacks on the Internal Panel).

## Session lifecycle

- Login session TTL: 8 hours of inactivity for client, 4 hours for admin
- Refresh tokens: enabled for client (avoids re-login disruption), disabled for admin
- Active session monitoring: visible in Internal Panel for admins

## Single-sign-on (SSO)

If the client mandates SSO (Okta, Azure AD, Google Workspace), the integration is per-engagement. Auth.js v5 supports the major providers out of the box. The role mapping from SSO claims to dashboard role typically uses a static map: members of group "X-funded-projects" → `client` role; members of "consulting-team" → `admin`.

## Per-engagement variation

Some engagements have unusual requirements:

- **Government clients with intranet-only deployment**, no public URL at all; deploy on the client's intranet, role gating handled by their existing identity system
- **Consortium engagements**, multiple consulting firms collaborating; each firm gets its own admin role with a partition flag so each firm sees only its own consultants' time entries
- **Pilot phases**, one client subset has full client access, another has read-only "preview" access; introduce a `client-readonly` role variant

The two-role baseline in this template handles 80%+ of engagements. Document any per-engagement deviation in that engagement's own README.
