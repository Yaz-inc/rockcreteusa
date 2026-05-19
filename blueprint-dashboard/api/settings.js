/**
 * Settings API — System configuration management
 * ============================================================================
 * Super Admin only. Manages email configuration, system settings,
 * and provides a test email endpoint.
 *
 * Blob key: rockcrete/settings.json
 * Auth: Requires super_admin session cookie
 * ============================================================================
 */

import { list, put, readJsonBlob } from './blob-helpers.js';

const SETTINGS_PATH = 'rockcrete/settings.json';

/* ── Default settings ─────────────────────────────────────────────────── */

const DEFAULT_SETTINGS = {
  email: {
    fromName: 'Rockcrete USA Blueprint',
    fromEmail: 'noreply@newmindsgroup.com',
    replyTo: 'app@newmindsgroup.com',
    resendApiKey: '',
  },
  system: {
    sessionDurationDays: 7,
    resetCodeExpiryMinutes: 15,
    maxLoginAttempts: 5,
    maxResetAttempts: 5,
    loginLockoutMinutes: 15,
  },
  branding: {
    portalName: 'Rockcrete USA Blueprint',
    companyName: 'Rockcrete USA',
    managementCompany: 'New Minds Group',
  }
};

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
    access: 'public'
  });
}

/* ── Session verification ───────────────────────────────────────────────── */

function getSessionSecret() {
  return process.env.SESSION_SECRET || 'rockcrete-default-secret-change-me-in-production';
}

async function requireSuperAdmin(req) {
  const cookieHeader = req.headers?.cookie || '';
  const match = cookieHeader.match(/rockcrete_session=([^;]+)/);
  if (!match) return null;
  try {
    const crypto = require('crypto');
    const decoded = JSON.parse(Buffer.from(match[1], 'base64url').toString('utf8'));
    const { _sig, ...payload } = decoded;
    const expected = crypto.createHmac('sha256', getSessionSecret()).update(JSON.stringify(payload)).digest('hex');
    if (_sig.length !== expected.length) return null;
    let mismatch = 0;
    for (let i = 0; i < _sig.length; i++) {
      mismatch |= _sig.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    if (mismatch !== 0) return null;
    if (payload.expiresAt && Date.now() > payload.expiresAt) return null;
    const USERS_PATH = 'rockcrete/users.json';
    const data = await readJsonBlob(USERS_PATH);
    const users = data?.users || [];
    const user = users.find(u => u.id === payload.userId);
    if (!user || user.role !== 'super_admin' || user.status !== 'active') return null;
    return user;
  } catch {
    return null;
  }
}

/* ── Email sending ──────────────────────────────────────────────────────── */

async function sendEmail({ to, subject, html, text, emailConfig }) {
  const config = emailConfig || {};
  const apiKey = config.resendApiKey || process.env.RESEND_API_KEY || '';
  const fromEmail = config.fromEmail || process.env.RESEND_FROM_EMAIL || 'noreply@newmindsgroup.com';
  const fromName = config.fromName || process.env.RESEND_FROM_NAME || 'Rockcrete USA Blueprint';
  const replyTo = config.replyTo || process.env.RESEND_REPLY_TO || '';

  if (!apiKey) {
    return { sent: false, reason: 'No Resend API key configured. Add it in Settings > Email Configuration.' };
  }

  const payload = {
    from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
    to: [to],
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  };
  if (replyTo) payload.reply_to = replyTo;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return { sent: false, reason: `Resend API error: ${err}` };
    }

    const result = await resp.json();
    return { sent: true, id: result.id };
  } catch (err) {
    return { sent: false, reason: err.message };
  }
}

/* ── Handler ────────────────────────────────────────────────────────────── */

export default async function handler(req, res) {
  try {
    const admin = await requireSuperAdmin(req);
    if (!admin) {
      return setJson(res, 403, { error: 'Super Admin access required' });
    }

    const action = req.query?.action || '';

    /* ── GET: Retrieve settings ────────────────────────────────────────── */
    if (req.method === 'GET') {
      const stored = await readJsonBlob(SETTINGS_PATH);
      // Merge with defaults so any new fields are populated
      const settings = {
        email: { ...DEFAULT_SETTINGS.email, ...(stored?.email || {}) },
        system: { ...DEFAULT_SETTINGS.system, ...(stored?.system || {}) },
        branding: { ...DEFAULT_SETTINGS.branding, ...(stored?.branding || {}) },
      };

      // Mask the API key for display (show only last 4 chars)
      const maskedSettings = JSON.parse(JSON.stringify(settings));
      if (maskedSettings.email.resendApiKey && maskedSettings.email.resendApiKey.length > 8) {
        const key = maskedSettings.email.resendApiKey;
        maskedSettings.email.resendApiKey = '••••••••' + key.slice(-4);
        maskedSettings.email._hasApiKey = true;
      } else if (maskedSettings.email.resendApiKey) {
        maskedSettings.email._hasApiKey = true;
      } else {
        maskedSettings.email._hasApiKey = false;
      }

      return setJson(res, 200, { settings: maskedSettings });
    }

    /* ── PUT: Update settings ──────────────────────────────────────────── */
    if (req.method === 'PUT') {
      const body = parseBody(req);

      const stored = await readJsonBlob(SETTINGS_PATH);
      const current = {
        email: { ...DEFAULT_SETTINGS.email, ...(stored?.email || {}) },
        system: { ...DEFAULT_SETTINGS.system, ...(stored?.system || {}) },
        branding: { ...DEFAULT_SETTINGS.branding, ...(stored?.branding || {}) },
      };

      // Update email settings
      if (body.email) {
        if (body.email.fromName !== undefined) current.email.fromName = String(body.email.fromName).trim().slice(0, 200);
        if (body.email.fromEmail !== undefined) current.email.fromEmail = String(body.email.fromEmail).trim().slice(0, 200);
        if (body.email.replyTo !== undefined) current.email.replyTo = String(body.email.replyTo).trim().slice(0, 200);
        // Only update API key if it's not masked (user actually entered a new one)
        if (body.email.resendApiKey !== undefined) {
          const key = String(body.email.resendApiKey).trim();
          if (!key.startsWith('••') && key.length > 0) {
            current.email.resendApiKey = key;
          }
        }
      }

      // Update system settings
      if (body.system) {
        if (body.system.sessionDurationDays !== undefined) {
          const val = parseInt(body.system.sessionDurationDays, 10);
          if (val >= 1 && val <= 30) current.system.sessionDurationDays = val;
        }
        if (body.system.resetCodeExpiryMinutes !== undefined) {
          const val = parseInt(body.system.resetCodeExpiryMinutes, 10);
          if (val >= 5 && val <= 60) current.system.resetCodeExpiryMinutes = val;
        }
        if (body.system.maxLoginAttempts !== undefined) {
          const val = parseInt(body.system.maxLoginAttempts, 10);
          if (val >= 3 && val <= 20) current.system.maxLoginAttempts = val;
        }
        if (body.system.maxResetAttempts !== undefined) {
          const val = parseInt(body.system.maxResetAttempts, 10);
          if (val >= 3 && val <= 10) current.system.maxResetAttempts = val;
        }
        if (body.system.loginLockoutMinutes !== undefined) {
          const val = parseInt(body.system.loginLockoutMinutes, 10);
          if (val >= 5 && val <= 60) current.system.loginLockoutMinutes = val;
        }
      }

      // Update branding settings
      if (body.branding) {
        if (body.branding.portalName !== undefined) current.branding.portalName = String(body.branding.portalName).trim().slice(0, 200);
        if (body.branding.companyName !== undefined) current.branding.companyName = String(body.branding.companyName).trim().slice(0, 200);
        if (body.branding.managementCompany !== undefined) current.branding.managementCompany = String(body.branding.managementCompany).trim().slice(0, 200);
      }

      await writeBlob(SETTINGS_PATH, current);

      return setJson(res, 200, { ok: true, message: 'Settings saved successfully' });
    }

    /* ── POST: Test email ──────────────────────────────────────────────── */
    if (req.method === 'POST' && action === 'test-email') {
      const body = parseBody(req);
      const to = String(body.to || admin.email).trim();

      if (!to) {
        return setJson(res, 400, { error: 'Recipient email is required' });
      }

      // Get current settings (with real API key, not masked)
      const stored = await readJsonBlob(SETTINGS_PATH);
      const emailConfig = {
        ...DEFAULT_SETTINGS.email,
        ...(stored?.email || {}),
      };

      const result = await sendEmail({
        to,
        subject: '✓ Test Email — Rockcrete USA Blueprint Portal',
        html: `
          <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background: #fafaf7; border-radius: 12px;">
            <div style="background: #1e3a5f; color: #fff; padding: 1rem 1.5rem; border-radius: 8px 8px 0 0; font-weight: 700; font-size: 1.1rem;">Test Email Successful</div>
            <div style="padding: 1.5rem; border: 1px solid #e7e4dc; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="color: #3a3f44; margin: 0 0 1rem;">Hello ${admin.displayName || admin.name},</p>
              <p style="color: #3a3f44; margin: 0 0 1rem;">This is a test email from the Rockcrete USA Blueprint Portal. If you received this, your email configuration is working correctly.</p>
              <table style="width: 100%; font-size: 0.85rem; color: #6b7177; margin-top: 1rem;">
                <tr><td style="padding: 0.25rem 0; font-weight: 600;">From:</td><td>${emailConfig.fromName} &lt;${emailConfig.fromEmail}&gt;</td></tr>
                <tr><td style="padding: 0.25rem 0; font-weight: 600;">To:</td><td>${to}</td></tr>
                <tr><td style="padding: 0.25rem 0; font-weight: 600;">Sent at:</td><td>${new Date().toISOString()}</td></tr>
              </table>
            </div>
            <p style="color: #6b7177; font-size: 0.75rem; margin-top: 1rem; text-align: center;">Rockcrete USA Blueprint Portal — System Test</p>
          </div>
        `,
        text: `Test Email Successful\n\nHello ${admin.displayName || admin.name},\n\nThis is a test email from the Rockcrete USA Blueprint Portal. If you received this, your email configuration is working correctly.\n\nSent at: ${new Date().toISOString()}\n\nRockcrete USA Blueprint Portal`,
        emailConfig,
      });

      if (result.sent) {
        return setJson(res, 200, { ok: true, message: `Test email sent to ${to}`, emailId: result.id });
      } else {
        return setJson(res, 400, { ok: false, error: 'Failed to send test email', reason: result.reason });
      }
    }

    /* ── GET: Verify Resend API key ────────────────────────────────────── */
    if (req.method === 'GET' && action === 'verify-email') {
      const stored = await readJsonBlob(SETTINGS_PATH);
      const emailConfig = { ...DEFAULT_SETTINGS.email, ...(stored?.email || {}) };

      if (!emailConfig.resendApiKey) {
        return setJson(res, 200, { configured: false, reason: 'No API key set' });
      }

      try {
        const resp = await fetch('https://api.resend.com/domains', {
          headers: { 'Authorization': `Bearer ${emailConfig.resendApiKey}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          return setJson(res, 200, {
            configured: true,
            domains: (data.data || []).map(d => ({ name: d.name, status: d.status })),
          });
        } else {
          return setJson(res, 200, { configured: false, reason: 'Invalid API key' });
        }
      } catch (err) {
        return setJson(res, 200, { configured: false, reason: err.message });
      }
    }

    /* ── GET: Export all application data ──────────────────────────────── */
    if (req.method === 'GET' && action === 'export') {
      const BLOB_PATHS = [
        'rockcrete/users.json',
        'rockcrete/settings.json',
        'rockcrete/milestones.json',
        'rockcrete/progress.json',
        'rockcrete/reset-tokens.json',
      ];

      const exportData = {
        _meta: {
          exportedAt: new Date().toISOString(),
          version: 'V17_A',
          source: 'Rockcrete USA Blueprint Portal',
        },
        data: {},
      };

      for (const path of BLOB_PATHS) {
        try {
          const data = await readJsonBlob(path);
          if (data) exportData.data[path] = data;
        } catch (e) {
          // Skip missing blobs silently
        }
      }

      // Also include the tracker data from the static file
      // (it's in data/project-tracker.json, not blob)
      // Users can export that separately if needed

      return setJson(res, 200, exportData);
    }

    /* ── POST: Import application data ────────────────────────────────── */
    if (req.method === 'POST' && action === 'import') {
      const body = parseBody(req);
      const importData = body.data;

      if (!importData || typeof importData !== 'object') {
        return setJson(res, 400, { error: 'Import data object is required in { data: { ... } } format' });
      }

      const allowedPaths = [
        'rockcrete/users.json',
        'rockcrete/settings.json',
        'rockcrete/milestones.json',
        'rockcrete/progress.json',
        'rockcrete/reset-tokens.json',
      ];

      const results = {};
      let imported = 0;
      let skipped = 0;

      for (const [path, data] of Object.entries(importData)) {
        if (!allowedPaths.includes(path)) {
          results[path] = { status: 'skipped', reason: 'Path not allowed' };
          skipped++;
          continue;
        }

        try {
          await writeBlob(path, data);
          results[path] = { status: 'imported' };
          imported++;
        } catch (e) {
          results[path] = { status: 'error', reason: e.message };
          skipped++;
        }
      }

      return setJson(res, 200, {
        ok: true,
        message: `Imported ${imported} data store(s), skipped ${skipped}`,
        imported,
        skipped,
        results,
      });
    }

    /* ── GET: Get list of all blob stores (for export overview) ────────── */
    if (req.method === 'GET' && action === 'stores') {
      const stores = [
        { path: 'rockcrete/users.json', description: 'User accounts and permissions', required: true },
        { path: 'rockcrete/settings.json', description: 'System settings and email config', required: true },
        { path: 'rockcrete/milestones.json', description: 'Task milestones', required: false },
        { path: 'rockcrete/progress.json', description: 'Progress updates and activity', required: false },
        { path: 'rockcrete/reset-tokens.json', description: 'Password reset tokens (temporary)', required: false },
      ];

      // Check which ones have data
      for (const store of stores) {
        const data = await readJsonBlob(store.path);
        store.hasData = data !== null;
        store.size = data ? JSON.stringify(data).length : 0;
      }

      return setJson(res, 200, { stores });
    }

    /* ── Method not allowed ────────────────────────────────────────────── */
    res.setHeader('Allow', 'GET, POST, PUT');
    return setJson(res, 405, { error: 'Method not allowed' });

  } catch (error) {
    console.error('Settings API error:', error);
    return setJson(res, 500, { error: 'Settings operation failed', message: error.message });
  }
}
