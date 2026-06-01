// Vercel Edge Middleware — runs BEFORE static files are served.
//
// Purpose: stop anyone from downloading the app's source (index.html and
// main-config.js) without a valid session. Without this, the code is a public
// static file that anyone can fetch with `curl` even though the DATA APIs are
// auth-gated. This re-implements the same HMAC session check as api/_auth.js,
// but with Web Crypto because the Edge runtime has no Node `crypto` module.
//
// Anything NOT listed in `matcher` (images, fonts, /login.html, /api/*) is
// served normally and is unaffected.

export const config = {
  matcher: ['/', '/index.html', '/main-config.js'],
};

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // keep in sync with _auth.js

function readSessionCookie(request) {
  const header = request.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    if (part.slice(0, idx).trim() === 'session') {
      return part.slice(idx + 1).trim();
    }
  }
  return null;
}

async function isValidSession(token, secret) {
  try {
    if (!token || !secret) return false;

    const decoded = atob(token);
    const lastColon = decoded.lastIndexOf(':');
    if (lastColon < 0) return false;
    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const macBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const expected = [...new Uint8Array(macBuf)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time-ish comparison.
    if (sig.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) {
      diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    if (diff !== 0) return false;

    // Enforce expiry server-side.
    const issuedAt = parseInt(payload.split(':')[1], 10);
    if (!Number.isFinite(issuedAt)) return false;
    if (Date.now() - issuedAt > SESSION_TTL_MS) return false;

    return true;
  } catch {
    return false;
  }
}

export default async function middleware(request) {
  const token = readSessionCookie(request);
  const ok = await isValidSession(token, process.env.SESSION_SECRET);

  if (ok) {
    return; // authenticated — let the static file through
  }

  // Not authenticated — send them to the public login page instead of
  // serving any application code.
  const url = new URL(request.url);
  url.pathname = '/login.html';
  url.search = '';
  return Response.redirect(url, 302);
}
