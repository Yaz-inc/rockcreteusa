/**
 * Progress API — Activity feed & progress updates
 * ============================================================================
 * Stores progress updates submitted by assignees against tasks/milestones.
 * Completely isolated from the existing tracker.js — never writes to
 * rockcrete/project-tracker-state.json.
 *
 * Blob key: rockcrete/progress.json
 *
 * Data shape:
 * {
 *   "updates": [
 *     {
 *       "id": "upd-a1b2c3",
 *       "taskId": "p1-dev-current-site-audit",
 *       "milestoneId": "ms-xyz",       // optional
 *       "submittedBy": "Yasir",
 *       "role": "webdev",
 *       "type": "status-change",        // "status-change" | "note" | "blocker" | "milestone-created" | "milestone-completed"
 *       "message": "12 of 20 pages audited",
 *       "previousStatus": null,         // for status-change type
 *       "newStatus": "in-progress",     // for status-change type
 *       "createdAt": "2026-05-19T09:15:00Z"
 *     }
 *   ]
 * }
 * ============================================================================
 */

import { list, put, readJsonBlob } from './blob-helpers.js';

const PROGRESS_PATH = 'rockcrete/progress.json';
const MAX_UPDATES = 500; // Keep last N updates to prevent unbounded growth
const MAX_MESSAGE = 2000;

/* ── Helpers ────────────────────────────────────────────────────────────── */

function setJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function writeToBlob(data) {
  await put(PROGRESS_PATH, JSON.stringify(data, null, 2), {
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true
  });
}

function canSubmit(role) {
  return ['admin', 'webdev', 'team', 'client_admin'].includes(role);
}

function generateId() {
  return 'upd-' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

const VALID_TYPES = ['status-change', 'note', 'blocker', 'milestone-created', 'milestone-completed'];

function normalizeUpdate(raw) {
  const message = String(raw.message || '').trim().slice(0, MAX_MESSAGE);
  if (!message && raw.type !== 'status-change') return null;

  const update = {
    id: String(raw.id || generateId()),
    taskId: String(raw.taskId || '').trim().slice(0, 128),
    milestoneId: raw.milestoneId ? String(raw.milestoneId).trim().slice(0, 128) : null,
    submittedBy: String(raw.submittedBy || '').trim().slice(0, 80),
    role: String(raw.role || 'webdev').toLowerCase(),
    type: VALID_TYPES.includes(raw.type) ? raw.type : 'note',
    message,
    previousStatus: raw.previousStatus || null,
    newStatus: raw.newStatus || null,
    createdAt: raw.createdAt || new Date().toISOString()
  };

  if (!update.taskId) return null;
  return update;
}

/* ── Handler ────────────────────────────────────────────────────────────── */

export default async function handler(req, res) {
  try {
    const incomingRole = String(req.headers['x-rockcrete-role'] || '').toLowerCase();

    /* ── GET: Fetch progress updates ───────────────────────────────────── */
    if (req.method === 'GET') {
      const data = await readJsonBlob(PROGRESS_PATH);
      const updates = data?.updates || [];

      // Allow filtering by taskId
      const filterTask = String(req.query?.taskId || '');
      const filtered = filterTask
        ? updates.filter(u => u.taskId === filterTask)
        : updates;

      // Allow filtering by role visibility
      // client and client_admin can only see their own updates + admin posts
      let visible = filtered;
      if (incomingRole === 'client') {
        visible = filtered.filter(u => u.role === 'client' || u.role === 'admin');
      }

      // Sort newest first
      visible.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return setJson(res, 200, {
        source: data ? 'blob' : 'empty',
        updates: visible,
        total: updates.length
      });
    }

    /* ── POST: Submit a progress update ────────────────────────────────── */
    if (req.method === 'POST') {
      if (!canSubmit(incomingRole)) {
        return setJson(res, 403, { error: 'Staff role required to submit progress' });
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const update = normalizeUpdate({ ...body, role: incomingRole });

      if (!update) {
        return setJson(res, 400, { error: 'Invalid progress update data' });
      }

      const data = (await readJsonBlob(PROGRESS_PATH)) || { updates: [] };
      data.updates.push(update);

      // Trim to max size, keeping newest
      if (data.updates.length > MAX_UPDATES) {
        data.updates = data.updates
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, MAX_UPDATES);
      }

      await writeToBlob(data);
      return setJson(res, 201, { source: 'blob', update, total: data.updates.length });
    }

    /* ── Method not allowed ────────────────────────────────────────────── */
    res.setHeader('Allow', 'GET, POST');
    return setJson(res, 405, { error: 'Method not allowed' });

  } catch (error) {
    return setJson(res, 500, {
      error: 'Progress operation failed',
      message: error.message
    });
  }
}
