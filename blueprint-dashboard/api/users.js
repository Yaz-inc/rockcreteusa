/**
 * Users API — Super Admin user management
 * ============================================================================
 * CRUD operations for user accounts. Only accessible by super_admin role.
 * Includes module-level access control management and invitation flow.
 *
 * Database: Supabase (replaces Vercel Blob)
 * Auth: Requires super_admin session cookie
 * ============================================================================
 */

import {
  setJson, parseBody, generateId, stripSensitive,
  getAllUsers, getUserByEmail, getUserById, upsertUser, updateUser, deleteUser,
  getSettings, getDefaultModuleAccess, requireAuth, requireSuperAdmin,
  verifySession, MODULE_REGISTRY, VALID_ROLES, ACCESS_LEVELS,
} from './db.js';

import { randomBytes } from 'crypto';

/* ── Password hashing ───────────────────────────────────────────────────── */

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const hash = Buffer.from(bits).toString('hex');
  return `pbkdf2:100000:${salt}:${hash}`;
}

/* ── Handler ────────────────────────────────────────────────────────────── */

export default async function handler(req, res) {
  try {
    const admin = await requireSuperAdminReq(req);
    if (!admin) {
      return setJson(res, 403, { error: 'Super Admin access required' });
    }

    /* ── GET: List users / get modules registry ────────────────────────── */
    if (req.method === 'GET') {
      const action = req.query?.action || '';

      if (action === 'modules') {
        return setJson(res, 200, {
          modules: MODULE_REGISTRY,
          accessLevels: ACCESS_LEVELS,
          roleDefaults: {
            super_admin: getDefaultModuleAccess('super_admin'),
            admin: getDefaultModuleAccess('admin'),
            pm: getDefaultModuleAccess('pm'),
            webdev: getDefaultModuleAccess('webdev'),
            team: getDefaultModuleAccess('team'),
            client_admin: getDefaultModuleAccess('client_admin'),
            client: getDefaultModuleAccess('client'),
          }
        });
      }

      if (req.query?.userId) {
        const user = await getUserById(req.query.userId);
        if (!user) return setJson(res, 404, { error: 'User not found' });
        return setJson(res, 200, { user: stripSensitive(user) });
      }

      const users = await getAllUsers();
      return setJson(res, 200, { users: users.map(stripSensitive), total: users.length });
    }

    /* ── POST: Create new user ─────────────────────────────────────────── */
    if (req.method === 'POST' && !req.query?.action) {
      const body = parseBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const name = String(body.name || '').trim();
      const role = String(body.role || 'client').toLowerCase();
      const displayName = String(body.displayName || name.split(' ')[0] || '').trim();
      const phone = String(body.phone || '').trim();
      const title = String(body.title || '').trim();
      const organization = String(body.organization || '').trim();
      const moduleAccess = body.moduleAccess || null;

      if (!email || !password || !name) {
        return setJson(res, 400, { error: 'Email, password, and name are required' });
      }
      if (password.length < 8) {
        return setJson(res, 400, { error: 'Password must be at least 8 characters' });
      }
      if (!VALID_ROLES.includes(role)) {
        return setJson(res, 400, { error: `Invalid role. Valid: ${VALID_ROLES.join(', ')}` });
      }
      if (role === 'super_admin') {
        return setJson(res, 400, { error: 'Cannot create Super Admin accounts' });
      }

      const existing = await getUserByEmail(email);
      if (existing) {
        return setJson(res, 409, { error: 'A user with this email already exists' });
      }

      const passwordHash = await hashPassword(password);
      const newUser = await upsertUser({
        id: generateId('usr'),
        email,
        passwordHash,
        name,
        displayName,
        role,
        phone,
        title,
        organization,
        preferences: { language: 'en', theme: 'auto' },
        moduleAccess: moduleAccess || getDefaultModuleAccess(role),
        lastLoginAt: null,
        createdBy: admin.id,
        status: 'active',
      });

      return setJson(res, 201, { ok: true, user: stripSensitive(newUser) });
    }

    /* ── PUT: Update user ──────────────────────────────────────────────── */
    if (req.method === 'PUT') {
      const body = parseBody(req);
      const userId = body.userId;

      if (!userId) {
        return setJson(res, 400, { error: 'userId is required' });
      }

      const target = await getUserById(userId);
      if (!target) {
        return setJson(res, 404, { error: 'User not found' });
      }

      // Cannot modify super_admin
      if (target.role === 'super_admin' && target.id !== admin.id) {
        return setJson(res, 403, { error: 'Cannot modify another Super Admin' });
      }

      const updates = {};

      if (body.name) updates.name = String(body.name).trim().slice(0, 200);
      if (body.displayName) updates.displayName = String(body.displayName).trim().slice(0, 100);
      if (body.email) {
        const email = String(body.email).trim().toLowerCase();
        const dup = await getUserByEmail(email);
        if (dup && dup.id !== userId) return setJson(res, 409, { error: 'Email already in use' });
        updates.email = email;
      }
      if (body.phone !== undefined) updates.phone = String(body.phone).trim();
      if (body.title !== undefined) updates.title = String(body.title).trim();
      if (body.organization !== undefined) updates.organization = String(body.organization).trim();
      if (body.role) {
        if (!VALID_ROLES.includes(body.role)) return setJson(res, 400, { error: 'Invalid role' });
        if (body.role === 'super_admin') return setJson(res, 400, { error: 'Cannot assign Super Admin role' });
        if (target.role === 'super_admin') return setJson(res, 400, { error: 'Cannot change Super Admin role' });
        updates.role = body.role;
      }
      if (body.status) {
        if (!['active', 'suspended', 'invited'].includes(body.status)) return setJson(res, 400, { error: 'Invalid status' });
        if (target.role === 'super_admin') return setJson(res, 400, { error: 'Cannot change Super Admin status' });
        updates.status = body.status;
      }
      if (body.moduleAccess && typeof body.moduleAccess === 'object') {
        updates.moduleAccess = body.moduleAccess;
      }
      if (body.applyRoleDefaults === true) {
        const currentRole = updates.role || target.role;
        updates.moduleAccess = getDefaultModuleAccess(currentRole);
      }

      const updated = await updateUser(userId, updates);
      return setJson(res, 200, { ok: true, user: stripSensitive(updated) });
    }

    /* ── DELETE: Remove user ───────────────────────────────────────────── */
    if (req.method === 'DELETE') {
      const body = parseBody(req);
      const userId = body.userId;

      if (!userId) {
        return setJson(res, 400, { error: 'userId is required' });
      }

      const target = await getUserById(userId);
      if (!target) {
        return setJson(res, 404, { error: 'User not found' });
      }
      if (target.role === 'super_admin') {
        return setJson(res, 403, { error: 'Cannot delete Super Admin' });
      }

      await deleteUser(userId);
      return setJson(res, 200, { ok: true, message: 'User removed' });
    }

    /* ── POST: Reset user password (Super Admin) ──────────────────────── */
    if (req.method === 'POST' && req.query?.action === 'reset-password') {
      const body = parseBody(req);
      const userId = body.userId;
      const newPassword = String(body.newPassword || '');

      if (!userId || !newPassword) {
        return setJson(res, 400, { error: 'userId and newPassword are required' });
      }
      if (newPassword.length < 8) {
        return setJson(res, 400, { error: 'Password must be at least 8 characters' });
      }

      const target = await getUserById(userId);
      if (!target) return setJson(res, 404, { error: 'User not found' });
      if (target.role === 'super_admin') {
        return setJson(res, 403, { error: 'Cannot reset Super Admin password via this endpoint' });
      }

      const passwordHash = await hashPassword(newPassword);
      await updateUser(userId, { passwordHash });

      return setJson(res, 200, { ok: true, message: 'Password reset successfully' });
    }

    /* ── POST: Invite user via email ───────────────────────────────────── */
    if (req.method === 'POST' && req.query?.action === 'invite') {
      const cookieHeader = req.headers?.cookie || '';
      const match = cookieHeader.match(/rockcrete_session=([^;]+)/);
      if (!match) return setJson(res, 401, { error: 'Not authenticated' });
      const session = verifySession(match[1]);
      if (!session) return setJson(res, 401, { error: 'Invalid session' });
      const inviter = await getUserById(session.userId);
      if (!inviter || inviter.status !== 'active') return setJson(res, 401, { error: 'Not authenticated' });
      if (!['super_admin', 'admin', 'client_admin'].includes(inviter.role)) {
        return setJson(res, 403, { error: 'Only Admin or Client Admin can invite users' });
      }

      const body = parseBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const name = String(body.name || '').trim();
      const role = String(body.role || 'team').toLowerCase();

      if (!email || !name) {
        return setJson(res, 400, { error: 'Email and name are required' });
      }

      if (inviter.role === 'client_admin' && !['client', 'client_admin', 'team'].includes(role)) {
        return setJson(res, 403, { error: 'Client Admin can only invite Client or Team roles' });
      }

      const existing = await getUserByEmail(email);
      if (existing) {
        return setJson(res, 409, { error: 'A user with this email already exists' });
      }

      // Generate temporary password
      const tempPassword = randomBytes(6).toString('base64url').slice(0, 12);
      const passwordHash = await hashPassword(tempPassword);

      const newUser = await upsertUser({
        id: generateId('usr'),
        email,
        passwordHash,
        name,
        displayName: name.split(' ')[0] || name,
        role,
        phone: '',
        title: String(body.title || '').trim(),
        organization: String(body.organization || '').trim(),
        preferences: { language: 'en', theme: 'auto' },
        moduleAccess: body.moduleAccess || getDefaultModuleAccess(role),
        lastLoginAt: null,
        createdBy: inviter.id,
        status: 'invited',
        invitedBy: inviter.id,
        tempPassword: true,
      });

      // Send invitation email
      const settings = await getSettings();
      const emailConfig = settings?.email || {};
      const apiKey = emailConfig.resendApiKey || process.env.RESEND_API_KEY || '';
      const fromEmail = emailConfig.fromEmail || process.env.RESEND_FROM_EMAIL || 'noreply@newmindsgroup.com';
      const fromName = emailConfig.fromName || process.env.RESEND_FROM_NAME || 'Rockcrete USA Blueprint';

      if (apiKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
            to: [email],
            subject: `You're Invited — Rockcrete USA Blueprint Portal`,
            html: `
              <div style="font-family:'Inter',system-ui,sans-serif;max-width:480px;margin:0 auto;padding:2rem;background:#fafaf7;border-radius:12px;">
                <h2 style="color:#1e3a5f;margin:0 0 1rem;">You're Invited!</h2>
                <p style="color:#3a3f44;font-size:0.95rem;">Hello ${name},</p>
                <p style="color:#3a3f44;font-size:0.95rem;"><strong>${inviter.displayName || inviter.name}</strong> has invited you to join the Rockcrete USA Blueprint Portal as <strong>${role.replace('_', ' ').toUpperCase()}</strong>.</p>
                <div style="background:#1e3a5f;color:#fff;padding:1.25rem;border-radius:8px;margin:1.5rem 0;">
                  <p style="margin:0 0 0.5rem;font-size:0.85rem;opacity:0.8;">Your temporary credentials:</p>
                  <p style="margin:0;font-size:0.95rem;"><strong>Email:</strong> ${email}</p>
                  <p style="margin:0;font-size:0.95rem;"><strong>Password:</strong> ${tempPassword}</p>
                </div>
                <p style="color:#6b7177;font-size:0.85rem;">Please log in and change your password immediately. This temporary password will expire for security.</p>
                <a href="${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'https://blueprint-dashboard-chi.vercel.app'}" style="display:inline-block;background:#1e3a5f;color:#fff;padding:0.75rem 1.5rem;border-radius:6px;text-decoration:none;font-weight:600;margin-top:0.5rem;">Open Portal</a>
              </div>
            `,
          }),
        });
      }

      return setJson(res, 201, {
        ok: true,
        user: stripSensitive(newUser),
        tempPassword: apiKey ? '(sent via email)' : tempPassword,
        message: apiKey ? 'Invitation sent via email' : 'User created. Share the temporary password manually.',
      });
    }

    /* ── POST: Assign tasks to a user ─────────────────────────────────── */
    if (req.method === 'POST' && req.query?.action === 'assign-tasks') {
      const body = parseBody(req);
      const userId = body.userId;
      const taskIds = body.taskIds;

      if (!userId || !Array.isArray(taskIds)) {
        return setJson(res, 400, { error: 'userId and taskIds array are required' });
      }

      const target = await getUserById(userId);
      if (!target) return setJson(res, 404, { error: 'User not found' });

      // Use the new tasks table for assignment
      const { getAllTasks, updateTask } = await import('./db.js');
      for (const taskId of taskIds) {
        await updateTask(taskId, { assigneeId: userId });
      }

      return setJson(res, 200, { ok: true, assignedTaskIds: taskIds });
    }

    /* ── POST: Remove task from a user ────────────────────────────────── */
    if (req.method === 'POST' && req.query?.action === 'unassign-tasks') {
      const body = parseBody(req);
      const userId = body.userId;
      const taskIds = body.taskIds;

      if (!userId || !Array.isArray(taskIds)) {
        return setJson(res, 400, { error: 'userId and taskIds array are required' });
      }

      const { getAllTasks, updateTask } = await import('./db.js');
      for (const taskId of taskIds) {
        await updateTask(taskId, { assigneeId: null });
      }

      return setJson(res, 200, { ok: true, unassignedTaskIds: taskIds });
    }

    /* ── Method not allowed ────────────────────────────────────────────── */
    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return setJson(res, 405, { error: 'Method not allowed' });

  } catch (error) {
    console.error('Users API error:', error);
    return setJson(res, 500, { error: 'Users operation failed', message: error.message });
  }
}

/* ── Local requireSuperAdmin that uses db.js ──────────────────────────── */
async function requireSuperAdminReq(req) {
  const { user } = await requireAuth(req);
  if (!requireSuperAdmin(user)) return null;
  return user;
}
