import { list, put, readJsonBlob } from './blob-helpers.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  
  const action = req.query.action || 'test';
  
  if (action === 'write') {
    try {
      const result = await put('rockcrete/test.json', JSON.stringify({ hello: 'world', ts: Date.now() }), {
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
        access: 'public'
      });
      return res.status(200).json({ ok: true, url: result.url, pathname: result.pathname });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message, stack: e.stack });
    }
  }
  
  if (action === 'read') {
    try {
      const data = await readJsonBlob('rockcrete/test.json');
      return res.status(200).json({ ok: true, data });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }
  
  if (action === 'list') {
    try {
      const result = await list({ prefix: 'rockcrete/', limit: 20 });
      return res.status(200).json({ ok: true, blobs: result.blobs.map(b => b.pathname) });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }
  
  if (action === 'env') {
    const keys = Object.keys(process.env).filter(k => 
      k.includes('BLOB') || k.includes('blob') || k.includes('SESSION') || k.includes('BLUEPRINT')
    );
    const vals = {};
    for (const k of keys) {
      const v = process.env[k] || '';
      vals[k] = v.length > 20 ? v.substring(0, 15) + '...' + v.substring(v.length - 6) : v;
    }
    return res.status(200).json({ envKeys: keys, envValues: vals });
  }
  
  return res.status(400).json({ error: 'Unknown action', validActions: ['write', 'read', 'list', 'env'] });
}
