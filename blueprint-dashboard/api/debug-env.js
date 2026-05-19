/**
 * Debug endpoint — Show blob-related environment variables
 * TEMPORARY: Remove after blob store connection is verified.
 */

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const envKeys = Object.keys(process.env).sort();
  const blobRelated = envKeys.filter(k =>
    k.toLowerCase().includes('blob') ||
    k.toLowerCase().includes('store') ||
    k.toLowerCase().includes('oidc') ||
    k.toLowerCase().includes('vercel')
  );

  // Show keys only (never expose values)
  const result = {
    totalEnvVars: envKeys.length,
    blobRelatedKeys: blobRelated,
    hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    hasStoreId: !!process.env.BLOB_STORE_ID,
    hasOidcToken: !!process.env.VERCEL_OIDC_TOKEN,
    // Check for any key ending with _READ_WRITE_TOKEN
    readWriteTokenKeys: envKeys.filter(k => k.endsWith('READ_WRITE_TOKEN')),
    // Check for any key containing 'blob' (case insensitive)
    blobKeys: envKeys.filter(k => k.toLowerCase().includes('blob')),
  };

  res.status(200).json(result);
}
