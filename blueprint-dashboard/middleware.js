// Vercel Edge Middleware: HTTP Basic Auth gate for the entire URL.
// Framework-agnostic, no package.json needed. Runs on the Vercel Edge runtime.
//
// Layered access model (see blueprint-dashboard/docs/client-vs-internal.md):
//   1. URL-level (this middleware) - HTTP Basic Auth; password env BLUEPRINT_PASSWORD
//      (same value used server-side by POST /api/session for dashboard role Sign in).
//   2. Within-page (body.role-*) - cosmetic gating for admin vs staff vs client views.
//
// This middleware only handles layer 1. The static index.html still uses
// data-admin-only for the second layer.

const REALM = 'Rockcrete USA Blueprint';

export const config = {
  // Protect everything except robots.txt. Crawlers must be able to read it
  // unauthenticated so they honor the Disallow rule (we also send
  // X-Robots-Tag: noindex on every other response).
  matcher: '/((?!robots\\.txt$).*)',
};

export default function middleware(request) {
  const expected = process.env.BLUEPRINT_PASSWORD;
  if (!expected) {
    return new Response('Server misconfigured: BLUEPRINT_PASSWORD missing', {
      status: 500,
      headers: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' },
    });
  }

  const auth = request.headers.get('authorization') || '';
  if (auth.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6));
      const sep = decoded.indexOf(':');
      const submitted = sep === -1 ? '' : decoded.slice(sep + 1);
      if (submitted.length === expected.length) {
        let mismatch = 0;
        for (let i = 0; i < submitted.length; i++) {
          mismatch |= submitted.charCodeAt(i) ^ expected.charCodeAt(i);
        }
        if (mismatch === 0) {
          return;
        }
      }
    } catch (_) {
      // fall through to 401
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}"`,
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
