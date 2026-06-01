# Build & edit workflow

The deployed `index.html` at the repo root is **generated and obfuscated** — do
not edit it by hand. Edit the readable source in `src/` instead.

## Files

| Path | What it is | Deployed? |
|---|---|---|
| `src/index.html` | Readable app source — **edit this** | No |
| `src/main-config.js` | Readable config/helpers — **edit this** | No |
| `build.js` | Inlines main-config + obfuscates | No |
| `index.html` (root) | Generated, obfuscated output | **Yes** |
| `login.html` | Public login page | Yes |
| `middleware.js` | Auth gate for the app HTML | Yes |
| `api/` | Serverless backend | Yes |

`src/`, `build.js`, and `package.json` are excluded from deployment via
`.vercelignore`, so the readable source never ships.

## To make a change

```bash
# 1. edit src/index.html and/or src/main-config.js
# 2. rebuild the deployed index.html
npm install        # first time only
npm run build
# 3. commit BOTH the src change and the regenerated index.html
git add src/ index.html
git commit -m "..."
```

## Before trusting a build in production

Obfuscation can in rare cases change runtime behaviour. After a build:

1. Push to a **Vercel preview deployment** (not production).
2. Log in and run a real game end-to-end (Fetch → Load, open every modal,
   check the map/items/gold panels).
3. Only promote to production once the preview looks correct.

If anything breaks, rollback is trivial — `git revert` the build commit, or set
obfuscation to a no-op by editing `build.js` (the obfuscator options are at the
bottom of `main()`; you can return `combined` unchanged to ship plain minified
source while you debug).
