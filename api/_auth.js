import { createHmac, timingSafeEqual } from 'crypto';

// How long a session stays valid server-side. Must match the cookie Max-Age
// set in login.js so the server actually enforces expiry (the cookie's own
// Max-Age is a client-side hint only — a copied token would otherwise live forever).
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function parseCookies(req) {
  const list = {};
  const header = req.headers.cookie;
  if (!header) return list;
  header.split(';').forEach(part => {
    const [key, ...val] = part.split('=');
    list[key.trim()] = decodeURIComponent(val.join('=').trim());
  });
  return list;
}

export function isAuthenticated(req) {
  try {
    const cookies = parseCookies(req);
    const token = cookies.session;
    if (!token) return false;

    if (!process.env.SESSION_SECRET) return false;

    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const lastColon = decoded.lastIndexOf(':');
    if (lastColon < 0) return false;
    const payload = decoded.substring(0, lastColon);
    const sig = decoded.substring(lastColon + 1);

    const expectedSig = createHmac('sha256', process.env.SESSION_SECRET)
      .update(payload)
      .digest('hex');

    // Constant-time signature comparison (timingSafeEqual requires equal length).
    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expBuf.length) return false;
    if (!timingSafeEqual(sigBuf, expBuf)) return false;

    // Enforce expiry server-side. Payload looks like "authenticated:<issuedAtMs>".
    const issuedAt = parseInt(payload.split(':')[1], 10);
    if (!Number.isFinite(issuedAt)) return false;
    if (Date.now() - issuedAt > SESSION_TTL_MS) return false;

    return true;

  } catch {
    return false;
  }
}