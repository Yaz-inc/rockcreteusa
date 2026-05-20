/**
 * Auth API — User authentication, session management, password recovery
 * ============================================================================
 * Provides individual user login/logout, session cookies, forgot-password
 * flow with email verification codes, and user registration (super_admin only).
 *
 * Database: Supabase (replaces Vercel Blob)
 * Session: HTTP-only signed cookies containing {userId, role, expiresAt}
 * Cookie name: rockcrete_session
 * Signing: HMAC-SHA256 using SESSION_SECRET env var
 *
 * Roles: super_admin > admin > pm > webdev > team > client_admin > client
 * ============================================================================
 */

import {
  setJson, parseBody, generateId,
  setSessionCookie, clearSessionCookie,
  getAllUsers, getUserByEmail, getUserById, getUserCount, upsertUser, updateUser,
  getResetTokens, createResetToken, invalidateResetTokens, updateResetToken, cleanupOldResetTokens,
  getSettings, getDefaultModuleAccess, requireAuth, requireSuperAdmin,
  getAllTasks, getAllTeams,
  VALID_ROLES,
} from './db.js';

import { randomBytes } from 'crypto';

/* ── Constants ─────────────────────────────────────────────────────────── */

const SESSION_MAX_AGE  = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const RESET_CODE_EXPIRY   = 15 * 60 * 1000;  // 15 minutes
const MAX_RESET_ATTEMPTS  = 5;
const MAX_LOGIN_ATTEMPTS  = 5;
const LOGIN_LOCKOUT_MINS  = 15;

/* ── Password hashing (PBKDF2 via Web Crypto API) ──────────────────────── */

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
  if (hash.length !== expectedHash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < hash.length; i++) {
    mismatch |= hash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return mismatch === 0;
}

/* ── Email sending (via Resend) ─────────────────────────────────────────── */

async function sendEmail({ to, subject, html, text }) {
  const settings = await getSettings();
  const config = settings?.email || {};
  const apiKey = config.resendApiKey || process.env.RESEND_API_KEY || '';
  const fromEmail = config.fromEmail || process.env.RESEND_FROM_EMAIL || 'noreply@newmindsgroup.com';
  const fromName = config.fromName || process.env.RESEND_FROM_NAME || 'Rockcrete USA Blueprint';
  const replyTo = config.replyTo || process.env.RESEND_REPLY_TO || '';

  if (!apiKey) {
    console.warn('No Resend API key configured — email not sent');
    return { sent: false, reason: 'no_api_key' };
  }

  const payload = {
    from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
    to: [to],
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  };
  if (replyTo) payload.reply_to = replyTo;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error('Resend error:', err);
    return { sent: false, reason: err };
  }
  return { sent: true };
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
  if (success) { loginAttempts.delete(key); return; }
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

      const user = await getUserByEmail(email);
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
      await updateUser(user.id, { lastLoginAt: new Date().toISOString() });

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
      if (role === 'super_admin') {
        return setJson(res, 400, { error: 'Cannot create Super Admin accounts via registration' });
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
        moduleAccess: getDefaultModuleAccess(role),
        lastLoginAt: null,
        createdBy: currentUser.id,
        status: 'active',
      });

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
      await updateUser(user.id, { passwordHash, tempPassword: false });

      return setJson(res, 200, { ok: true });
    }

    /* ── POST /api/auth?action=forgot-password ────────────────────────── */
    if (req.method === 'POST' && action === 'forgot-password') {
      const body = parseBody(req);
      const email = String(body.email || '').trim().toLowerCase();

      if (!email) {
        return setJson(res, 400, { error: 'Email is required' });
      }

      const user = await getUserByEmail(email);

      // Always return success to prevent email enumeration
      if (!user || user.status !== 'active') {
        return setJson(res, 200, { ok: true, message: 'If an account exists with this email, a verification code has been sent.' });
      }

      // Rate limit: check if there's a recent reset token for this email
      const existingTokens = await getResetTokens(email);
      const recent = existingTokens.find(t =>
        !t.used && Date.now() - new Date(t.createdAt).getTime() < 60000
      );
      if (recent) {
        return setJson(res, 429, { error: 'Please wait before requesting another code.' });
      }

      // Generate code
      const code = String(Math.floor(100000 + Math.random() * 900000));
      await invalidateResetTokens(email);
      await createResetToken({
        userId: user.id,
        email: user.email,
        code,
        expiresAt: new Date(Date.now() + RESET_CODE_EXPIRY).toISOString(),
        maxAttempts: MAX_RESET_ATTEMPTS,
      });

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

      const tokens = await getResetTokens(email);
      const token = tokens.find(t => !t.used && new Date(t.expiresAt) > new Date());

      if (!token) {
        return setJson(res, 400, { error: 'Invalid or expired verification code. Please request a new one.' });
      }

      // Check expiry
      if (new Date(token.expiresAt) <= new Date()) {
        return setJson(res, 400, { error: 'Verification code has expired. Please request a new one.' });
      }

      // Check attempts
      const newAttempts = (token.attempts || 0) + 1;
      if (newAttempts > token.maxAttempts) {
        await updateResetToken(token.id, { used: true });
        return setJson(res, 400, { error: 'Too many incorrect attempts. Please request a new code.' });
      }

      // Verify code
      if (token.code !== code) {
        await updateResetToken(token.id, { attempts: newAttempts });
        return setJson(res, 400, {
          error: `Incorrect code. ${token.maxAttempts - newAttempts} attempts remaining.`,
          attemptsRemaining: token.maxAttempts - newAttempts,
        });
      }

      // Code is valid — reset password
      const user = await getUserById(token.userId);
      if (!user) {
        return setJson(res, 400, { error: 'User not found' });
      }

      const passwordHash = await hashPassword(newPassword);
      await updateUser(user.id, { passwordHash, tempPassword: false });

      // Mark token as used
      await updateResetToken(token.id, { used: true });

      return setJson(res, 200, { ok: true, message: 'Password has been reset successfully.' });
    }

    /* ── GET /api/auth?action=check-seed ──────────────────────────────── */
    if (req.method === 'GET' && action === 'check-seed') {
      const count = await getUserCount();
      return setJson(res, 200, { canSeed: count === 0, userCount: count });
    }

    /* ── POST /api/auth?action=seed ───────────────────────────────────── */
    if (req.method === 'POST' && action === 'seed') {
      const count = await getUserCount();
      if (count > 0) {
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
      const superAdmin = await upsertUser({
        id: generateId('usr'),
        email,
        passwordHash,
        name,
        displayName: name.split(' ')[0],
        role: 'super_admin',
        phone: '',
        title: 'Super Admin',
        organization: '',
        preferences: { language: 'en', theme: 'auto' },
        moduleAccess: getDefaultModuleAccess('super_admin'),
        lastLoginAt: null,
        createdBy: 'system',
        status: 'active',
      });

      const { passwordHash: _, ...safeUser } = superAdmin;
      return setJson(res, 201, { ok: true, user: safeUser, message: 'Super Admin account created. You can now log in.' });
    }

    /* ── GET /api/auth?action=public-stats ─────────────────────────────── */
    if (req.method === 'GET' && action === 'public-stats') {
      try {
        const [
          users, tasks, teams, settings
        ] = await Promise.all([
          getAllUsers(),
          getAllTasks(),
          getAllTeams(),
          getSettings(),
        ]);

        const activeUsers = users.filter(u => u.status === 'active').length;
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'done').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'in-progress').length;
        const totalTeams = teams.length;
        const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const portalName = settings?.branding?.portalName || 'Rockcrete USA Blueprint';
        const companyName = settings?.branding?.companyName || 'Rockcrete USA';

        return setJson(res, 200, {
          activeUsers,
          totalTasks,
          completedTasks,
          inProgressTasks,
          totalTeams,
          overallProgress,
          portalName,
          companyName,
        });
      } catch (e) {
        return setJson(res, 200, {
          activeUsers: 0, totalTasks: 0, completedTasks: 0,
          inProgressTasks: 0, totalTeams: 0, overallProgress: 0,
          portalName: 'Rockcrete USA Blueprint', companyName: 'Rockcrete USA',
        });
      }
    }

    /* ── Method / action not found ────────────────────────────────────── */
    res.setHeader('Allow', 'GET, POST');
    return setJson(res, 400, {
      error: 'Invalid or missing action parameter',
      validActions: ['login', 'logout', 'me', 'register', 'change-password', 'forgot-password', 'verify-reset', 'seed', 'check-seed', 'public-stats'],
    });

  } catch (error) {
    console.error('Auth API error:', error);
    return setJson(res, 500, { error: 'Auth operation failed', message: error.message });
  }
}
