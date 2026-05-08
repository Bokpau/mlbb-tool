import { isAuthenticated } from './_auth.js';

export default async function handler(req, res) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { battleId } = req.query;

    // Validate battleId is a number only
    if (!battleId || !/^\d+$/.test(battleId)) {
      return res.status(400).json({ error: 'Invalid battle ID' });
    }

    const AUTH = process.env.MLBB_AUTH;

    const url = `https://esportsdata-sg.mobilelegends.com/battledata?authkey=${AUTH}&battleid=${battleId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Referer': 'https://m.mobilelegends.com/',
        'Origin': 'https://m.mobilelegends.com',
        'Accept': 'application/json, text/plain, */*',
        'Connection': 'keep-alive'
      }
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
