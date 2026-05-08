import { createHmac } from 'crypto';

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

  // Generate a signed token using only built-in Node.js crypto
  const payload = `authenticated:${Date.now()}`;
  const sig = createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('hex');
  const token = Buffer.from(`${payload}:${sig}`).toString('base64');

  // Set as HTTP-only cookie — no external package needed
  res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`);
  return res.status(200).json({ success: true });
}