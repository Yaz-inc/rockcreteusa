/**
 * Settings API — System configuration management
 * ============================================================================
 * Super Admin only. Manages email configuration, system settings,
 * branding, test email, and data export/import.
 *
 * Database: Supabase (replaces Vercel Blob)
 * Auth: Requires super_admin session cookie
 * ============================================================================
 */

import {
  setJson, parseBody, stripSensitive, getSupabase,
  getSettings, saveSettings, DEFAULT_SETTINGS,
  getAllUsers, getAllMilestones, getProgressUpdates, getResetTokens,
  requireAuth, requireSuperAdmin,
} from './db.js';

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
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
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
    const { user: admin } = await requireAuth(req);
    if (!requireSuperAdmin(admin)) {
      return setJson(res, 403, { error: 'Super Admin access required' });
    }

    const action = req.query?.action || '';

    /* ── GET: Retrieve settings ────────────────────────────────────────── */
    if (req.method === 'GET' && !action) {
      const settings = await getSettings();

      // Mask API key
      const maskedSettings = JSON.parse(JSON.stringify(settings));
      if (maskedSettings.email.resendApiKey && maskedSettings.email.resendApiKey.length > 8) {
        const key = maskedSettings.email.resendApiKey;
        maskedSettings.email.resendApiKey = '--------' + key.slice(-4);
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
      const current = await getSettings();

      // Update email settings
      if (body.email) {
        if (body.email.fromName !== undefined) current.email.fromName = String(body.email.fromName).trim().slice(0, 200);
        if (body.email.fromEmail !== undefined) current.email.fromEmail = String(body.email.fromEmail).trim().slice(0, 200);
        if (body.email.replyTo !== undefined) current.email.replyTo = String(body.email.replyTo).trim().slice(0, 200);
        if (body.email.resendApiKey !== undefined) {
          const key = String(body.email.resendApiKey).trim();
          if (!key.startsWith('--') && key.length > 0) {
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

      await saveSettings(current);
      return setJson(res, 200, { ok: true, message: 'Settings saved successfully' });
    }

    /* ── POST: Test email ──────────────────────────────────────────────── */
    if (req.method === 'POST' && action === 'test-email') {
      const body = parseBody(req);
      const to = String(body.to || admin.email).trim();

      if (!to) {
        return setJson(res, 400, { error: 'Recipient email is required' });
      }

      const settings = await getSettings();
      const emailConfig = settings?.email || {};

      const result = await sendEmail({
        to,
        subject: 'Test Email — Rockcrete USA Blueprint Portal',
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

    /* ── GET: Resend API usage/quota ──────────────────────────────────────── */
    if (req.method === 'GET' && action === 'resend-usage') {
      const settings = await getSettings();
      const emailConfig = settings?.email || {};
      const apiKey = emailConfig.resendApiKey || process.env.RESEND_API_KEY || '';

      if (!apiKey) {
        return setJson(res, 200, { configured: false, reason: 'No Resend API key configured' });
      }

      try {
        // Fetch domains to verify API key works
        const domainsResp = await fetch('https://api.resend.com/domains', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });

        if (!domainsResp.ok) {
          return setJson(res, 200, { configured: false, reason: 'Invalid API key or API error' });
        }

        // Get API key info — Resend doesn't have a dedicated usage endpoint,
        // but we can infer from the API key prefix and recent emails
        // For now, return that the key is valid and configured
        // Resend's free tier: 100 emails/day, 3,000/month
        // We'll estimate usage by checking what we've stored

        const isProductionKey = apiKey.startsWith('re_') && !apiKey.startsWith('re_test_');
        const dailyLimit = isProductionKey ? 100 : 100;
        const monthlyLimit = isProductionKey ? 3000 : 100;

        return setJson(res, 200, {
          configured: true,
          keyValid: true,
          keyPrefix: apiKey.slice(0, 6) + '...' + apiKey.slice(-4),
          isProduction: isProductionKey,
          dailyLimit,
          monthlyLimit,
          // Resend doesn't expose a usage API, so we show limits only
          // Users can check their dashboard at resend.com/emails
          dashboardUrl: 'https://resend.com/emails',
        });
      } catch (err) {
        return setJson(res, 200, { configured: false, reason: err.message });
      }
    }

    /* ── GET: Verify email domain ──────────────────────────────────────── */
    if (req.method === 'GET' && action === 'verify-email') {
      const settings = await getSettings();
      const emailConfig = settings?.email || {};

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
      const supabase = getSupabase();
      const [users, milestones, progress, tokens] = await Promise.all([
        getAllUsers(),
        getAllMilestones(),
        getProgressUpdates(),
        getResetTokens(),
      ]);

      // Fetch additional tables
      let trackerState = [], teams = [], teamMembers = [], tasks = [];
      try { const { data } = await supabase.from('tracker_state').select('*'); trackerState = data || []; } catch {}
      try { const { data } = await supabase.from('teams').select('*'); teams = data || []; } catch {}
      try { const { data } = await supabase.from('team_members').select('*'); teamMembers = data || []; } catch {}
      try { const { data } = await supabase.from('tasks').select('*'); tasks = data || []; } catch {}

      const exportData = {
        _meta: {
          exportedAt: new Date().toISOString(),
          version: 'V20',
          source: 'Rockcrete USA Blueprint Portal',
          database: 'Supabase',
          improvement: '#20',
        },
        data: {
          'rockcrete/users.json': { users },
          'rockcrete/settings.json': await getSettings(),
          'rockcrete/milestones.json': milestones,
          'rockcrete/progress.json': { updates: progress },
          'rockcrete/reset-tokens.json': { tokens },
          'rockcrete/tracker-state.json': { entries: trackerState },
          'rockcrete/teams.json': { teams },
          'rockcrete/team-members.json': { members: teamMembers },
          'rockcrete/tasks.json': { tasks },
        },
      };

      res.setHeader('Content-Disposition', `attachment; filename="rockcrete-backup-${new Date().toISOString().split('T')[0]}.json"`);
      return setJson(res, 200, exportData);
    }

    /* ── POST: Import application data ────────────────────────────────── */
    if (req.method === 'POST' && action === 'import') {
      const body = parseBody(req);
      const importData = body.data;

      if (!importData || typeof importData !== 'object') {
        return setJson(res, 400, { error: 'Import data object is required in { data: { ... } } format' });
      }

      const results = {};
      let imported = 0;
      let skipped = 0;

      // Import users
      if (importData['rockcrete/users.json']?.users) {
        try {
          const { upsertUser } = await import('./db.js');
          for (const u of importData['rockcrete/users.json'].users) {
            await upsertUser(u);
          }
          results['users'] = { status: 'imported', count: importData['rockcrete/users.json'].users.length };
          imported++;
        } catch (e) {
          results['users'] = { status: 'error', reason: e.message };
          skipped++;
        }
      }

      // Import settings
      if (importData['rockcrete/settings.json']) {
        try {
          await saveSettings(importData['rockcrete/settings.json']);
          results['settings'] = { status: 'imported' };
          imported++;
        } catch (e) {
          results['settings'] = { status: 'error', reason: e.message };
          skipped++;
        }
      }

      // Import milestones
      if (importData['rockcrete/milestones.json']) {
        try {
          const { createMilestone } = await import('./db.js');
          const ms = importData['rockcrete/milestones.json'];
          for (const taskEntry of Object.values(ms)) {
            for (const milestone of (taskEntry.milestones || [])) {
              await createMilestone({ ...milestone, taskId: taskEntry.taskId });
            }
          }
          results['milestones'] = { status: 'imported' };
          imported++;
        } catch (e) {
          results['milestones'] = { status: 'error', reason: e.message };
          skipped++;
        }
      }

      // Import progress
      if (importData['rockcrete/progress.json']?.updates) {
        try {
          const { createProgressUpdate } = await import('./db.js');
          for (const update of importData['rockcrete/progress.json'].updates) {
            await createProgressUpdate(update);
          }
          results['progress'] = { status: 'imported' };
          imported++;
        } catch (e) {
          results['progress'] = { status: 'error', reason: e.message };
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

    /* ── GET: Get list of data stores ──────────────────────────────────── */
    if (req.method === 'GET' && action === 'stores') {
      const [users, milestones, progress, tokens] = await Promise.all([
        getAllUsers(),
        getAllMilestones(),
        getProgressUpdates(),
        getResetTokens(),
      ]);

      const stores = [
        { path: 'users', description: 'User accounts and permissions', required: true, hasData: users.length > 0, size: JSON.stringify(users).length },
        { path: 'settings', description: 'System settings and email config', required: true, hasData: true, size: 0 },
        { path: 'milestones', description: 'Task milestones', required: false, hasData: Object.keys(milestones).length > 0, size: JSON.stringify(milestones).length },
        { path: 'progress', description: 'Progress updates and activity', required: false, hasData: progress.length > 0, size: JSON.stringify(progress).length },
        { path: 'reset_tokens', description: 'Password reset tokens (temporary)', required: false, hasData: tokens.length > 0, size: JSON.stringify(tokens).length },
      ];

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
