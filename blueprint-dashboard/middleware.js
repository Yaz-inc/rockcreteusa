// Vercel Edge Middleware — Security headers only (auth gate removed).
//
// The old HTTP Basic Auth gate has been removed. Authentication is now
// handled entirely by the in-page user login system (V17_A):
//   - Individual user accounts with PBKDF2-hashed passwords
//   - HTTP-only signed session cookies (rockcrete_session)
//   - Role-based access control (super_admin > admin > pm > ... > client)
//   - API-level auth checks (requireAuth middleware in each API route)
//
// This middleware now only adds security headers. Security headers are also
// set in vercel.json, so this middleware can be empty — just pass through.

export const config = {
  // Run on all routes except robots.txt (so crawlers can read the Disallow rule)
  matcher: '/((?!robots\\.txt$).*)',
};

export default function middleware() {
  // Pass through — no auth gate.
  // Security headers are handled by vercel.json headers config.
  // API auth is handled by each API route's requireAuth checks.
  return;
}
