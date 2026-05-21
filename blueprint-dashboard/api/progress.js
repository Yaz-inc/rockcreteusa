/**
 * Progress API — Activity feed & progress updates
 * ============================================================================
 * Stores progress updates submitted by assignees against tasks/milestones.
 * All data persisted in Supabase.
 * ============================================================================
 */

import {
  setJson, requireAuth, generateId,
  getProgressUpdates, createProgressUpdate, deleteProgressUpdate, updateProgressUpdate,
} from './db.js';

const MAX_MESSAGE = 2000;

function canSubmit(role) {
  return ['admin', 'webdev', 'team', 'client_admin'].includes(role);
}

const VALID_TYPES = ['status-change', 'note', 'blocker', 'milestone-created', 'milestone-completed'];

function normalizeUpdate(raw) {
  const message = String(raw.message || '').trim().slice(0, MAX_MESSAGE);
  if (!message && raw.type !== 'status-change') return null;

  const update = {
    id: String(raw.id || generateId('upd')),
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

export default async function handler(req, res) {
  try {
    const session = requireAuth(req);
    if (!session) {
      return setJson(res, 401, { error: 'Authentication required' });
    }

    const incomingRole = String(req.headers['x-rockcrete-role'] || '').toLowerCase();

    /* ── GET: Fetch progress updates ───────────────────────────────────── */
    if (req.method === 'GET') {
      const filterTask = String(req.query?.taskId || '');
      const updates = await getProgressUpdates(filterTask || null);

      // Role visibility filter
      let visible = updates;
      if (incomingRole === 'client') {
        visible = updates.filter(u => u.role === 'client' || u.role === 'admin');
      }

      // Sort newest first
      visible.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return setJson(res, 200, {
        source: updates.length > 0 ? 'database' : 'empty',
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

      const saved = await createProgressUpdate(update);
      const allUpdates = await getProgressUpdates();

      return setJson(res, 201, { source: 'database', update: saved, total: allUpdates.length });
    }

    /* ── DELETE: Remove a progress update ────────────────────────────── */
    if (req.method === 'DELETE') {
      if (!canSubmit(incomingRole)) {
        return setJson(res, 403, { error: 'Staff role required' });
      }
      const id = req.query?.id || '';
      if (!id) {
        return setJson(res, 400, { error: 'id query parameter required' });
      }
      await deleteProgressUpdate(id);
      return setJson(res, 200, { ok: true, message: 'Progress update deleted' });
    }

    /* ── PUT: Edit a progress update message ───────────────────────── */
    if (req.method === 'PUT') {
      if (!canSubmit(incomingRole)) {
        return setJson(res, 403, { error: 'Staff role required' });
      }
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const id = body.id || req.query?.id || '';
      if (!id) {
        return setJson(res, 400, { error: 'id is required' });
      }
      const message = String(body.message || '').trim();
      if (!message) {
        return setJson(res, 400, { error: 'message is required' });
      }
      const updated = await updateProgressUpdate(id, { message });
      return setJson(res, 200, { ok: true, update: updated });
    }

    /* ── Method not allowed ────────────────────────────────────────────── */
    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return setJson(res, 405, { error: 'Method not allowed' });

  } catch (error) {
    return setJson(res, 500, {
      error: 'Progress operation failed',
      message: error.message
    });
  }
}
