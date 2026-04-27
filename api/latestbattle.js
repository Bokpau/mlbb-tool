export default async function handler(req, res) {
  try {
    const AUTH = process.env.MLBB_AUTH;
    const JUDGE_ID = "1370583970";

    const url = `https://esportsdata-sg.mobilelegends.com/battlelist/judge?authkey=${AUTH}&judgeid=${JUDGE_ID}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.result || data.result.length === 0) {
      return res.status(404).json({ error: "No battles found" });
    }

    // ✅ Get MOST RECENT (first item)
    const latestBattleId = data.result[0].battleid;

    res.status(200).json({ battleId: latestBattleId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch latest battle" });
  }
}