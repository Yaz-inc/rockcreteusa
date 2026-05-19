/**
 * Profile API — User profile management
 * ============================================================================
 * Allows authenticated users to view and update their own profile.
 * Super Admin can view any user's profile.
 *
 * Blob key: rockcrete/users.json
 * Auth: Requires valid session cookie (set by api/auth.js)
 * ============================================================================
 */

import { list, put, readJsonBlob } from './blob-helpers.js';

const USERS_PATH = 'rockcrete/users.json';

/* ── Helpers ────────────────────────────────────────────────────────────── */

function setJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body || '{}'); } catch { return {}; }
  }
  return {};
}

async function writeBlob(path, data) {
  await put(path, JSON.stringify(data, null, 2), {
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    access: 'private'
  });
}

async function getUsers() {
  const data = await readJsonBlob(USERS_PATH);
  return data?.users || [];
}

async function saveUsers(users) {
  await writeBlob(USERS_PATH, { users });
}

/* ── Session verification (shared with auth.js) ─────────────────────────── */

function getSessionSecret() {
  return process.env.SESSION_SECRET || 'rockcrete-default-secret-change-me-in-production';
}

function verifySession(cookie) {
  try {
    const crypto = require('crypto');
    const decoded = JSON.parse(Buffer.from(cookie, 'base64url').toString('utf8'));
    const { _sig, ...payload } = decoded;
    const expected = crypto.createHmac('sha256', getSessionSecret()).update(JSON.stringify(payload)).digest('hex');
    if (_sig.length !== expected.length) return null;
    let mismatch = 0;
    for (let i = 0; i < _sig.length; i++) {
      mismatch |= _sig.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    if (mismatch !== 0) return null;
    if (payload.expiresAt && Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

function getSessionFromRequest(req) {
  const cookieHeader = req.headers?.cookie || '';
  const match = cookieHeader.match(/rockcrete_session=([^;]+)/);
  if (!match) return null;
  return verifySession(match[1]);
}

async function requireAuth(req) {
  const session = getSessionFromRequest(req);
  if (!session) return null;
  const users = await getUsers();
  const user = users.find(u => u.id === session.userId);
  if (!user || user.status !== 'active') return null;
  return user;
}

function stripSensitive(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

/* ── Handler ────────────────────────────────────────────────────────────── */

export default async function handler(req, res) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return setJson(res, 401, { error: 'Not authenticated' });
    }

    /* ── GET: View profile ─────────────────────────────────────────────── */
    if (req.method === 'GET') {
      // If userId query param and user is super_admin, return that user's profile
      const targetId = req.query?.userId;
      if (targetId && user.role === 'super_admin') {
        const users = await getUsers();
        const target = users.find(u => u.id === targetId);
        if (!target) return setJson(res, 404, { error: 'User not found' });
        return setJson(res, 200, { user: stripSensitive(target) });
      }
      return setJson(res, 200, { user: stripSensitive(user) });
    }

    /* ── PUT: Update profile ───────────────────────────────────────────── */
    if (req.method === 'PUT') {
      const body = parseBody(req);

      // Users can only update their own profile (unless super_admin)
      const targetId = body.targetUserId || user.id;
      if (targetId !== user.id && user.role !== 'super_admin') {
        return setJson(res, 403, { error: 'You can only update your own profile' });
      }

      const users = await getUsers();
      const idx = users.findIndex(u => u.id === targetId);
      if (idx < 0) return setJson(res, 404, { error: 'User not found' });

      // Fields a user can update on their own profile
      const allowedFields = ['displayName', 'phone', 'title', 'organization', 'avatar'];
      // Super admin can also update these
      const adminFields = ['name', 'email', 'role', 'status', 'moduleAccess', 'assignedTasks'];

      const updatable = user.role === 'super_admin'
        ? [...allowedFields, ...adminFields]
        : allowedFields;

      for (const field of updatable) {
        if (body[field] !== undefined) {
          // Validate specific fields
          if (field === 'email') {
            const email = String(body.email).trim().toLowerCase();
            if (!email.includes('@')) continue;
            // Check duplicate
            const dup = users.find(u => u.id !== targetId && u.email.toLowerCase() === email);
            if (dup) continue;
            users[idx].email = email;
          } else if (field === 'role') {
            const VALID_ROLES = ['super_admin', 'admin', 'pm', 'webdev', 'team', 'client_admin', 'client'];
            if (!VALID_ROLES.includes(body.role)) continue;
            // Cannot change own role to/from super_admin via profile
            if (users[idx].role === 'super_admin' && body.role !== 'super_admin') continue;
            users[idx].role = body.role;
          } else if (field === 'status') {
            if (!['active', 'suspended', 'invited'].includes(body.status)) continue;
            if (users[idx].role === 'super_admin') continue; // Can't suspend super_admin
            users[idx].status = body.status;
          } else if (field === 'preferences') {
            // Merge preferences
            users[idx].preferences = { ...users[idx].preferences, ...body.preferences };
          } else if (field === 'moduleAccess') {
            if (typeof body.moduleAccess === 'object') {
              users[idx].moduleAccess = body.moduleAccess;
            }
          } else if (field === 'assignedTasks') {
            if (Array.isArray(body.assignedTasks)) {
              users[idx].assignedTasks = body.assignedTasks;
            }
          } else {
            users[idx][field] = String(body[field] || '').trim().slice(0, 200);
          }
        }
      }

      // Handle preferences separately (they're nested)
      if (body.preferences && typeof body.preferences === 'object') {
        users[idx].preferences = { ...users[idx].preferences, ...body.preferences };
      }

      users[idx].updatedAt = new Date().toISOString();
      await saveUsers(users);

      return setJson(res, 200, { ok: true, user: stripSensitive(users[idx]) });
    }

    /* ── Method not allowed ────────────────────────────────────────────── */
    res.setHeader('Allow', 'GET, PUT');
    return setJson(res, 405, { error: 'Method not allowed' });

  } catch (error) {
    console.error('Profile API error:', error);
    return setJson(res, 500, { error: 'Profile operation failed', message: error.message });
  }
}
