# Task Tracking

The data model and behavior of the task tracker shown in the Internal Panel.

## Why it exists

Every consulting engagement needs to answer the question "where did the hours go?", both for honest internal reporting and for any milestone-based payment structure. Most teams answer it badly: a Toggl export here, a spreadsheet there, no link to the actual project artifacts.

The task tracker in this template is the unified answer:

- **Tasks** are concrete units of work (e.g. "BPMN mapping of the request process")
- **Milestones** are larger groupings (e.g. "Stage 2 Sprint 1, Foundations") that bundle deliverables
- **Time entries** are durations logged against a task with a note describing what was done
- **AI attribution** ties session token consumption to specific tasks
- **Roll-ups** sum hours, AI cost, and total cost up to milestones and to the program

## Data model

Everything lives in `dashboard/telemetry/tasks.json`. The schema:

```json
{
  "_meta": {
    "schema_version": "1.0",
    "rates": {
      "human_hourly_usd": 125,
      "human_multiplier_for_savings": 10,
      "ai_pricing_model": "..."
    },
    "categories": [
      { "id": "pm-strategy", "es": "Gestión...", "en": "Project..." }
    ]
  },
  "milestones": [
    {
      "id": "m-pre",
      "name_es": "Pre-Etapa · Movilización",
      "name_en": "Pre-Stage · Mobilization",
      "status": "active",
      "starts": "2026-04-21",
      "ends": "2026-04-30",
      "deliverables": ["E1.1", "E1.2"]
    }
  ],
  "tasks": [
    {
      "id": "t-001",
      "milestone_id": "m-pre",
      "category_id": "pm-strategy",
      "name_es": "Blueprint del proyecto",
      "name_en": "Project blueprint",
      "status": "active",
      "owner": "DG",
      "created_at": "2026-04-21",
      "description_es": "...",
      "description_en": "...",
      "human_time_entries": [
        {
          "id": "te-001",
          "consultant": "DG",
          "date": "2026-04-21",
          "duration_minutes": 90,
          "note_es": "...",
          "note_en": "..."
        }
      ],
      "ai_session_ids": ["session-uuid"],
      "ai_attribution_pct": 100
    }
  ]
}
```

## Categories

Default categories shipping with the template (edit in `_meta.categories`):

| ID | Spanish | English |
|---|---|---|
| `pm-strategy` | Gestión de Proyecto y Estrategia | Project Management & Strategy |
| `discovery` | Descubrimiento e Investigación | Discovery & Research |
| `design` | Diseño y Prototipado | Design & Prototyping |
| `architecture` | Arquitectura y Planificación Técnica | Architecture & Technical Planning |
| `development` | Desarrollo e Implementación | Development & Implementation |
| `qa` | Pruebas y Aseguramiento de Calidad | Testing & QA |
| `docs` | Documentación | Documentation |
| `comms` | Comunicación con Stakeholders | Stakeholder Communication |
| `meetings` | Reuniones con Cliente | Client Meetings |
| `reporting` | Reportería y Entregables | Reporting & Deliverables |

These cover most software/digital-transformation engagements. For other disciplines (legal, M&A, marketing, architecture/AEC), edit the list to match the discipline's natural workstream split.

## Milestone statuses

Three states per milestone:

- `planned`, defined but not yet active (sidebar shows blue badge)
- `active`, currently being worked on (green badge)
- `complete`, closed and accepted (gray badge)

Status drives only the visual badge; it doesn't change behavior. Manual progression, the renderer doesn't try to infer status from dates.

## Time entries

Two ways to log time:

1. **Live timer**, start the active task, work for a while, hit "Detener y registrar". The modal opens with the duration pre-filled and asks for date + consultant + note.
2. **Manual entry**, open the Manual Entry modal anytime. Pick the task, enter date + start/end times (or duration in minutes) + consultant + note. For interviews, office visits, calls, workshops, anything done off-app.

Every entry carries a note. The note is the audit trail: months later, the dashboard tells you exactly what was happening during each block of time.

When start/end times are provided in manual entry, the system auto-appends the time range to the note: `(09:00 – 13:00)`.

## Cost calculation

Per-task:

```
human_minutes  = sum(human_time_entries[i].duration_minutes)
human_hours    = human_minutes / 60
human_cost     = human_hours × _meta.rates.human_hourly_usd

ai_tokens      = TELEMETRY.tokens.total × (ai_attribution_pct / 100)
ai_cost        = TELEMETRY.ai_cost.amount × (ai_attribution_pct / 100)

total_cost     = human_cost + ai_cost
```

Per-milestone: sum each task in the milestone.

Per-program: sum every milestone.

(Note: the current renderer attributes AI cost from a single session to one task at 100%. To split a session across multiple tasks, set `ai_attribution_pct` proportionally on each, the renderer will distribute correctly.)

## Persistence

In the preview build:

- **Loaded from disk** at page load via `fetch('telemetry/tasks.json')`
- **Modified in browser** via the timer / manual entry / new task forms
- **Persisted to localStorage** under `foundation_tasks`
- **Not written back to disk** automatically (a static site can't do that)

For production with a backend:

- Replace the fetch with a real API call
- Replace `saveTasksLocally()` with a `PUT /api/tasks` call
- Drop the localStorage fallback (or keep it as offline cache)

The wiring is one function rewrite per call site.

## When to create a new task vs. extend an existing one

The discipline that pays off:

- **Create a new task whenever the work has a different "what was the goal".** Designing a screen vs. implementing it = two tasks. Interviewing P10 vs. analyzing the P10 transcript = two tasks.
- **Extend (add time entries to) an existing task when the work is the same goal continuing.** A task should accumulate ~5–20 hours over its lifetime, if it's growing past 40 hours of human time, it's probably actually multiple tasks.
- **Tasks within a milestone should be discrete enough that each one's note tells the audit story.** If you can't write a one-line description of a task, it's the wrong granularity.

A useful test: at engagement close, the consultant should be able to look at any task and remember what it was without opening the time entries.

## Reporting

Beyond the in-app roll-ups, common report shapes the data supports:

- **Total hours per consultant per week**, group `human_time_entries` by `consultant` + ISO week of `date`
- **Burn rate by milestone**, sum cost per milestone, plot over time
- **AI cost as % of total project cost**, sum AI cost / sum total cost
- **Most expensive tasks**, sort by `total_cost` descending
- **Tasks with no AI attribution**, filter `ai_attribution_pct === 0`; these are the manual-only tasks

The data is plain JSON, so any of these can be produced with a 10-line Python script outside the dashboard.

## Future improvements

Tracked in CHANGELOG.md but worth noting here:

- Per-consultant hourly rates (currently one rate for the whole project)
- Approval workflow on time entries (consultant submits, lead approves)
- Export to CSV / Excel for accountants
- Integration with timesheet systems (Harvest, Toggl, Clockify) for teams that already use one
- Real-time sync between consultants on the same engagement (requires backend)
