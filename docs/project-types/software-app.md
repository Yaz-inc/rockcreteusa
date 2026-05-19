# Software / app development

Use this guide when the engagement is building a web app, mobile app, backend service, or platform.

## Typical lifecycle

| Phase | Duration | Goal | Output |
|---|---|---|---|
| Discovery | 4 to 8 weeks | Understand the user, the data, the constraints. | Functional spec, architecture, prototype, risk matrix. |
| Foundation / MVP | 8 to 12 weeks | Ship the smallest end-to-end product that proves the model. | Auth, core CRUD, dashboard, deployment pipeline. |
| Expansion | 8 to 12 weeks | Add the secondary capabilities that depend on the foundation. | Mobile, integrations, admin tools, reporting. |
| Intelligence / Advanced | 6 to 10 weeks | Layer in the AI / advanced features that need the data the foundation captures. | LLM workflows, classification, scoring, dashboards. |
| Handover | 2 to 4 weeks | Transfer ownership. | Docs, training, runbooks, support handoff. |

Phases are sequential; sprints inside each phase are 2 weeks by default.

## Standard deliverables (per phase)

Discovery:

- Stakeholder map and interview notes.
- AS-IS and TO-BE process maps.
- Functional specification.
- Architecture (C4 levels 1 and 2).
- Risk matrix.
- Sprint plan for Foundation.

Foundation / MVP:

- Working product behind a real auth gate.
- Core data model migrated and seeded.
- Production deployment pipeline.
- Acceptance test suite.
- User acceptance test (UAT) report.
- Manual de usuario (or equivalent docs).

Expansion: same shape, applied to the next functional area.

## Typical tech-stack categories

Pick one per row, not all:

| Layer | Common picks |
|---|---|
| Backend | NestJS · Django · Rails · FastAPI · Spring Boot · Go (chi, gin) · .NET Core |
| Frontend | Next.js · React · Vue/Nuxt · SvelteKit · Astro · Remix |
| Mobile | React Native · Flutter · Swift (iOS) · Kotlin (Android) |
| DB | PostgreSQL · MySQL · SQLite · MongoDB · DynamoDB |
| Spatial | PostGIS (Postgres extension) · MongoDB GeoJSON |
| Cache / queue | Redis · Memcached · RabbitMQ · NATS |
| Search | Elasticsearch · Meilisearch · Typesense · Postgres FTS |
| AI / ML | OpenAI / Anthropic / Google / xAI APIs · Hugging Face · self-hosted (vLLM, Ollama) |
| Infra | Vercel · Netlify · Cloudflare Pages · Vultr · DigitalOcean · Hetzner · AWS · GCP · Azure |
| Containerization | Docker · Kubernetes · Nomad |
| CI/CD | GitHub Actions · GitLab CI · CircleCI · Buildkite |

Lock the stack in an ADR (`docs/decision-records/`) once decided. Re-decide only with explicit reason.

## Top-level folders to keep

```
apps/
  ├── backend/
  ├── frontend/
  └── mobile/        (if applicable; delete if web-only)
packages/             shared libraries
infra/                docker, k8s, terraform
scripts/              dev and ops scripts
research/             interview notes
sprints/              per-sprint deliverables
deliverables/         formal handoff artifacts
```

## Common risks (raise these in `status.md` blockers)

1. **Engineering-capacity gap.** UX-heavy teams underestimate backend, DevOps, DB, QA, security work. Surface before sprint 1.
2. **Data-model churn.** Late changes to the schema force migrations and break callers. Lock the core model in Discovery.
3. **Integration uncertainty.** Third-party APIs that are "easy" in the demo become hard in production. Spike risky integrations in week 1.
4. **Performance assumptions.** "<200ms response" needs a load test, not a hope. Add the load test to Foundation phase.
5. **Compliance discovery.** Regulatory requirements often surface mid-build. Pull the legal review forward into Discovery.

## Dashboard customization for software projects

The Blueprint Dashboard's default category labels in `blueprint-dashboard/telemetry/tasks.example.json` are tuned for software. Likely keep:

- `analysis-and-architecture`
- `ux-and-design`
- `backend-development`
- `frontend-development`
- `mobile-development`
- `devops-and-infra`
- `qa-and-testing`
- `documentation`
- `change-management-and-training`
- `project-management`

Adjust as needed but keep the spirit: enough categories to attribute work, not so many that every entry needs a coin flip.

## Example sprint cadence

Two-week sprints, demo at end of week 2, sprint plan at start of week 1, mid-sprint health check at end of week 1.

| Day | Activity |
|---|---|
| Mon week 1 | Sprint plan: pull tickets from backlog, estimate, commit. |
| Tue–Fri week 1 | Build. |
| Mon week 2 | Mid-sprint check: scope adjustment if needed. |
| Tue–Thu week 2 | Build, test, polish. |
| Fri week 2 | Sprint demo with the client; retrospective. |

## Definition of "Done" for a sprint deliverable

- Code merged to `main`.
- Tests passing in CI.
- Deployed to a staging or preview environment.
- Documented in the corresponding `docs/` page or ADR.
- Demoed to the client and accepted in writing (email, comment, or sign-off).

## Pointers

- `../project-memory/` for the durable context.
- `../decision-records/` for stack and architecture ADRs.
- `../architecture/` for diagrams.
- `blueprint-dashboard/` to demo progress live.
