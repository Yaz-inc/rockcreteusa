# API Reference

All API endpoints are Vercel Serverless Functions in the `api/` directory. Base URL: `https://rockcreteusa-v18.vercel.app`

## Authentication

### POST `/api/auth?action=login`
Log in with email and password.

**Request:**
```json
{ "email": "user@example.com", "password": "secret" }
```

**Response (200):**
```json
{ "ok": true, "user": { "id": "usr-xxx", "name": "...", "email": "...", "role": "admin", ... } }
```
Sets `rockcrete_session` HTTP-only cookie.

**Errors:** `401` Invalid credentials, `500` Server error

---

### GET `/api/auth?action=me`
Check current session.

**Response (200):**
```json
{ "user": { "id": "usr-xxx", "name": "...", "role": "admin", ... } }
```

**Errors:** `401` Not authenticated (no valid cookie)

---

### POST `/api/auth?action=logout`
Clear session cookie.

**Response (200):** `{ "ok": true }`

---

### GET `/api/auth?action=check-seed`
Check if the database needs seeding (first super admin).

**Response (200):** `{ "canSeed": true/false, "userCount": 0 }`

---

### POST `/api/auth?action=seed`
Create the first super admin account (only works when no users exist).

**Request:** `{ "email": "...", "password": "...", "name": "..." }`

---

### POST `/api/auth?action=forgot-password`
Initiate password reset.

**Request:** `{ "email": "..." }`

### POST `/api/auth?action=verify-reset-code`
Verify 6-digit reset code.

**Request:** `{ "email": "...", "code": "123456" }`

### POST `/api/auth?action=reset-password`
Set new password with reset token.

**Request:** `{ "email": "...", "token": "...", "newPassword": "..." }`

---

## Tracker

### GET `/api/tracker`
Get full tracker state from Supabase.

**Response (200):**
```json
{
  "source": "database",
  "state": {
    "tasks": {
      "p1-dev-current-site-audit": {
        "id": "p1-dev-current-site-audit",
        "status": "in_progress",
        "dueDate": "2026-05-30",
        "assigneeId": "usr-xxx",
        "comments": [...],
        "updatedAt": "...",
        "updatedBy": "admin"
      }
    },
    "accessRequests": {
      "access-ga4": { "id": "access-ga4", "status": "requested", ... }
    }
  }
}
```

### PUT `/api/tracker`
Save tracker state.

**Headers:** `x-rockcrete-role: admin`

**Request:** `{ "state": { "tasks": {...}, "accessRequests": {...} } }`

**Response (200):** Same as GET response

---

## Milestones

### GET `/api/milestones`
Get all milestones grouped by task ID.

**Response (200):**
```json
{
  "source": "database",
  "milestones": {
    "task-id": {
      "taskId": "task-id",
      "milestones": [
        { "id": "ms-xxx", "title": "...", "notes": "...", "order": 1, "completedAt": null }
      ]
    }
  }
}
```

### POST `/api/milestones`
Create milestones for a task.

**Headers:** `x-rockcrete-role: admin`

**Request:** `{ "taskId": "...", "milestones": [{ "title": "...", "notes": "..." }] }`

**Response (201):** Full milestones data

### PUT `/api/milestones`
Update a milestone (toggle complete, reorder, edit).

**Request:** `{ "taskId": "...", "milestoneId": "...", "action": "toggle-complete" }`

### DELETE `/api/milestones`
Delete a milestone.

**Request:** `{ "taskId": "...", "milestoneId": "..." }`

---

## Progress

### GET `/api/progress`
Get all progress updates.

**Response (200):**
```json
{
  "source": "database",
  "updates": [
    { "id": "upd-xxx", "taskId": "...", "type": "note", "message": "...", "createdAt": "..." }
  ]
}
```

### POST `/api/progress`
Create a progress update.

**Headers:** `x-rockcrete-role: admin`

**Request:** `{ "taskId": "...", "type": "note|blocker|milestone-created|milestone-completed", "message": "..." }`

**Response (201):** Created update

---

## Users (Auth Required — super_admin only for list/create/delete)

### GET `/api/users?action=list`
List all users. **Requires:** super_admin role.

### GET `/api/users?action=assignees`
List users as assignees (id + name). **Requires:** valid session.

### POST `/api/users?action=create`
Create a new user. **Requires:** super_admin.

### PUT `/api/users?action=update`
Update user details. **Requires:** super_admin.

### DELETE `/api/users?action=delete`
Delete a user. **Requires:** super_admin.

---

## Settings (Auth Required — admin+)

### GET `/api/settings`
Get system settings. **Requires:** admin role.

### PUT `/api/settings`
Update settings. **Requires:** admin role.

---

## Teams (Auth Required)

### GET `/api/teams`
List all teams. **Requires:** valid session.

### POST `/api/teams`
Create a team. **Requires:** admin role.

### PUT `/api/teams`
Update a team. **Requires:** admin role.

### DELETE `/api/teams`
Delete a team. **Requires:** admin role.

---

## Profile (Auth Required)

### GET `/api/profile`
Get current user profile. **Requires:** valid session.

### PUT `/api/profile`
Update own profile (name, display name, password). **Requires:** valid session.

---

## Common Headers

| Header | Used By | Purpose |
|--------|---------|---------|
| `x-rockcrete-role` | tracker, milestones, progress | Role for authorization |
| `Content-Type: application/json` | All POST/PUT | Request body format |
| `Cookie: rockcrete_session=<token>` | All auth endpoints | Session authentication |

## Error Response Format

```json
{ "error": "Human-readable error message" }
```

Common status codes: `400` Bad request, `401` Unauthorized, `403` Forbidden, `404` Not found, `405` Method not allowed, `500` Server error
