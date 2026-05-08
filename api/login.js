import { createHmac } from 'crypto';

// In-memory rate limiter — tracks failed attempts per IP
// Resets naturally on Vercel cold starts, which is fine
const attempts = new Map();

const MAX_ATTEMPTS = 10;        // max tries
const WINDOW_MS = 15 * 60 * 1000; // 15 minute window

function isRateLimited(ip) {
  const now = Date.now();
  const record = attempts.get(ip) || { count: 0, first: now };

  // Reset the window if 15 minutes have passed
  if (now - record.first > WINDOW_MS) {
    record.count = 0;
    record.first = now;
  }

  record.count++;
  attempts.set(ip, record);

  return record.count > MAX_ATTEMPTS;
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false });
  }

  // Get the real IP (Vercel sits behind a proxy)
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || 'unknown';

  if (isRateLimited(ip)) {
    return res.status(429).json({ 
      success: false, 
      error: 'Too many attempts. Try again in 15 minutes.' 
    });
  }

  const { password } = req.body;

  if (!process.env.APP_PASSWORD || !process.env.SESSION_SECRET) {
    return res.status(500).json({ success: false, error: 'Server misconfigured' });
  }

  if (password !== process.env.APP_PASSWORD) {
    return res.status(401).json({ success: false });
  }

  // ✅ Password correct — clear their attempt record
  attempts.delete(ip);

  // Generate a signed token using only built-in Node.js crypto
  const payload = `authenticated:${Date.now()}`;
  const sig = createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('hex');
  const token = Buffer.from(`${payload}:${sig}`).toString('base64');

  // Set as HTTP-only cookie — no external package needed
  res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`);
  return res.status(200).json({ success: true });
}