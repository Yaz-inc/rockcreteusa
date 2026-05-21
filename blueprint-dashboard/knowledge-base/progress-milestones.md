# Progress & Milestones System

## Overview

The Progress system tracks task milestones and activity updates. It lives on the "Team Progress" screen and provides milestone management per task, activity feed, and at-risk/blocked task tracking.

## Data Model

### Milestones
```json
{
  "taskId": {
    "taskId": "p1-dev-current-site-audit",
    "milestones": [
      {
        "id": "ms-xxx",
        "title": "Complete SEO analysis",
        "notes": "Review current rankings",
        "order": 1,
        "status": "pending",
        "completedAt": null,
        "completedBy": null,
        "createdAt": "2026-05-21T..."
      }
    ]
  }
}
```

### Progress Updates
```json
{
  "id": "upd-xxx",
  "taskId": "p1-dev-current-site-audit",
  "milestoneId": "ms-xxx",
  "submittedBy": "Yasir",
  "role": "super_admin",
  "type": "milestone-completed",
  "message": "Completed: SEO analysis",
  "previousStatus": null,
  "newStatus": null,
  "createdAt": "2026-05-21T..."
}
```

Update types: `note`, `blocker`, `milestone-created`, `milestone-completed`, `status-change`

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/milestones` | All milestones grouped by task |
| POST | `/api/milestones` | Create milestone(s) for a task |
| PUT | `/api/milestones` | Toggle complete, update title/notes, reorder |
| DELETE | `/api/milestones` | Delete a milestone |
| GET | `/api/progress` | Recent progress updates (limit 100) |
| POST | `/api/progress` | Create a progress update |

## Rendering

### Progress Dashboard (`initProgressDashboard()`)

1. Fetches milestones and progress data
2. Renders 5 sections:
   - **Phase Progress** — progress bars per phase
   - **Tasks with Milestones** — expandable task cards with milestone checklists
   - **Recent Activity** — chronological activity feed
   - **At Risk / Blocked** — tasks with blockers

### Key Functions

| Function | Purpose |
|----------|---------|
| `initProgressDashboard()` | Boot: fetch data + render all sections |
| `fetchMilestones()` | GET /api/milestones → MILESTONES_DATA |
| `fetchProgress()` | GET /api/progress → PROGRESS_UPDATES |
| `renderProgressDashboard()` | Render all 5 sections |
| `renderProgressPhases()` | Phase progress bars |
| `renderProgressTasks()` | Task cards with milestone lists |
| `renderProgressActivity()` | Activity feed timeline |
| `renderProgressBlockers()` | At-risk task cards |
| `toggleMilestone(taskId, msId)` | Toggle milestone complete/incomplete |
| `addMilestone(taskId, title)` | Create new milestone via API |
| `deleteMilestone(taskId, msId)` | Delete milestone via API |

## State Persistence

| Variable | Storage | Key |
|----------|---------|-----|
| `MILESTONES_DATA` | Memory + localStorage | `rockcrete_milestones` |
| `PROGRESS_UPDATES` | Memory + localStorage | `rockcrete_progress_updates` |

Both use localStorage as cache and API as source of truth.

## Integration with Tracker

The progress system reads `TRACKER_DATA` to get task metadata (title, phase, status). The `renderProgressTasks()` function iterates `TRACKER_DATA.tasks` and matches them with `MILESTONES_DATA` entries.

Phase embeds (`#phase-{N}-task-embed`) also render milestone checkboxes within each phase screen using `renderPhaseEmbed()`.
