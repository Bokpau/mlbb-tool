# CLAUDE.md — mlbb-tool (Shared Asset Repo + Tool App)

Two things live here:

1. **Asset library — the single centralized image source for ALL projects.** Hero portraits, icons, runes, maps, team logos, player photos, casters, sponsors, broadcast art. Websites consume it via jsDelivr CDN (`https://cdn.jsdelivr.net/gh/Bokpau/mlbb-tool@...`); the live tracker consumes it locally via a symlink (`local_postgame/assets/img` → this folder). Add/edit/delete images HERE, never in per-project copies.
2. **A small tool app** deployed on Vercel (login-protected; see `.env.example`).

Folder conventions:
- `_raw/` = uncompressed masters and working files (gitignored, local-only — the backup-less folder, handle with care).
- `hero_transparent/` = broadcast cut-out portraits, gitignored by default (files up to 25MB; jsDelivr rejects >20MB).
- Everything else at root is committed and CDN-servable.

## Critical rules

- **Never rename, move, or delete an asset file without checking consumers.** Overlay and website code in `local_postgame`, `mpl-ph-s17`, and `mpl-intl` references these paths through the CDN — a rename breaks live broadcast graphics. Search the other projects for the filename first.
- jsDelivr caches by git tag/commit. After adding assets, they must be committed and pushed before other projects can use them; check how existing URLs pin versions before changing the scheme.
- Secrets (`APP_PASSWORD`, `SESSION_SECRET`, `MLBB_AUTH`) stay in `.env` / Vercel env settings — never committed. `.env.example` holds placeholders only.
- See `BUILD.md` for the build script (`build.js`) before touching the app part.
