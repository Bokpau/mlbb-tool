import { isAuthenticated } from './_auth.js';
import { renderGet } from './_render.js';

// The game so far (per-second gold + positions, item buy times) from the Render
// backend, so the tracker opened mid-game still draws from 00:00.
// See GET /admin/tool/history.
export default async function handler(req, res) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { battleId } = req.query;
  if (!battleId || !/^\d+$/.test(battleId)) {
    return res.status(400).json({ error: 'Invalid battle ID' });
  }
  res.setHeader('Cache-Control', 'no-store');
  try {
    res.status(200).json(await renderGet(`/admin/tool/history?battleId=${battleId}`));
  } catch (err) {
    console.error('[history] Render lookup failed:', err.message);
    res.status(502).json({ error: 'Render unavailable' });
  }
}
