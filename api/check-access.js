export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false });
    }

    try {
        const { password } = req.body;

        const entered = password?.trim();
        const appPassword = process.env.APP_PASSWORD?.trim();

        if (!entered) {
            return res.status(401).json({ success: false });
        }

        if (entered === appPassword) {
            return res.status(200).json({
                success: true
            });
        }

        return res.status(401).json({
            success: false
        });

    } catch (err) {
        console.error("Access check failed:", err);

        return res.status(500).json({
            success: false
        });
    }
}