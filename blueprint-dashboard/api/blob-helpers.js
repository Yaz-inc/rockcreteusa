/**
 * Shared Blob Helpers — Resilient token resolution for Vercel Blob (Private Store)
 * ============================================================================
 * When you create a Blob Store in the Vercel Dashboard, the token may be
 * stored under different env var names depending on how the store was created:
 *   - BLOB_READ_WRITE_TOKEN  (standard, what @vercel/blob checks by default)
 *   - vercel_blob_rw_<storeSlug>_READ_WRITE_TOKEN  (project-connected store)
 *
 * This module scans all env vars for a Vercel Blob read-write token and
 * passes it explicitly to list() and put() calls, bypassing the SDK's
 * simple BLOB_READ_WRITE_TOKEN-only check.
 *
 * IMPORTANT: The blob store is PRIVATE, so:
 *   - put() uses access: 'private'
 *   - readBlob() uses the downloadUrl (signed URL) from the blob listing
 * ============================================================================
 */

import { list as _list, put as _put, head as _head } from '@vercel/blob';

/**
 * Find a Vercel Blob read-write token from environment variables.
 * Checks multiple naming conventions used by Vercel Dashboard.
 */
function getBlobToken() {
  // 1. Standard name
  if (process.env.BLOB_READ_WRITE_TOKEN) {
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
      return value;
    }
  }

  // No token found
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
 * Uses access: 'private' since our store is private.
 * Same API as @vercel/blob put(), but auto-resolves the token.
 */
export async function put(pathname, body, options = {}) {
  const token = getToken();
  const mergedOptions = { ...options };
  // Force private access since our store is private
  if (!mergedOptions.access) {
    mergedOptions.access = 'private';
  }
  if (token) {
    return _put(pathname, body, { ...mergedOptions, token });
  }
  return _put(pathname, body, mergedOptions);
}

/**
 * Read a JSON blob from private store by pathname.
 * Uses list() to find the blob, then fetches via its downloadUrl (signed URL).
 */
export async function readJsonBlob(path) {
  const result = await list({ prefix: path, limit: 10 });
  const blob = result.blobs.find(b => b.pathname === path);
  if (!blob) return null;

  // For private blobs, use downloadUrl which is a signed URL
  const url = blob.downloadUrl || blob.url;
  const resp = await fetch(url, { cache: 'no-store' });
  if (!resp.ok) return null;
  return resp.json();
}
