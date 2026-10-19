import { isAuthenticated } from './_auth.js';
import { renderGet } from './_render.js';

// Everything the tracker looks up — roster (name, role, team, photo by roleid),
// teams (name, logo by team code + Moonton team_id), heroes, items, maps — for
// the league chosen in the Render admin panel. See GET /admin/tool/bundle.
export default async function handler(req, res) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.setHeader('Cache-Control', 'no-store');
  try {
    res.status(200).json(await renderGet('/admin/tool/bundle'));
  } catch (err) {
    console.error('[bundle] Render lookup failed:', err.message);
    res.status(502).json({ error: 'Render unavailable' });
  }
}
