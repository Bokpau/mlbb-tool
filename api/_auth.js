import { createHmac } from 'crypto';

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

    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const lastColon = decoded.lastIndexOf(':');
    const payload = decoded.substring(0, lastColon);
    const sig = decoded.substring(lastColon + 1);

    const expectedSig = createHmac('sha256', process.env.SESSION_SECRET)
      .update(payload)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    if (sig.length !== expectedSig.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) {
      diff |= sig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
    }
    return diff === 0;

  } catch {
    return false;
  }
}