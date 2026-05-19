/**
 * Auth API — User authentication, session management, password recovery
 * ============================================================================
 * Provides individual user login/logout, session cookies, forgot-password
 * flow with email verification codes, and user registration (super_admin only).
 *
 * Completely isolated from existing session.js (shared blueprint password).
 * The old session.js remains functional for backward compatibility.
 *
 * Blob keys:
 *   rockcrete/users.json        — User accounts (bcrypt hashed passwords)
 *   rockcrete/sessions.json     — Active sessions
 *   rockcrete/reset-tokens.json — Password reset verification codes
 *   rockcrete/settings.json     — System settings (email config, etc.)
 *
 * Session strategy: HTTP-only signed cookies containing {userId, role, expiresAt}
 * Cookie name: rockcrete_session
 * Signing: HMAC-SHA256 using SESSION_SECRET env var
 *
 * Roles: super_admin > admin > pm > webdev > team > client_admin > client
 * ============================================================================
 */

import { list, put } from '@vercel/blob';
import { createHash, createHmac, randomBytes } from 'crypto';

/* ── Constants ─────────────────────────────────────────────────────────── */

const USERS_PATH       = 'rockcrete/users.json';
const SESSIONS_PATH    = 'rockcrete/sessions.json';
const RESET_PATH       = 'rockcrete/reset-tokens.json';
const SETTINGS_PATH    = 'rockcrete/settings.json';

const SESSION_COOKIE   = 'rockcrete_session';
const SESSION_MAX_AGE  = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

const RESET_CODE_EXPIRY   = 15 * 60 * 1000;  // 15 minutes
const MAX_RESET_ATTEMPTS  = 5;
const MAX_LOGIN_ATTEMPTS  = 5;
const LOGIN_LOCKOUT_MINS  = 15;

const VALID_ROLES = ['super_admin', 'admin', 'pm', 'webdev', 'devops', 'seo', 'ui_ux', 'team', 'client_admin', 'client'];

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

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/* ── Blob helpers ───────────────────────────────────────────────────────── */

async function readBlob(path) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const result = await list({ prefix: path, limit: 10 });
  const blob = result.blobs.find(b => b.pathname === path);
  if (!blob) return null;
  const resp = await fetch(blob.url, { cache: 'no-store' });
  if (!resp.ok) return null;
  return resp.json();
}

async function writeBlob(path, data) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN not configured');
  }
  await put(path, JSON.stringify(data, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true
  });
}

/* ── Password hashing (Web Crypto API — no native deps needed) ─────────── */

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

async function verifyPassword(password, stored) {
  const parts = stored.split(':');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const [, , salt, expectedHash] = parts;
  const iterations = parseInt(parts[1], 10);
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const hash = Buffer.from(bits).toString('hex');
  // Timing-safe comparison
  if (hash.length !== expectedHash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < hash.length; i++) {
    mismatch |= hash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return mismatch === 0;
}

/* ── Session cookie management ─────────────────────────────────────────── */

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return 'rockcrete-default-secret-change-me-in-production';
  return secret;
}

function signSession(payload) {
  const secret = getSessionSecret();
  const data = JSON.stringify(payload);
  const sig = createHmac('sha256', secret).update(data).digest('hex');
  return Buffer.from(JSON.stringify({ ...payload, _sig: sig })).toString('base64url');
}

function verifySession(cookie) {
  try {
    const decoded = JSON.parse(Buffer.from(cookie, 'base64url').toString('utf8'));
    const { _sig, ...payload } = decoded;
    const secret = getSessionSecret();
    const expected = createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    // Timing-safe compare
    if (_sig.length !== expected.length) return null;
    let mismatch = 0;
    for (let i = 0; i < _sig.length; i++) {
      mismatch |= _sig.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    if (mismatch !== 0) return null;
    // Check expiry
    if (payload.expiresAt && Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

function setSessionCookie(res, userId, role) {
  const expiresAt = Date.now() + SESSION_MAX_AGE;
  const token = signSession({ userId, role, expiresAt });
  res.setHeader('Set-Cookie', [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=604800',
    process.env.VERCEL_URL ? 'Secure' : '',
  ].filter(Boolean).join('; '));
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=0',
  ].join('; '));
}

function getSessionFromRequest(req) {
  const cookieHeader = req.headers?.cookie || '';
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  return verifySession(match[1]);
}

/* ── Email sending (via Resend) ─────────────────────────────────────────── */

async function getEmailConfig() {
  const settings = await readBlob(SETTINGS_PATH);
  if (settings?.email?.resendApiKey) return settings.email;
  // Fallback to env vars
  return {
    resendApiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@newmindsgroup.com',
    fromName: process.env.RESEND_FROM_NAME || 'Rockcrete USA Blueprint',
    replyTo: process.env.RESEND_REPLY_TO || '',
  };
}

async function sendEmail({ to, subject, html, text }) {
  const config = await getEmailConfig();
  if (!config.resendApiKey) {
    console.warn('No Resend API key configured — email not sent');
    return { sent: false, reason: 'no_api_key' };
  }

  const payload = {
    from: config.fromName ? `${config.fromName} <${config.fromEmail}>` : config.fromEmail,
    to: [to],
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  };
  if (config.replyTo) payload.reply_to = config.replyTo;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error('Resend error:', err);
    return { sent: false, reason: err };
  }

  return { sent: true };
}

/* ── User helpers ───────────────────────────────────────────────────────── */

async function getUsers() {
  const data = await readBlob(USERS_PATH);
  return data?.users || [];
}

async function saveUsers(users) {
  await writeBlob(USERS_PATH, { users });
}

async function findUserByEmail(email) {
  const users = await getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

async function findUserById(id) {
  const users = await getUsers();
  return users.find(u => u.id === id) || null;
}

/* ── Module access defaults by role ─────────────────────────────────────── */

function getDefaultModuleAccess(role) {
  const allModules = [
    'home', 'schedule', 'tracker', 'progress', 'scope', 'risks',
    'phase-1', 'phase-2', 'phase-3', 'phase-4',
    'integrations', 'migration', 'performance', 'deliverables',
    'team', 'documents', 'panel', 'pricing', 'profile', 'users', 'settings'
  ];

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

/* ── Auth middleware: get current user from session ─────────────────────── */

async function requireAuth(req) {
  const session = getSessionFromRequest(req);
  if (!session) return { user: null, session: null };
  const user = await findUserById(session.userId);
  if (!user || user.status !== 'active') return { user: null, session: null };
  return { user, session };
}

function requireSuperAdmin(user) {
  return user && user.role === 'super_admin';
}

/* ── Rate limiting (simple in-memory, resets on cold start) ─────────────── */

const loginAttempts = new Map();

function checkLoginRateLimit(email) {
  const key = email.toLowerCase();
  const record = loginAttempts.get(key);
  if (!record) return true;
  if (record.lockedUntil && Date.now() < record.lockedUntil) return false;
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    loginAttempts.delete(key);
    return true;
  }
  return record.count < MAX_LOGIN_ATTEMPTS;
}

function recordLoginAttempt(email, success) {
  const key = email.toLowerCase();
  if (success) {
    loginAttempts.delete(key);
    return;
  }
  const record = loginAttempts.get(key) || { count: 0, lockedUntil: null };
  record.count += 1;
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOGIN_LOCKOUT_MINS * 60 * 1000;
  }
  loginAttempts.set(key, record);
}

/* ══════════════════════════════════════════════════════════════════════════
   HANDLER
   ══════════════════════════════════════════════════════════════════════════ */

export default async function handler(req, res) {
  try {
    const action = req.query?.action || '';

    /* ── POST /api/auth?action=login ──────────────────────────────────── */
    if (req.method === 'POST' && action === 'login') {
      const body = parseBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      if (!email || !password) {
        return setJson(res, 400, { error: 'Email and password are required' });
      }

      if (!checkLoginRateLimit(email)) {
        return setJson(res, 429, { error: 'Too many login attempts. Try again later.' });
      }

      const user = await findUserByEmail(email);
      if (!user || user.status !== 'active') {
        recordLoginAttempt(email, false);
        return setJson(res, 401, { error: 'Invalid email or password' });
      }

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        recordLoginAttempt(email, false);
        return setJson(res, 401, { error: 'Invalid email or password' });
      }

      recordLoginAttempt(email, true);

      // Update last login
      user.lastLoginAt = new Date().toISOString();
      const users = await getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx >= 0) {
        users[idx] = user;
        await saveUsers(users);
      }

      setSessionCookie(res, user.id, user.role);

      const { passwordHash, ...safeUser } = user;
      return setJson(res, 200, { ok: true, user: safeUser });
    }

    /* ── POST /api/auth?action=logout ─────────────────────────────────── */
    if (req.method === 'POST' && action === 'logout') {
      clearSessionCookie(res);
      return setJson(res, 200, { ok: true });
    }

    /* ── GET /api/auth?action=me ──────────────────────────────────────── */
    if (req.method === 'GET' && action === 'me') {
      const { user } = await requireAuth(req);
      if (!user) {
        return setJson(res, 401, { error: 'Not authenticated' });
      }
      const { passwordHash, ...safeUser } = user;
      return setJson(res, 200, { user: safeUser });
    }

    /* ── POST /api/auth?action=register ───────────────────────────────── */
    if (req.method === 'POST' && action === 'register') {
      // Only super_admin can register new users
      const { user: currentUser } = await requireAuth(req);
      if (!requireSuperAdmin(currentUser)) {
        return setJson(res, 403, { error: 'Only Super Admin can create user accounts' });
      }

      const body = parseBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const name = String(body.name || '').trim();
      const displayName = String(body.displayName || name || '').trim();
      const role = String(body.role || 'client').toLowerCase();
      const phone = String(body.phone || '').trim();
      const title = String(body.title || '').trim();
      const organization = String(body.organization || '').trim();

      if (!email || !password || !name) {
        return setJson(res, 400, { error: 'Email, password, and name are required' });
      }

      if (password.length < 8) {
        return setJson(res, 400, { error: 'Password must be at least 8 characters' });
      }

      if (!VALID_ROLES.includes(role)) {
        return setJson(res, 400, { error: `Invalid role. Valid: ${VALID_ROLES.join(', ')}` });
      }

      // Cannot create another super_admin via registration (only seed)
      if (role === 'super_admin') {
        return setJson(res, 400, { error: 'Cannot create Super Admin accounts via registration' });
      }

      // Check duplicate email
      const existing = await findUserByEmail(email);
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
        assignedTasks: [],
        moduleAccess: getDefaultModuleAccess(role),
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.id,
        status: 'active',
      };

      const users = await getUsers();
      users.push(newUser);
      await saveUsers(users);

      const { passwordHash: _, ...safeUser } = newUser;
      return setJson(res, 201, { ok: true, user: safeUser });
    }

    /* ── POST /api/auth?action=change-password ────────────────────────── */
    if (req.method === 'POST' && action === 'change-password') {
      const { user } = await requireAuth(req);
      if (!user) {
        return setJson(res, 401, { error: 'Not authenticated' });
      }

      const body = parseBody(req);
      const currentPassword = String(body.currentPassword || '');
      const newPassword = String(body.newPassword || '');

      if (!currentPassword || !newPassword) {
        return setJson(res, 400, { error: 'Current and new password are required' });
      }

      if (newPassword.length < 8) {
        return setJson(res, 400, { error: 'New password must be at least 8 characters' });
      }

      const valid = await verifyPassword(currentPassword, user.passwordHash);
      if (!valid) {
        return setJson(res, 401, { error: 'Current password is incorrect' });
      }

      const passwordHash = await hashPassword(newPassword);
      const users = await getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx >= 0) {
        users[idx].passwordHash = passwordHash;
        users[idx].updatedAt = new Date().toISOString();
        await saveUsers(users);
      }

      return setJson(res, 200, { ok: true });
    }

    /* ── POST /api/auth?action=forgot-password ────────────────────────── */
    if (req.method === 'POST' && action === 'forgot-password') {
      const body = parseBody(req);
      const email = String(body.email || '').trim().toLowerCase();

      if (!email) {
        return setJson(res, 400, { error: 'Email is required' });
      }

      const user = await findUserByEmail(email);

      // Always return success to prevent email enumeration
      if (!user || user.status !== 'active') {
        return setJson(res, 200, { ok: true, message: 'If an account exists with this email, a verification code has been sent.' });
      }

      // Rate limit: check if there's a recent reset token for this email
      const resetData = (await readBlob(RESET_PATH)) || { tokens: [] };
      const recent = resetData.tokens.find(t =>
        t.email.toLowerCase() === email &&
        !t.used &&
        Date.now() - new Date(t.createdAt).getTime() < 60000 // 1 minute cooldown
      );
      if (recent) {
        return setJson(res, 429, { error: 'Please wait before requesting another code.' });
      }

      // Generate code
      const code = generateCode();
      const token = {
        id: generateId('rst'),
        userId: user.id,
        email: user.email,
        code,
        expiresAt: new Date(Date.now() + RESET_CODE_EXPIRY).toISOString(),
        attempts: 0,
        maxAttempts: MAX_RESET_ATTEMPTS,
        used: false,
        createdAt: new Date().toISOString(),
      };

      // Invalidate any existing tokens for this email
      resetData.tokens = resetData.tokens.filter(t =>
        t.email.toLowerCase() !== email || t.used
      );
      resetData.tokens.push(token);

      // Keep only last 100 tokens
      if (resetData.tokens.length > 100) {
        resetData.tokens = resetData.tokens
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 100);
      }

      await writeBlob(RESET_PATH, resetData);

      // Send email
      const emailResult = await sendEmail({
        to: user.email,
        subject: 'Your Password Reset Code — Rockcrete USA Blueprint',
        html: `
          <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background: #fafaf7; border-radius: 12px;">
            <h2 style="color: #1e3a5f; margin: 0 0 1rem;">Password Reset Request</h2>
            <p style="color: #3a3f44; font-size: 0.95rem;">Hello ${user.displayName || user.name},</p>
            <p style="color: #3a3f44; font-size: 0.95rem;">A password reset was requested for your Rockcrete USA Blueprint account. Use the verification code below to reset your password:</p>
            <div style="background: #1e3a5f; color: #fff; font-size: 2rem; font-weight: 700; text-align: center; padding: 1rem; border-radius: 8px; letter-spacing: 0.3em; margin: 1.5rem 0;">${code}</div>
            <p style="color: #6b7177; font-size: 0.85rem;">This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e7e4dc; margin: 1.5rem 0;">
            <p style="color: #6b7177; font-size: 0.75rem;">Rockcrete USA Blueprint Portal</p>
          </div>
        `,
        text: `Hello ${user.displayName || user.name},\n\nYour password reset verification code is: ${code}\n\nThis code expires in 15 minutes. If you didn't request this, you can safely ignore this email.\n\nRockcrete USA Blueprint Portal`,
      });

      return setJson(res, 200, {
        ok: true,
        message: 'If an account exists with this email, a verification code has been sent.',
        emailSent: emailResult.sent,
      });
    }

    /* ── POST /api/auth?action=verify-reset ───────────────────────────── */
    if (req.method === 'POST' && action === 'verify-reset') {
      const body = parseBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const code = String(body.code || '').trim();
      const newPassword = String(body.newPassword || '');

      if (!email || !code || !newPassword) {
        return setJson(res, 400, { error: 'Email, verification code, and new password are required' });
      }

      if (newPassword.length < 8) {
        return setJson(res, 400, { error: 'New password must be at least 8 characters' });
      }

      const resetData = (await readBlob(RESET_PATH)) || { tokens: [] };
      const token = resetData.tokens.find(t =>
        t.email.toLowerCase() === email &&
        !t.used &&
        !t.expiresAt || new Date(t.expiresAt) > new Date()
      );

      if (!token) {
        return setJson(res, 400, { error: 'Invalid or expired verification code. Please request a new one.' });
      }

      // Check expiry
      if (new Date(token.expiresAt) <= new Date()) {
        return setJson(res, 400, { error: 'Verification code has expired. Please request a new one.' });
      }

      // Check attempts
      token.attempts = (token.attempts || 0) + 1;
      if (token.attempts > token.maxAttempts) {
        token.used = true;
        await writeBlob(RESET_PATH, resetData);
        return setJson(res, 400, { error: 'Too many incorrect attempts. Please request a new code.' });
      }

      // Verify code
      if (token.code !== code) {
        await writeBlob(RESET_PATH, resetData);
        return setJson(res, 400, {
          error: `Incorrect code. ${token.maxAttempts - token.attempts} attempts remaining.`,
          attemptsRemaining: token.maxAttempts - token.attempts,
        });
      }

      // Code is valid — reset password
      const user = await findUserById(token.userId);
      if (!user) {
        return setJson(res, 400, { error: 'User not found' });
      }

      const passwordHash = await hashPassword(newPassword);
      const users = await getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx >= 0) {
        users[idx].passwordHash = passwordHash;
        users[idx].updatedAt = new Date().toISOString();
        await saveUsers(users);
      }

      // Mark token as used
      token.used = true;
      await writeBlob(RESET_PATH, resetData);

      return setJson(res, 200, { ok: true, message: 'Password has been reset successfully.' });
    }

    /* ── GET /api/auth?action=check-seed ──────────────────────────────── */
    if (req.method === 'GET' && action === 'check-seed') {
      // Public endpoint: check if Super Admin seeding is available
      const existingUsers = await getUsers();
      return setJson(res, 200, { canSeed: existingUsers.length === 0, userCount: existingUsers.length });
    }

    /* ── POST /api/auth?action=seed ───────────────────────────────────── */
    if (req.method === 'POST' && action === 'seed') {
      // Seed the initial Super Admin account. Only works if no users exist yet.
      const existingUsers = await getUsers();
      if (existingUsers.length > 0) {
        return setJson(res, 403, { error: 'Users already exist. Cannot seed.' });
      }

      const body = parseBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const name = String(body.name || '').trim();

      if (!email || !password || !name) {
        return setJson(res, 400, { error: 'Email, password, and name are required for seeding' });
      }

      if (password.length < 8) {
        return setJson(res, 400, { error: 'Password must be at least 8 characters' });
      }

      const passwordHash = await hashPassword(password);
      const superAdmin = {
        id: generateId('usr'),
        email,
        passwordHash,
        name,
        displayName: name.split(' ')[0],
        role: 'super_admin',
        avatar: null,
        phone: '',
        title: 'Super Admin',
        organization: '',
        preferences: { language: 'en', theme: 'auto' },
        assignedTasks: [],
        moduleAccess: getDefaultModuleAccess('super_admin'),
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'usr_system',
        status: 'active',
      };

      await saveUsers([superAdmin]);

      const { passwordHash: _, ...safeUser } = superAdmin;
      return setJson(res, 201, { ok: true, user: safeUser, message: 'Super Admin account created. You can now log in.' });
    }

    /* ── Method / action not found ────────────────────────────────────── */
    res.setHeader('Allow', 'GET, POST');
    return setJson(res, 400, {
      error: 'Invalid or missing action parameter',
      validActions: ['login', 'logout', 'me', 'register', 'change-password', 'forgot-password', 'verify-reset', 'seed', 'check-seed'],
    });

  } catch (error) {
    console.error('Auth API error:', error);
    return setJson(res, 500, {
      error: 'Auth operation failed',
      message: error.message,
    });
  }
}
