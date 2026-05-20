/**
 * Milestones API — CRUD for task milestones
 * ============================================================================
 * Stores milestone definitions per task in Supabase.
 * Completely isolated from tracker.js — reads project data only to validate
 * task IDs, never writes to it.
 * ============================================================================
 */

import {
  setJson, requireAuth,
  getAllMilestones, createMilestone, updateMilestone, deleteMilestone,
  generateId,
} from './db.js';

const VALID_STATUSES = ['not-started', 'in-progress', 'complete', 'blocked'];

function canEdit(role) {
  return ['admin', 'webdev', 'team'].includes(role);
}

function normalizeMilestone(ms, existing) {
  const out = {
    id: String(ms.id || existing?.id || generateId('ms')),
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

export default async function handler(req, res) {
  try {
    const session = requireAuth(req);
    if (!session) {
      return setJson(res, 401, { error: 'Authentication required' });
    }

    const incomingRole = String(req.headers['x-rockcrete-role'] || '').toLowerCase();

    /* ── GET: Fetch milestones ─────────────────────────────────────────── */
    if (req.method === 'GET') {
      const data = await getAllMilestones();
      return setJson(res, 200, {
        source: Object.keys(data).length > 0 ? 'database' : 'empty',
        milestones: data
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

      const allMilestones = await getAllMilestones();
      const existing = allMilestones[taskId] || { taskId, milestones: [], createdAt: new Date().toISOString() };

      const newMilestones = rawMilestones.map((ms, i) => {
        const normalized = normalizeMilestone({ ...ms, order: ms.order ?? (existing.milestones.length + i + 1), updatedBy: incomingRole });
        return normalized;
      }).filter(Boolean);

      if (newMilestones.length === 0) {
        return setJson(res, 400, { error: 'No valid milestones provided' });
      }

      // Insert each new milestone into the database
      for (const ms of newMilestones) {
        await createMilestone({ ...ms, taskId });
      }

      const data = await getAllMilestones();
      return setJson(res, 201, { source: 'database', milestones: data });
    }

    /* ── PUT: Update a milestone ───────────────────────────────────────── */
    if (req.method === 'PUT') {
      if (!canEdit(incomingRole)) {
        return setJson(res, 403, { error: 'Staff role required to update milestones' });
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const { taskId, milestoneId, milestone: rawMs, milestones: bulkMs } = body;

      // Bulk update
      if (bulkMs && Array.isArray(bulkMs)) {
        if (!taskId) {
          return setJson(res, 400, { error: 'taskId is required for bulk updates' });
        }
        const allMilestones = await getAllMilestones();
        const taskEntry = allMilestones[taskId];
        if (!taskEntry) {
          return setJson(res, 404, { error: 'Task milestones not found' });
        }
        for (const patch of bulkMs) {
          const existing = taskEntry.milestones.find(m => m.id === patch.id);
          if (existing) {
            const normalized = normalizeMilestone({ ...patch, updatedBy: incomingRole }, existing);
            if (normalized) {
              await updateMilestone(patch.id, normalized);
            }
          }
        }
        const data = await getAllMilestones();
        return setJson(res, 200, { source: 'database', milestones: data });
      }

      // Single milestone update
      if (!taskId || !milestoneId) {
        return setJson(res, 400, { error: 'taskId and milestoneId are required' });
      }

      const allMilestones = await getAllMilestones();
      const taskEntry = allMilestones[taskId];
      if (!taskEntry) {
        return setJson(res, 404, { error: 'Task milestones not found' });
      }

      const existing = taskEntry.milestones.find(m => m.id === milestoneId);
      if (!existing) {
        return setJson(res, 404, { error: 'Milestone not found' });
      }

      const normalized = normalizeMilestone({ ...rawMs, id: milestoneId, updatedBy: incomingRole }, existing);
      if (!normalized) {
        return setJson(res, 400, { error: 'Invalid milestone data' });
      }

      await updateMilestone(milestoneId, normalized);
      const data = await getAllMilestones();
      return setJson(res, 200, { source: 'database', milestones: data });
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

      const allMilestones = await getAllMilestones();
      const taskEntry = allMilestones[taskId];
      if (!taskEntry) {
        return setJson(res, 404, { error: 'Task milestones not found' });
      }

      const ms = taskEntry.milestones.find(m => m.id === milestoneId);
      if (!ms) {
        return setJson(res, 404, { error: 'Milestone not found' });
      }

      await deleteMilestone(milestoneId);
      const data = await getAllMilestones();
      return setJson(res, 200, { source: 'database', milestones: data });
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
