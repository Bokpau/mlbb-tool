// Server-side calls to the Render backend (mpl-ph-s17-backend). RENDER_URL and
// TOOL_TOKEN live in Vercel env only — the token never reaches the browser.
export async function renderGet(path) {
  const base = process.env.RENDER_URL;
  const token = process.env.TOOL_TOKEN;
  if (!base || !token) throw new Error('RENDER_URL / TOOL_TOKEN not set');

  const response = await fetch(`${base.replace(/\/+$/, '')}${path}`, {
    headers: { 'x-tool-token': token, 'Accept': 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Render answered ${response.status}`);
  return response.json();
}
