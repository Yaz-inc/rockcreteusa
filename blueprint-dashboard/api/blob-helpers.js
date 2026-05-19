/**
 * Shared Blob Helpers — Resilient token resolution for Vercel Blob
 * ============================================================================
 * Scans multiple env var names for the Vercel Blob read-write token
 * and passes it explicitly to list()/put() calls.
 * ============================================================================
 */

import { list as _list, put as _put } from '@vercel/blob';

function getBlobToken() {
  // 1. Standard name
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }
  // 2. Auto-generated name pattern (e.g. BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN)
  for (const [key, value] of Object.entries(process.env)) {
    if (value && typeof value === 'string' && value.startsWith('vercel_blob_rw_') && key.includes('BLOB')) {
      return value;
    }
  }
  // 3. Broadest scan
  for (const [key, value] of Object.entries(process.env)) {
    if (value && typeof value === 'string' && value.startsWith('vercel_blob_rw_')) {
      return value;
    }
  }
  return undefined;
}

let _cachedToken = null;
function getToken() {
  if (_cachedToken === null) _cachedToken = getBlobToken();
  return _cachedToken;
}

export async function list(options = {}) {
  const token = getToken();
  if (token) return _list({ ...options, token });
  return _list(options);
}

export async function put(pathname, body, options = {}) {
  const token = getToken();
  if (token) return _put(pathname, body, { ...options, token });
  return _put(pathname, body, options);
}

export async function readJsonBlob(path) {
  const result = await list({ prefix: path, limit: 10 });
  const blob = result.blobs.find(b => b.pathname === path);
  if (!blob) return null;
  const resp = await fetch(blob.url, { cache: 'no-store' });
  if (!resp.ok) return null;
  return resp.json();
}
