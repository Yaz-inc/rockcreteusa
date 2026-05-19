/**
 * Users API — Super Admin user management
 * ============================================================================
 * CRUD operations for user accounts. Only accessible by super_admin role.
 * Includes module-level access control management.
 *
 * Blob key: rockcrete/users.json
 * Auth: Requires super_admin session cookie
 * ============================================================================
 */

import { list, put, readJsonBlob } from './blob-helpers.js';
import { randomBytes } from 'crypto';

const USERS_PATH = 'rockcrete/users.json';

/* ── Constants ─────────────────────────────────────────────────────────── */

const VALID_ROLES = ['super_admin', 'admin', 'pm', 'webdev', 'devops', 'seo', 'ui_ux', 'team', 'client_admin', 'client'];

const MODULE_REGISTRY = [
  { id: 'home',         name: 'Home Dashboard',      category: 'Navigation' },
  { id: 'schedule',     name: 'Schedule',             category: 'Navigation' },
  { id: 'tracker',      name: 'Project Tracker',      category: 'Project' },
  { id: 'progress',     name: 'Team Progress',        category: 'Project' },
  { id: 'scope',        name: 'Scope',                category: 'Project' },
  { id: 'risks',        name: 'Risks & Open Items',   category: 'Project' },
  { id: 'phase-1',      name: 'Phase 1: Discovery',   category: 'Phases' },
  { id: 'phase-2',      name: 'Phase 2: Design',      category: 'Phases' },
  { id: 'phase-3',      name: 'Phase 3: Build',       category: 'Phases' },
  { id: 'phase-4',      name: 'Phase 4: Post-Launch', category: 'Phases' },
  { id: 'integrations', name: 'Integrations',         category: 'Technical' },
  { id: 'migration',    name: 'Data Migration',       category: 'Technical' },
  { id: 'performance',  name: 'Performance Targets',  category: 'Technical' },
  { id: 'deliverables', name: 'Deliverables',         category: 'Project' },
  { id: 'team',         name: 'Team & Contacts',      category: 'Navigation' },
  { id: 'documents',    name: 'Documents',            category: 'Project' },
  { id: 'panel',        name: 'Operations Panel',     category: 'Admin' },
  { id: 'pricing',      name: 'Pricing & Invoicing',  category: 'Admin' },
  { id: 'profile',      name: 'My Profile',           category: 'Personal' },
  { id: 'users',        name: 'User Management',      category: 'Admin' },
  { id: 'settings',     name: 'System Settings',      category: 'Admin' },
];

const ACCESS_LEVELS = ['none', 'read', 'write', 'admin'];

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

function generateId(prefix) {
  return prefix + '-' + randomBytes(4).toString('hex') + Date.now().toString(36).slice(-4);
}

async function writeBlob(path, data) {
  await put(path, JSON.stringify(data, null, 2), {
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true
  });
}

async function getUsers() {
  const data = await readJsonBlob(USERS_PATH);
  return data?.users || [];
}

async function saveUsers(users) {
  await writeBlob(USERS_PATH, { users });
}

function stripSensitive(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

/* ── Session verification ───────────────────────────────────────────────── */

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

async function requireSuperAdmin(req) {
  const cookieHeader = req.headers?.cookie || '';
  const match = cookieHeader.match(/rockcrete_session=([^;]+)/);
  if (!match) return null;
  const session = verifySession(match[1]);
  if (!session) return null;
  const users = await getUsers();
  const user = users.find(u => u.id === session.userId);
  if (!user || user.role !== 'super_admin' || user.status !== 'active') return null;
  return user;
}

function getDefaultModuleAccess(role) {
  const allModules = MODULE_REGISTRY.map(m => m.id);
  const noAdmin = ['users', 'settings'];
  const noStaff = ['users', 'settings', 'pricing', 'panel'];
  const noClient = ['users', 'settings', 'pricing', 'panel', 'risks'];
  const noClientRead = ['users', 'settings', 'pricing', 'panel', 'risks', 'tracker', 'progress'];

  const defaults = {
    super_admin:   Object.fromEntries(allModules.map(m => [m, 'admin'])),
    admin:         Object.fromEntries(allModules.map(m => [m, noAdmin.includes(m) ? 'none' : 'admin'])),
    pm:            Object.fromEntries(allModules.map(m => [m, [...noAdmin, 'pricing'].includes(m) ? 'none' : 'write'])),
    webdev:        Object.fromEntries(allModules.map(m => [m, noStaff.includes(m) ? 'none' : 'write'])),
    devops:        Object.fromEntries(allModules.map(m => [m, [...noStaff, 'scope', 'risks', 'deliverables'].includes(m) ? 'none' : 'write'])),
    seo:           Object.fromEntries(allModules.map(m => [m, [...noStaff, 'migration', 'performance'].includes(m) ? 'none' : 'read'])),
    ui_ux:         Object.fromEntries(allModules.map(m => [m, [...noStaff, 'migration'].includes(m) ? 'none' : 'write'])),
    team:          Object.fromEntries(allModules.map(m => [m, noStaff.includes(m) ? 'none' : 'write'])),
    client_admin:  Object.fromEntries(allModules.map(m => [m, noClient.includes(m) ? 'none' : 'read'])),
    client:        Object.fromEntries(allModules.map(m => [m, noClientRead.includes(m) ? 'none' : 'read'])),
  };
  return defaults[role] || defaults.client;
}

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
    const admin = await requireSuperAdmin(req);
    if (!admin) {
      return setJson(res, 403, { error: 'Super Admin access required' });
    }

    /* ── GET: List users / get modules registry ────────────────────────── */
    if (req.method === 'GET') {
      const action = req.query?.action || '';

      // Get module registry
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

      // Get single user
      if (req.query?.userId) {
        const users = await getUsers();
        const user = users.find(u => u.id === req.query.userId);
        if (!user) return setJson(res, 404, { error: 'User not found' });
        return setJson(res, 200, { user: stripSensitive(user) });
      }

      // List all users
      const users = await getUsers();
      return setJson(res, 200, {
        users: users.map(stripSensitive),
        total: users.length
      });
    }

    /* ── POST: Create new user ─────────────────────────────────────────── */
    if (req.method === 'POST') {
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

      const users = await getUsers();
      const existing = users.find(u => u.email.toLowerCase() === email);
      if (existing) {
        return setJson(res, 409, { error: 'A user with this email already exists' });
      }

      const passwordHash = await hashPassword(password);
      const newUser = {
        id: generateId('usr'),
        email,
        passwordHash,
        name,
        displayName,
        role,
        avatar: null,
        phone,
        title,
        organization,
        preferences: { language: 'en', theme: 'auto' },
        assignedTasks: body.assignedTasks || [],
        moduleAccess: moduleAccess || getDefaultModuleAccess(role),
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: admin.id,
        status: 'active',
      };

      users.push(newUser);
      await saveUsers(users);

      return setJson(res, 201, { ok: true, user: stripSensitive(newUser) });
    }

    /* ── PUT: Update user (role, status, moduleAccess, etc.) ──────────── */
    if (req.method === 'PUT') {
      const body = parseBody(req);
      const userId = body.userId;

      if (!userId) {
        return setJson(res, 400, { error: 'userId is required' });
      }

      const users = await getUsers();
      const idx = users.findIndex(u => u.id === userId);
      if (idx < 0) {
        return setJson(res, 404, { error: 'User not found' });
      }

      const target = users[idx];

      // Cannot modify super_admin
      if (target.role === 'super_admin' && target.id !== admin.id) {
        return setJson(res, 403, { error: 'Cannot modify another Super Admin' });
      }

      // Update fields
      if (body.name) users[idx].name = String(body.name).trim().slice(0, 200);
      if (body.displayName) users[idx].displayName = String(body.displayName).trim().slice(0, 100);
      if (body.email) {
        const email = String(body.email).trim().toLowerCase();
        const dup = users.find(u => u.id !== userId && u.email.toLowerCase() === email);
        if (dup) return setJson(res, 409, { error: 'Email already in use' });
        users[idx].email = email;
      }
      if (body.phone !== undefined) users[idx].phone = String(body.phone).trim();
      if (body.title !== undefined) users[idx].title = String(body.title).trim();
      if (body.organization !== undefined) users[idx].organization = String(body.organization).trim();
      if (body.role) {
        if (!VALID_ROLES.includes(body.role)) return setJson(res, 400, { error: 'Invalid role' });
        if (body.role === 'super_admin') return setJson(res, 400, { error: 'Cannot assign Super Admin role' });
        if (target.role === 'super_admin') return setJson(res, 400, { error: 'Cannot change Super Admin role' });
        users[idx].role = body.role;
      }
      if (body.status) {
        if (!['active', 'suspended', 'invited'].includes(body.status)) return setJson(res, 400, { error: 'Invalid status' });
        if (target.role === 'super_admin') return setJson(res, 400, { error: 'Cannot change Super Admin status' });
        users[idx].status = body.status;
      }
      if (body.moduleAccess && typeof body.moduleAccess === 'object') {
        users[idx].moduleAccess = body.moduleAccess;
      }
      if (body.assignedTasks && Array.isArray(body.assignedTasks)) {
        users[idx].assignedTasks = body.assignedTasks;
      }
      // Apply role defaults to module access
      if (body.applyRoleDefaults === true) {
        users[idx].moduleAccess = getDefaultModuleAccess(users[idx].role);
      }

      users[idx].updatedAt = new Date().toISOString();
      await saveUsers(users);

      return setJson(res, 200, { ok: true, user: stripSensitive(users[idx]) });
    }

    /* ── DELETE: Remove user ───────────────────────────────────────────── */
    if (req.method === 'DELETE') {
      const body = parseBody(req);
      const userId = body.userId;

      if (!userId) {
        return setJson(res, 400, { error: 'userId is required' });
      }

      const users = await getUsers();
      const target = users.find(u => u.id === userId);
      if (!target) {
        return setJson(res, 404, { error: 'User not found' });
      }

      if (target.role === 'super_admin') {
        return setJson(res, 403, { error: 'Cannot delete Super Admin' });
      }

      const filtered = users.filter(u => u.id !== userId);
      await saveUsers(filtered);

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

      const users = await getUsers();
      const idx = users.findIndex(u => u.id === userId);
      if (idx < 0) return setJson(res, 404, { error: 'User not found' });

      if (users[idx].role === 'super_admin') {
        return setJson(res, 403, { error: 'Cannot reset Super Admin password via this endpoint' });
      }

      const passwordHash = await hashPassword(newPassword);
      users[idx].passwordHash = passwordHash;
      users[idx].updatedAt = new Date().toISOString();
      await saveUsers(users);

      return setJson(res, 200, { ok: true, message: 'Password reset successfully' });
    }

    /* ── POST: Invite user via email (Admin/Client_Admin/Super_Admin) ─── */
    if (req.method === 'POST' && req.query?.action === 'invite') {
      // Allow super_admin, admin, and client_admin to invite
      const cookieHeader = req.headers?.cookie || '';
      const match = cookieHeader.match(/rockcrete_session=([^;]+)/);
      if (!match) return setJson(res, 401, { error: 'Not authenticated' });
      const session = verifySession(match[1]);
      if (!session) return setJson(res, 401, { error: 'Invalid session' });
      const users = await getUsers();
      const inviter = users.find(u => u.id === session.userId);
      if (!inviter || inviter.status !== 'active') return setJson(res, 401, { error: 'Not authenticated' });
      if (!['super_admin', 'admin', 'client_admin'].includes(inviter.role)) {
        return setJson(res, 403, { error: 'Only Admin or Client Admin can invite users' });
      }

      const body = parseBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const name = String(body.name || '').trim();
      const role = String(body.role || 'team').toLowerCase();
      const assignedTasks = body.assignedTasks || [];

      if (!email || !name) {
        return setJson(res, 400, { error: 'Email and name are required' });
      }

      // Client admin can only invite with limited roles
      if (inviter.role === 'client_admin' && !['client', 'client_admin', 'team'].includes(role)) {
        return setJson(res, 403, { error: 'Client Admin can only invite Client or Team roles' });
      }

      const existing = users.find(u => u.email.toLowerCase() === email);
      if (existing) {
        return setJson(res, 409, { error: 'A user with this email already exists' });
      }

      // Generate temporary password
      const tempPassword = randomBytes(6).toString('base64url').slice(0, 12);
      const passwordHash = await hashPassword(tempPassword);

      const newUser = {
        id: generateId('usr'),
        email,
        passwordHash,
        name,
        displayName: name.split(' ')[0] || name,
        role,
        avatar: null,
        phone: '',
        title: String(body.title || '').trim(),
        organization: String(body.organization || '').trim(),
        preferences: { language: 'en', theme: 'auto' },
        assignedTasks,
        moduleAccess: body.moduleAccess || getDefaultModuleAccess(role),
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: inviter.id,
        status: 'invited',
        invitedBy: inviter.id,
        tempPassword: true, // Force password change on first login
      };

      users.push(newUser);
      await saveUsers(users);

      // Send invitation email
      const settingsData = await readJsonBlob('rockcrete/settings.json');
      const emailConfig = settingsData?.email || {};
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
      const taskIds = body.taskIds; // Array of task IDs

      if (!userId || !Array.isArray(taskIds)) {
        return setJson(res, 400, { error: 'userId and taskIds array are required' });
      }

      const users = await getUsers();
      const idx = users.findIndex(u => u.id === userId);
      if (idx < 0) return setJson(res, 404, { error: 'User not found' });

      // Merge with existing assignments (no duplicates)
      const existing = new Set(users[idx].assignedTasks || []);
      taskIds.forEach(t => existing.add(t));
      users[idx].assignedTasks = [...existing];
      users[idx].updatedAt = new Date().toISOString();
      await saveUsers(users);

      return setJson(res, 200, { ok: true, assignedTasks: users[idx].assignedTasks });
    }

    /* ── POST: Remove task from a user ────────────────────────────────── */
    if (req.method === 'POST' && req.query?.action === 'unassign-tasks') {
      const body = parseBody(req);
      const userId = body.userId;
      const taskIds = body.taskIds; // Array of task IDs to remove

      if (!userId || !Array.isArray(taskIds)) {
        return setJson(res, 400, { error: 'userId and taskIds array are required' });
      }

      const users = await getUsers();
      const idx = users.findIndex(u => u.id === userId);
      if (idx < 0) return setJson(res, 404, { error: 'User not found' });

      const removeSet = new Set(taskIds);
      users[idx].assignedTasks = (users[idx].assignedTasks || []).filter(t => !removeSet.has(t));
      users[idx].updatedAt = new Date().toISOString();
      await saveUsers(users);

      return setJson(res, 200, { ok: true, assignedTasks: users[idx].assignedTasks });
    }

    /* ── Method not allowed ────────────────────────────────────────────── */
    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return setJson(res, 405, { error: 'Method not allowed' });

  } catch (error) {
    console.error('Users API error:', error);
    return setJson(res, 500, { error: 'Users operation failed', message: error.message });
  }
}
