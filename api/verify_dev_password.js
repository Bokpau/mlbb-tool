export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false });
    }

    const { password } = req.body;

    if (password === process.env.DEV_MODE_PASSWORD) {
        return res.status(200).json({ success: true });
    }

    return res.status(401).json({ success: false });
}