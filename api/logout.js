export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false });
  }

  // Expire the session cookie immediately. Same attributes as login so the
  // browser reliably overwrites/clears it.
  res.setHeader(
    'Set-Cookie',
    'session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
  );
  return res.status(200).json({ success: true });
}
