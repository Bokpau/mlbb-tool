export default async function handler(req, res) {
    try {
      const AUTH = process.env.MLBB_AUTH;
  
      const battleId = req.query.battleId;
  
      if (!battleId) {
        return res.status(400).json({ error: "Missing battleId" });
      }
  
      const url = `https://esportsdata-sg.mobilelegends.com/battledata?authkey=${AUTH}&battleid=${battleId}`;
  
      const response = await fetch(url);
      const json = await response.json();
  
      res.status(200).json(json);
  
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }