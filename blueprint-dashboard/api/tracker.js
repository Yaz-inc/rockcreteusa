/**
 * Tracker API — Project tracker state CRUD
 * ============================================================================
 * GET/PUT for project tracker state stored in Supabase.
 * Session verification via cookie; staff role check for writes.
 * ============================================================================
 */

import { createHmac } from 'crypto';
import {
  setJson, requireAuth,
  getTrackerState, patchTrackerTasks, patchTrackerAccessRequests,
} from './db.js';

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_COMMENT_BODY = 4000;
const MAX_COMMENTS_PER_TASK = 80;

function normalizeCommentEntry(c) {
  if (!c || typeof c !== 'object') return null;
  let body = String(c.body ?? '').trim();
  if (!body) return null;
  if (body.length > MAX_COMMENT_BODY) body = body.slice(0, MAX_COMMENT_BODY);
  const idRaw = String(c.id || '').replace(/[^\w\-]/g, '');
  const id =
    idRaw.slice(0, 128) ||
    `c-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  let authorRole = 'webdev';
  if (c.authorRole === 'admin') authorRole = 'admin';
  else if (c.authorRole === 'client_admin') authorRole = 'client_admin';
  else if (c.authorRole === 'webdev' || c.authorRole === 'team') authorRole = 'webdev';
  const authorLabel = String(c.authorLabel || '').trim().slice(0, 80);
  let createdAt = String(c.createdAt || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}T/.test(createdAt)) {
    createdAt = new Date().toISOString();
  }
  return { id, body, createdAt, authorRole, authorLabel };
}

function normalizeCommentsArray(raw) {
  if (!Array.isArray(raw)) return undefined;
  const out = [];
  for (const item of raw) {
    if (out.length >= MAX_COMMENTS_PER_TASK) break;
    const n = normalizeCommentEntry(item);
    if (n) out.push(n);
  }
  return out;
}

function normalizeTaskPatch(task) {
  const out = {
    id: String(task.id || ''),
    status: String(task.status || 'not_started'),
    updatedAt: task.updatedAt || new Date().toISOString(),
    updatedBy: String(task.updatedBy || 'admin')
  };
  if (Object.prototype.hasOwnProperty.call(task, 'assigneeId')) {
    out.assigneeId = task.assigneeId ? String(task.assigneeId) : '';
  }
  if (Object.prototype.hasOwnProperty.call(task, 'dueDate')) {
    const d = task.dueDate;
    const s = typeof d === 'string' ? d.trim() : '';
    if (ISO_DAY.test(s)) out.dueDate = s;
  }
  if (Object.prototype.hasOwnProperty.call(task, 'comments')) {
    const normalized = normalizeCommentsArray(task.comments);
    if (normalized !== undefined) out.comments = normalized;
  }
  return out;
}

export default async function handler(req, res) {
  try {
    const session = requireAuth(req);
    if (!session) {
      return setJson(res, 401, { error: 'Authentication required' });
    }

    if (req.method === 'GET') {
      const state = await getTrackerState();
      return setJson(res, 200, {
        source: Object.keys(state.tasks).length > 0 ? 'database' : 'seed',
        state: state || { tasks: {}, accessRequests: {} }
      });
    }

    if (req.method !== 'PUT') {
      res.setHeader('Allow', 'GET, PUT');
      return setJson(res, 405, { error: 'Method not allowed' });
    }

    const incomingRole = String(req.headers['x-rockcrete-role'] || '').toLowerCase();
    const canEdit =
      incomingRole === 'admin' ||
      incomingRole === 'webdev' ||
      incomingRole === 'client_admin' ||
      incomingRole === 'team';
    if (!canEdit) {
      return setJson(res, 403, { error: 'Staff role required to save tracker' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    if (Array.isArray(body.tasks)) {
      const patches = body.tasks.map(normalizeTaskPatch).filter(p => p.id);
      await patchTrackerTasks(patches);
    }

    if (Array.isArray(body.accessRequests)) {
      const arPatches = body.accessRequests.map(normalizeTaskPatch).filter(p => p.id);
      await patchTrackerAccessRequests(arPatches);
    }

    const state = await getTrackerState();
    return setJson(res, 200, { source: 'database', state });
  } catch (error) {
    return setJson(res, 500, {
      error: 'Tracker persistence failed',
      message: error.message
    });
  }
}
