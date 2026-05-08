import { serialize } from 'cookie';
import { createHmac } from 'crypto';

function generateToken(secret) {
  const payload = `authenticated:${Date.now()}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64');
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false });
  }

  const { password } = req.body;

  if (!process.env.APP_PASSWORD || !process.env.SESSION_SECRET) {
    return res.status(500).json({ success: false, error: 'Server misconfigured' });
  }

  if (password !== process.env.APP_PASSWORD) {
    return res.status(401).json({ success: false });
  }

  // ✅ Password correct — generate a signed token
  const token = generateToken(process.env.SESSION_SECRET);

  // ✅ Set it as an HTTP-only cookie (JavaScript cannot read or fake this)
  const cookie = serialize('session', token, {
    httpOnly: true,         // JS cannot access it
    secure: true,           // HTTPS only
    sameSite: 'strict',     // No cross-site requests
    maxAge: 60 * 60 * 24,  // 24 hours
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
  return res.status(200).json({ success: true });
}
