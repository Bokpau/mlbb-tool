export default async function handler(req, res) {
  try {
    const { battleId } = req.query;
    const AUTH = process.env.MLBB_AUTH;

    const url = `https://esportsdata-sg.mobilelegends.com/battledata?authkey=${AUTH}&battleid=${battleId}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://m.mobilelegends.com/",
        "Origin": "https://m.mobilelegends.com"
      }
    });

    const data = await response.json();

    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
}