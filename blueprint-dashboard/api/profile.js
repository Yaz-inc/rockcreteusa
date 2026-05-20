/**
 * Profile API — User profile management
 * ============================================================================
 * Allows authenticated users to view and update their own profile.
 * Super Admin can view/update any user's profile.
 *
 * Database: Supabase (replaces Vercel Blob)
 * Auth: Requires valid session cookie
 * ============================================================================
 */

import {
  setJson, parseBody, stripSensitive,
  getUserById, updateUser,
  requireAuth, requireSuperAdmin, VALID_ROLES,
} from './db.js';

/* ── Handler ────────────────────────────────────────────────────────────── */

export default async function handler(req, res) {
  try {
    const { user } = await requireAuth(req);
    if (!user) {
      return setJson(res, 401, { error: 'Not authenticated' });
    }

    /* ── GET: View profile ─────────────────────────────────────────────── */
    if (req.method === 'GET') {
      const targetId = req.query?.userId;
      if (targetId && requireSuperAdmin(user)) {
        const target = await getUserById(targetId);
        if (!target) return setJson(res, 404, { error: 'User not found' });
        return setJson(res, 200, { user: stripSensitive(target) });
      }
      return setJson(res, 200, { user: stripSensitive(user) });
    }

    /* ── PUT: Update profile ───────────────────────────────────────────── */
    if (req.method === 'PUT') {
      const body = parseBody(req);

      const targetId = body.targetUserId || user.id;
      if (targetId !== user.id && !requireSuperAdmin(user)) {
        return setJson(res, 403, { error: 'You can only update your own profile' });
      }

      const target = await getUserById(targetId);
      if (!target) return setJson(res, 404, { error: 'User not found' });

      const updates = {};
      const allowedFields = ['displayName', 'phone', 'title', 'organization', 'avatar'];
      const adminFields = ['name', 'email', 'role', 'status', 'moduleAccess'];
      const updatable = requireSuperAdmin(user)
        ? [...allowedFields, ...adminFields]
        : allowedFields;

      for (const field of updatable) {
        if (body[field] !== undefined) {
          if (field === 'email') {
            const email = String(body.email).trim().toLowerCase();
            if (!email.includes('@')) continue;
            const dup = await getUserById(targetId);
            // Check duplicate via email lookup
            const { getUserByEmail } = await import('./db.js');
            const existing = await getUserByEmail(email);
            if (existing && existing.id !== targetId) continue;
            updates.email = email;
          } else if (field === 'role') {
            if (!VALID_ROLES.includes(body.role)) continue;
            if (target.role === 'super_admin' && body.role !== 'super_admin') continue;
            updates.role = body.role;
          } else if (field === 'status') {
            if (!['active', 'suspended', 'invited'].includes(body.status)) continue;
            if (target.role === 'super_admin') continue;
            updates.status = body.status;
          } else if (field === 'moduleAccess') {
            if (typeof body.moduleAccess === 'object') {
              updates.moduleAccess = body.moduleAccess;
            }
          } else if (field === 'displayName') {
            updates.displayName = String(body[field] || '').trim().slice(0, 100);
          } else if (field === 'avatar') {
            updates.avatar = body.avatar;
          } else {
            updates[field] = String(body[field] || '').trim().slice(0, 200);
          }
        }
      }

      // Handle preferences separately
      if (body.preferences && typeof body.preferences === 'object') {
        updates.preferences = { ...target.preferences, ...body.preferences };
      }

      const updated = await updateUser(targetId, updates);
      return setJson(res, 200, { ok: true, user: stripSensitive(updated) });
    }

    /* ── Method not allowed ────────────────────────────────────────────── */
    res.setHeader('Allow', 'GET, PUT');
    return setJson(res, 405, { error: 'Method not allowed' });

  } catch (error) {
    console.error('Profile API error:', error);
    return setJson(res, 500, { error: 'Profile operation failed', message: error.message });
  }
}
