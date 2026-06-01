import { isAuthenticated } from './_auth.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ authenticated: false });
  }
  if (isAuthenticated(req)) {
    return res.status(200).json({ authenticated: true });
  }
  return res.status(401).json({ authenticated: false });
}