import { isAuthenticated } from './_auth.js';
import { renderGet } from './_render.js';

// Which battle should the tracker show? Asked of the Render backend first
// (GET /admin/live/current — the game watcher already knows the live game), so
// the tool is no longer a second poller on Moonton's shared auth key.
//
// ?manual=1 is the Fetch button. Only then, if Render is down or has nothing
// live, does it fall back to the old Moonton judge battlelist. The 10s
// auto-poll never does: that would hit Moonton from every open tab.

// Judge account for that fallback; set MLBB_JUDGE_ID in Vercel to change it.
const JUDGE_ID = process.env.MLBB_JUDGE_ID || "1866747937";

async function fromRender() {
  return renderGet('/admin/live/current');
}

async function fromJudge() {
  const AUTH = process.env.MLBB_AUTH;
  const url = `https://esportsdata-sg.mobilelegends.com/battlelist/judge?authkey=${AUTH}&judgeid=${JUDGE_ID}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data.result || data.result.length === 0) return null;
  return String(data.result[0].battleid);
}

export default async function handler(req, res) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.setHeader('Cache-Control', 'no-store');
  const manual = req.query.manual === '1';

  let renderError = null;
  try {
    const live = await fromRender();
    if (live.battleId || !manual) {
      return res.status(200).json({
        battleId: live.battleId ? String(live.battleId) : null,
        source: live.source ? `render:${live.source}` : 'render',
        state: live.state ?? null,
        seasonId: live.seasonId ?? null,
        league: live.league ?? null,
        matchCode: live.matchCode ?? null,
        gameNumber: live.gameNumber ?? null,
      });
    }
  } catch (err) {
    renderError = err.message;
    console.error('[latestbattle] Render lookup failed:', err.message);
    if (!manual) return res.status(502).json({ battleId: null, error: 'Render unavailable' });
  }

  // Manual Fetch only, and Render had nothing (or failed): old judge lookup.
  try {
    const battleId = await fromJudge();
    if (!battleId) return res.status(404).json({ error: 'No battles found' });
    res.status(200).json({ battleId, source: 'judge', renderError });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch latest battle' });
  }
}
