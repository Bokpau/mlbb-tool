# CLAUDE.md — mlbb-tool (Shared Asset Repo + Tool App)

Two things live here:

1. **Asset library** — hero portraits, role/rune/skill icons, maps (`hero/`, `hero_portrait/`, `icons/`, `Role/`, `Rune/`, `SKILL/`, `Maps/`). These are served to every other project via jsDelivr CDN (`https://cdn.jsdelivr.net/gh/Bokpau/mlbb-tool@...`).
2. **A small tool app** deployed on Vercel (login-protected; see `.env.example`).

## Critical rules

- **Never rename, move, or delete an asset file without checking consumers.** Overlay and website code in `local_postgame`, `mpl-ph-s17`, and `mpl-intl` references these paths through the CDN — a rename breaks live broadcast graphics. Search the other projects for the filename first.
- jsDelivr caches by git tag/commit. After adding assets, they must be committed and pushed before other projects can use them; check how existing URLs pin versions before changing the scheme.
- Secrets (`APP_PASSWORD`, `SESSION_SECRET`, `MLBB_AUTH`) stay in `.env` / Vercel env settings — never committed. `.env.example` holds placeholders only.
- See `BUILD.md` for the build script (`build.js`) before touching the app part.
