// Verify the shared blueprint gate password (same env as middleware.js: BLUEPRINT_PASSWORD)
// and authorize setting an in-browser role (admin / webdev / client_admin / client).
// The password is never embedded in static HTML; it must match Vercel's BLUEPRINT_PASSWORD.

function timingSafeEq(submitted, expected) {
  if (typeof submitted !== 'string' || typeof expected !== 'string') return false;
  if (submitted.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < submitted.length; i++) {
    mismatch |= submitted.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const expected = process.env.BLUEPRINT_PASSWORD;
  if (!expected) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const password = String(body.password ?? '');
  const role = String(body.role ?? '').toLowerCase();

  if (!['admin', 'webdev', 'client_admin', 'client'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  if (!timingSafeEq(password, expected)) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  return res.status(200).json({ ok: true, role });
}
