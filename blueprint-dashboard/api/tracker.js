import { list, put, readJsonBlob } from './blob-helpers.js';

const TRACKER_STATE_PATH = 'rockcrete/project-tracker-state.json';

function setJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function writeStateToBlob(state) {
  await put(TRACKER_STATE_PATH, JSON.stringify(state, null, 2), {
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true
  });
}

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
    if (req.method === 'GET') {
      const state = await readJsonBlob(TRACKER_STATE_PATH);
      return setJson(res, 200, {
        source: state ? 'blob' : 'seed',
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
    const existing = await readJsonBlob(TRACKER_STATE_PATH);
    const state = existing || { tasks: {}, accessRequests: {} };

    if (Array.isArray(body.tasks)) {
      body.tasks.forEach((task) => {
        const patch = normalizeTaskPatch(task);
        if (!patch.id) return;
        const prev = state.tasks[patch.id] || {};
        const next = { ...prev, ...patch };
        /* Caller may omit `comments` — keep persisted notes unless this PUT updates them */
        if (!Object.prototype.hasOwnProperty.call(task, 'comments')) {
          if ('comments' in prev) next.comments = prev.comments;
          else delete next.comments;
        }
        state.tasks[patch.id] = next;
      });
    }

    if (Array.isArray(body.accessRequests)) {
      body.accessRequests.forEach((item) => {
        const patch = normalizeTaskPatch(item);
        if (patch.id) {
          const prev = state.accessRequests[patch.id] || {};
          state.accessRequests[patch.id] = { ...prev, ...patch };
        }
      });
    }

    state.updatedAt = new Date().toISOString();
    await writeStateToBlob(state);
    return setJson(res, 200, { source: 'blob', state });
  } catch (error) {
    return setJson(res, 500, {
      error: 'Tracker persistence failed',
      message: error.message
    });
  }
}
