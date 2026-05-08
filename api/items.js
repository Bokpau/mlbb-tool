import { isAuthenticated } from './_auth.js';

export default async function handler(req, res) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { players, prevItemsMap, currentTime } = req.body;

    const allItemEvents = {};

    players.forEach(player => {
      const roleid = player.roleid;
      const curr = player.equip_list || [];
      const prev = prevItemsMap[roleid] || [];

      const count = arr => {
        const map = {};
        arr.forEach(id => {
          const num = parseInt(id);
          if (num) map[num] = (map[num] || 0) + 1;
        });
        return map;
      };

      const prevCount = count(prev);
      const currCount = count(curr);
      const events = [];

      Object.keys(currCount).forEach(id => {
        const diff = currCount[id] - (prevCount[id] || 0);
        if (diff > 0) {
          for (let i = 0; i < diff; i++) {
            events.push({ time: currentTime, itemId: parseInt(id) });
          }
        }
      });

      allItemEvents[roleid] = { events, current: curr };
    });

    res.status(200).json(allItemEvents);

  } catch (err) {
    res.status(500).json({ error: 'Item processing failed' });
  }
}
