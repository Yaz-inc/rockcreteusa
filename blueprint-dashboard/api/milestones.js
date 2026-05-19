/**
 * Milestones API — CRUD for task milestones
 * ============================================================================
 * Stores milestone definitions per task in Vercel Blob Storage.
 * Completely isolated from the existing tracker.js — reads project-tracker.json
 * only to validate task IDs, never writes to it.
 *
 * Blob key: rockcrete/milestones.json
 *
 * Data shape:
 * {
 *   "taskId": {
 *     "taskId": "p1-dev-current-site-audit",
 *     "milestones": [
 *       {
 *         "id": "ms-a1b2c3",
 *         "title": "Crawl all site pages",
 *         "order": 1,
 *         "status": "not-started",  // "not-started" | "in-progress" | "complete" | "blocked"
 *         "completedAt": null,
 *         "completedBy": null,
 *         "notes": "",
 *         "createdAt": "2026-05-19T12:00:00Z",
 *         "updatedAt": "2026-05-19T12:00:00Z"
 *       }
 *     ],
 *     "createdAt": "...",
 *     "updatedAt": "..."
 *   }
 * }
 * ============================================================================
 */

import { list, put, readJsonBlob } from './blob-helpers.js';
import { createHmac } from 'crypto';

const MILESTONES_PATH = 'rockcrete/milestones.json';

/* ── Helpers ────────────────────────────────────────────────────────────── */

function setJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function writeToBlob(data) {
  await put(MILESTONES_PATH, JSON.stringify(data, null, 2), {
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    access: 'public'
  });
}

function canEdit(role) {
  return ['admin', 'webdev', 'team'].includes(role);
}

function generateId() {
  return 'ms-' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

const VALID_STATUSES = ['not-started', 'in-progress', 'complete', 'blocked'];

function normalizeMilestone(ms, existing) {
  const out = {
    id: String(ms.id || existing?.id || generateId()),
    title: String(ms.title || existing?.title || '').trim().slice(0, 200),
    order: typeof ms.order === 'number' ? ms.order : (existing?.order || 0),
    status: VALID_STATUSES.includes(ms.status) ? ms.status : (existing?.status || 'not-started'),
    completedAt: ms.status === 'complete' && ms.status !== existing?.status
      ? new Date().toISOString()
      : (ms.completedAt || existing?.completedAt || null),
    completedBy: ms.status === 'complete' && ms.status !== existing?.status
      ? String(ms.updatedBy || 'unknown')
      : (ms.completedBy || existing?.completedBy || null),
    notes: String(ms.notes ?? existing?.notes ?? '').trim().slice(0, 2000),
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if (!out.title) return null;
  return out;
}

/* ── Handler ────────────────────────────────────────────────────────────── */

/* ── Session verification ───────────────────────────────────────────────── */

function getSessionSecret() {
  return process.env.SESSION_SECRET || 'rockcrete-default-secret-change-me-in-production';
}

function verifySessionCookie(req) {
  const cookieHeader = req.headers?.cookie || '';
  const match = cookieHeader.match(/rockcrete_session=([^;]+)/);
  if (!match) return null;
  try {
    const decoded = JSON.parse(Buffer.from(match[1], 'base64url').toString('utf8'));
    const { _sig, ...payload } = decoded;
    const expected = createHmac('sha256', getSessionSecret()).update(JSON.stringify(payload)).digest('hex');
    if (_sig.length !== expected.length) return null;
    let mismatch = 0;
    for (let i = 0; i < _sig.length; i++) {
      mismatch |= _sig.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    if (mismatch !== 0) return null;
    if (payload.expiresAt && Date.now() > payload.expiresAt) return null;
    return payload; // { userId, role, expiresAt }
  } catch {
    return null;
  }
}

function requireAuth(req) {
  const session = verifySessionCookie(req);
  if (!session) return null;
  return session; // { userId, role, expiresAt }
}

export default async function handler(req, res) {
  try {
    // Auth check — require valid session for all operations
    const session = requireAuth(req);
    if (!session) {
      return setJson(res, 401, { error: 'Authentication required' });
    }

    const incomingRole = String(req.headers['x-rockcrete-role'] || '').toLowerCase();

    /* ── GET: Fetch milestones ─────────────────────────────────────────── */
    if (req.method === 'GET') {
      const data = await readJsonBlob(MILESTONES_PATH);
      return setJson(res, 200, {
        source: data ? 'blob' : 'empty',
        milestones: data || {}
      });
    }

    /* ── POST: Create milestones for a task ────────────────────────────── */
    if (req.method === 'POST') {
      if (!canEdit(incomingRole)) {
        return setJson(res, 403, { error: 'Staff role required to create milestones' });
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const { taskId, milestones: rawMilestones } = body;

      if (!taskId || typeof taskId !== 'string') {
        return setJson(res, 400, { error: 'taskId is required' });
      }

      if (!Array.isArray(rawMilestones) || rawMilestones.length === 0) {
        return setJson(res, 400, { error: 'milestones array is required and must not be empty' });
      }

      const data = (await readJsonBlob(MILESTONES_PATH)) || {};
      const existing = data[taskId] || { taskId, milestones: [], createdAt: new Date().toISOString() };

      const newMilestones = rawMilestones.map((ms, i) => {
        const normalized = normalizeMilestone({ ...ms, order: ms.order ?? (existing.milestones.length + i + 1), updatedBy: incomingRole });
        return normalized;
      }).filter(Boolean);

      if (newMilestones.length === 0) {
        return setJson(res, 400, { error: 'No valid milestones provided' });
      }

      existing.milestones = [...existing.milestones, ...newMilestones];
      existing.updatedAt = new Date().toISOString();
      data[taskId] = existing;

      await writeToBlob(data);
      return setJson(res, 201, { source: 'blob', milestones: data });
    }

    /* ── PUT: Update a milestone ───────────────────────────────────────── */
    if (req.method === 'PUT') {
      if (!canEdit(incomingRole)) {
        return setJson(res, 403, { error: 'Staff role required to update milestones' });
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const { taskId, milestoneId, milestone: rawMs, milestones: bulkMs } = body;

      const data = (await readJsonBlob(MILESTONES_PATH)) || {};

      // Bulk update: update multiple milestones at once
      if (bulkMs && Array.isArray(bulkMs)) {
        if (!taskId) {
          return setJson(res, 400, { error: 'taskId is required for bulk updates' });
        }
        const taskEntry = data[taskId];
        if (!taskEntry) {
          return setJson(res, 404, { error: 'Task milestones not found' });
        }
        for (const patch of bulkMs) {
          const idx = taskEntry.milestones.findIndex(m => m.id === patch.id);
          if (idx >= 0) {
            const normalized = normalizeMilestone({ ...patch, updatedBy: incomingRole }, taskEntry.milestones[idx]);
            if (normalized) taskEntry.milestones[idx] = normalized;
          }
        }
        taskEntry.updatedAt = new Date().toISOString();
        await writeToBlob(data);
        return setJson(res, 200, { source: 'blob', milestones: data });
      }

      // Single milestone update
      if (!taskId || !milestoneId) {
        return setJson(res, 400, { error: 'taskId and milestoneId are required' });
      }

      const taskEntry = data[taskId];
      if (!taskEntry) {
        return setJson(res, 404, { error: 'Task milestones not found' });
      }

      const idx = taskEntry.milestones.findIndex(m => m.id === milestoneId);
      if (idx < 0) {
        return setJson(res, 404, { error: 'Milestone not found' });
      }

      const normalized = normalizeMilestone({ ...rawMs, id: milestoneId, updatedBy: incomingRole }, taskEntry.milestones[idx]);
      if (!normalized) {
        return setJson(res, 400, { error: 'Invalid milestone data' });
      }

      taskEntry.milestones[idx] = normalized;
      taskEntry.updatedAt = new Date().toISOString();
      await writeToBlob(data);
      return setJson(res, 200, { source: 'blob', milestones: data });
    }

    /* ── DELETE: Remove a milestone ────────────────────────────────────── */
    if (req.method === 'DELETE') {
      if (!canEdit(incomingRole)) {
        return setJson(res, 403, { error: 'Staff role required to delete milestones' });
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const { taskId, milestoneId } = body;

      if (!taskId || !milestoneId) {
        return setJson(res, 400, { error: 'taskId and milestoneId are required' });
      }

      const data = (await readJsonBlob(MILESTONES_PATH)) || {};
      const taskEntry = data[taskId];
      if (!taskEntry) {
        return setJson(res, 404, { error: 'Task milestones not found' });
      }

      const before = taskEntry.milestones.length;
      taskEntry.milestones = taskEntry.milestones.filter(m => m.id !== milestoneId);
      if (taskEntry.milestones.length === before) {
        return setJson(res, 404, { error: 'Milestone not found' });
      }

      taskEntry.updatedAt = new Date().toISOString();
      await writeToBlob(data);
      return setJson(res, 200, { source: 'blob', milestones: data });
    }

    /* ── Method not allowed ────────────────────────────────────────────── */
    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return setJson(res, 405, { error: 'Method not allowed' });

  } catch (error) {
    return setJson(res, 500, {
      error: 'Milestones operation failed',
      message: error.message
    });
  }
}
