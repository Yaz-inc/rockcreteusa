/**
 * Shared Blob Helpers — Resilient token resolution for Vercel Blob
 * ============================================================================
 * When you create a Blob Store in the Vercel Dashboard, the token may be
 * stored under different env var names depending on how the store was created:
 *   - BLOB_READ_WRITE_TOKEN  (standard, what @vercel/blob checks by default)
 *   - vercel_blob_rw_<storeSlug>_READ_WRITE_TOKEN  (project-connected store)
 *
 * This module scans all env vars for a Vercel Blob read-write token and
 * passes it explicitly to list() and put() calls, bypassing the SDK's
 * simple BLOB_READ_WRITE_TOKEN-only check.
 * ============================================================================
 */

import { list as _list, put as _put } from '@vercel/blob';

/**
 * Find a Vercel Blob read-write token from environment variables.
 * Checks multiple naming conventions used by Vercel Dashboard.
 */
function getBlobToken() {
  // 1. Standard name
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    console.log('[blob-helpers] Found token via BLOB_READ_WRITE_TOKEN');
    return process.env.BLOB_READ_WRITE_TOKEN;
  }

  // 2. Scan ALL env vars — any key containing "BLOB" with a vercel_blob_rw_ value
  for (const [key, value] of Object.entries(process.env)) {
    if (
      value &&
      typeof value === 'string' &&
      value.startsWith('vercel_blob_rw_') &&
      key.toUpperCase().includes('BLOB')
    ) {
      console.log(`[blob-helpers] Found token via env var: ${key}`);
      return value;
    }
  }

  // 3. Broader scan — any env var whose VALUE starts with 'vercel_blob_rw_'
  for (const [key, value] of Object.entries(process.env)) {
    if (
      value &&
      typeof value === 'string' &&
      value.startsWith('vercel_blob_rw_')
    ) {
      console.log(`[blob-helpers] Found token via broad scan env var: ${key}`);
      return value;
    }
  }

  // Debug: log all env var keys that might be blob-related
  const blobKeys = Object.keys(process.env).filter(k =>
    k.toLowerCase().includes('blob') ||
    k.toLowerCase().includes('store') ||
    k.toLowerCase().includes('vercel')
  );
  console.log('[blob-helpers] No blob token found. Env keys with blob/store/vercel:', blobKeys);

  // No token found — return undefined (will cause SDK to throw its own error)
  return undefined;
}

/** Cache the token for the lifetime of the serverless function */
let _cachedToken = null;

function getToken() {
  if (_cachedToken === null) {
    _cachedToken = getBlobToken();
  }
  return _cachedToken;
}

/**
 * List blobs with explicit token resolution.
 * Same API as @vercel/blob list(), but auto-resolves the token.
 */
export async function list(options = {}) {
  const token = getToken();
  if (token) {
    return _list({ ...options, token });
  }
  return _list(options);
}

/**
 * Put blob with explicit token resolution.
 * Same API as @vercel/blob put(), but auto-resolves the token.
 */
export async function put(pathname, body, options = {}) {
  const token = getToken();
  if (token) {
    return _put(pathname, body, { ...options, token });
  }
  return _put(pathname, body, options);
}
