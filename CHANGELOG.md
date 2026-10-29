# Changelog — mlbb-tool

The revision record for this repo. Newest first, grouped by date.

`git log` says *what* changed; this file says **why**, which is the part nobody
can reconstruct a year later. Started 2026-08-24, when `LAPTOP-HANDOVER.md` was
frozen. Same convention as `mpl-ph-s17`, `mpl-ph-s17-backend` and `mpl-intl`.

## How to write an entry

Every change that alters behaviour gets one entry, written **in the same commit
as the change** — not batched at the end of a week, when the reasoning is gone.

```
## YYYY-MM-DD

### type(scope): one-line summary
What changed, and the decision behind it — 1–3 sentences. Name the option that
was rejected if it was a close call, and the trap if there was one.
→ path/to/file
```

This repo is mostly **assets served to every site over jsDelivr**, so the rules
lean that way:

**Log it** when an asset is **renamed, replaced, or removed** — a live site is
reading that exact path, and a rename is a silent 404 somewhere else. Say which
sites consume it. Also log: new asset naming conventions, anything that changes
what a site must request, and changes to the Vercel tool app's behaviour.

**Skip it** for: purely additive uploads that nothing references yet, and
formatting passes. If a change is skippable but you had to think hard about it,
log it anyway — the thinking is the thing worth keeping.

Types follow the commit convention already in use: `feat`, `fix`, `perf`,
`refactor`, `chore`, `docs`.

---

## 2026-10-29

### feat(ci): every pushed image is copied to Supabase Storage automatically
All sites read images from the Storage bucket `assets`, but the bucket only
caught up when someone ran `sync-storage.js` by hand — a pushed-but-unsynced
image looked exactly like the old jsDelivr "does not load" problem. New Action
`sync-storage.yml` runs the same script on every push that touches an image (and
on demand). The script uploads only files whose md5 differs and never deletes,
so it is safe to re-run. Needs repository secrets `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY`; without them the run fails loudly instead of
skipping. `sync-photos.yml` stays: it maps photos to player/team rows, this one
only copies bytes. Same day: the one file the bucket lacked (`ingame_bg.jpg`)
was synced by hand. mlbb-assets-leagues still has no such Action.
→ .github/workflows/sync-storage.yml

## 2026-10-19

### fix(app): header fits on laptops and phones
The header was one fixed row about 1650 px wide, so on a 1366–1536 px laptop the
Gold/Map/Items/Stats buttons sat off screen behind a sideways scroll (impeccable
audit, P1). It now wraps: one row at 1920, controls on a second right-aligned
row on laptops, stacked on a phone, with the scoreboard keeping its 420 px until
the screen is narrower. Header buttons are 44 px tall on touch screens. Also:
the PvP icon (`fa-sword` is Pro-only, rendered blank) is now `fa-people-arrows`,
and "by the BOK" is legible (slate-500 → slate-400). The body grid below the
header is still desktop-only on a phone.
→ src/index.html, index.html

### feat(app): opened mid-game, the graphs still start at 00:00
On every battle load the app fetches `api/history.js` (backend
`/admin/tool/history`) and fills the gold lead graphs, PvP compare, map/heatmap
positions and item timings for the seconds before it was opened. Items owned at
load are marked as seen, so they are no longer all logged as "bought now".
If Render never tracked the game, the graphs start at load time and the header
chip says "history from mm:ss".
→ api/history.js, src/index.html, index.html

### feat(app): names, roles, teams, logos, heroes, items and maps come from the database
New `api/bundle.js` loads the backend's `/admin/tool/bundle` for the league
picked in the Render admin card **// mlbb-tool league**; the app reloads it
when that choice changes. Players and teams are matched by roleid and Moonton
`team_id`, never by name. Removed: the MPL ID `PLAYER_CONSTS`/`TEAM_CONSTS`,
the 8-player `PLAYER_ROLE_MAP` and its four name-matching lookups (everyone
else used to show as ROAM), `DISABLE_TEAM_LOGOS`, and `./teamlogo/<name>.png`.
A player missing from the roster keeps the in-game name with **⚠** (header chip
counts them); a roster player with no lane shows **?** and sorts last — no lane
is guessed. `HERO_DATA`/`ITEM_DATA`/`MAP_NAMES` stay only as the fallback when
Render is unreachable (chip shows "DB: offline"). Judge id for the manual Fetch
fallback moved to env `MLBB_JUDGE_ID`.
→ api/bundle.js, api/_render.js, api/latestbattle.js, src/index.html, src/main-config.js, index.html, .env.example

### feat(app): battle ID comes from the Render backend, auto-loads the live game
`/api/latestbattle` now asks the backend's `GET /admin/live/current` (the game
watcher already knows the live battle) instead of the hardcoded Moonton judge.
The app polls it every 10s and switches to a new battle by itself (**Auto ●**
button, on by default). Fetch/Load still work and pause Auto; only a manual
Fetch falls back to the judge lookup, so open tabs never poll Moonton. Needs
`RENDER_URL` and `TOOL_TOKEN` in Vercel env — without them Auto stays idle.
→ api/latestbattle.js, src/index.html, index.html, build.js, .env.example

## 2026-09-30

### feat(export): Supabase Storage columns in the Sheets CSVs, jsDelivr kept as backup
`export_urls.js` now writes `Storage URL` and `Storage Image Formula` columns
(bucket URL, same path) into `mlbb_assets_master.csv` and the items/runes/skills/
roles CSVs. They are added LAST, so existing Sheets references to columns A–H don't
shift, and the jsDelivr columns stay unchanged as a fallback (BOK's call over
replacing them). The trap: an asset only reaches the bucket after
`sync-storage.js` runs. Before this change the new column would have been blank for
any file that was committed but not synced; all 617 URLs were checked and returned 200.
→ export_urls.js, mlbb_assets_master.csv, mlbb_items.csv, mlbb_runes.csv, mlbb_skills.csv, mlbb_roles.csv

## 2026-09-29

### feat(maps): second map pool — icons, minimaps, MAP_NAMES
Adds 12 Revealing Wisps, 15 Healing Turtle, 16 Golden Turret (ids from the live
game API): `mapicon/12|15|16.png` (BOK's 128px art) and `Maps/Map_12|15|16.png`
(copies of Map_0 — no real minimap yet, BOK's call). Old ids kept for old games.
**`mapicon/3.png` (Flying Cloud) replaced in place** with the new-style icon.
Overwrite, not a new filename, by BOK's choice: the bucket serves with a 1-year
immutable cache, so browsers that already hold the old icon keep it until expiry.
Consumers: mpl-ph-s17 (Supabase bucket), mpl-intl (jsDelivr), local_postgame.
→ mapicon/, Maps/, src/index.html

## 2026-09-19

### feat(playerimage): SpiderMilez and Kayn photos for MPL PH S18
Two S18 players had no photo, so `mpl-ph-s17` fell through to a letter avatar for
both on every surface that renders `<PlayerImg>`. Additive in the filesystem but
**not** additive in effect — `img.player()` resolves by IGN, so these paths were
already being requested and already 404ing. That is why this is logged.
→ playerimage/SpiderMilez_FRONT.png (AP Bren), playerimage/Kayn_FRONT.png (TWIS PH)

Cropped to the folder's existing spec — **512x512, 256-colour palette PNG,
transparent background** — matching what `ccce02b` re-encoded every other photo
to. Sources were 1000x1000 masters. Kayn lands at 70 KB against the folder's
62 KB previous maximum; the TWIS camo jersey simply holds more colour, and the
jsDelivr 50 MB cap that forced the original squeeze no longer binds now that
Supabase Storage serves these.

Filenames use the feed's spelling. `sync-storage.js` also uploads uppercased and
space-stripped stems, so the site hits on one request whatever the feed sends.


### fix(playerimage): the S18 manifest and the photo counts catch up with the two new photos

Follow-up to the entry above, from an identity review of it. Two places still
described the state before SpiderMilez and Kayn existed.

`mpl_ph_s18_playerimage.csv` had no row for either, so two S18 photos existed
that the S18 manifest did not list. That file is not decorative — it carries the
`=IMAGE()` URLs feeding BOK's Google Sheets, which `mpl-ph-s17/lib/images.js`
deliberately left pointing at jsDelivr when everything else moved to Supabase
Storage. Each player was inserted into their own team's block rather than
appended, because this file is grouped by roster, not sorted.
→ mpl_ph_s18_playerimage.csv (69 players)

**The two new rows 404 until this repo is pushed.** jsDelivr serves from GitHub
`main`, so a local commit is invisible to it. The website is unaffected and was
correct immediately — it reads Supabase Storage, and `sync-storage.js` uploads
from the working tree, not from GitHub. Worth knowing that these two surfaces
now go live at different moments.

`sync-storage.js:45` and `:121` still said "135 photos". The count is 137 (70
here + 67 in mlbb-assets-leagues), and both transforms still produce 137
distinct keys, so the collision-free claim those comments make still holds —
only the number was stale. `mpl-ph-s17` commit 062e95d fixed the same number in
`lib/images.js` but missed the script its comment cites as the source.
→ sync-storage.js

### feat(sync-storage): this repo's images are copied to Supabase Storage, which now serves them
`mpl-ph-s17` no longer requests anything from jsDelivr. The cause was structural:
this repo's tracked tree is **57.4 MB against jsDelivr's 50 MB package cap**, so
`data.jsdelivr.com/v1/packages/gh/Bokpau/mlbb-tool@main` answers
`403 Package size exceeded`. Individual files still passthrough-serve — which is
why nothing looked broken — but jsDelivr cannot build a package index, and cold
fetches measured **1.1-3.6s against 0.19-0.23s warm**. MPL PH never felt it
because PH traffic keeps PH's files hot; MSL Thailand is a new audience on Thai
POPs that had never cached this repo, so its art was cold nearly every request.

**Nothing here was renamed, replaced or removed. `sync-storage.js` COPIES.** Git
stays the source of truth, every path still resolves on jsDelivr, and the
`=IMAGE()` URLs in `mlbb_assets_master.csv` that feed BOK's Google Sheets are
deliberately untouched. Re-runnable: content-hash diff, 8 concurrent, ~80s for a
full sync. `--root ../mlbb-assets-leagues` syncs the league repo into the same
bucket (their paths have zero overlap, so one bucket serves every league).

**Trimming under the cap was tried first and rejected.** `hero_selection` and
`hero_ban` are published to the Sheets via `mlbb_assets_master.csv`;
`ph_playerimage` is the irreplaceable pre-S18 era archive
(`PH_PLAYERIMAGE_PLAN.md`); `hero_default`, `hero_skill_icon` and `hero_portrait`
feed `local_postgame` and both sites. Nothing was safely deletable, and the best
case bought ~4 MB — one season.

**New naming convention worth knowing:** every `playerimage/` file is also
uploaded under an uppercased stem and a space-stripped uppercased stem, because
display names and filenames disagree in both directions (`SUPER MARCO` is stored
spaceless; MSL's `AMY H4CK` keeps its space). The site uppercases and strips
spaces, so one request always hits. Never strip `.` as well — it would collide
`AGI.`/`AGI`, `IZY.`/`IZY` and `ROBINX.`/`ROBINX`, which are distinct files.

Consumers still on jsDelivr and unaffected: `mpl-intl`, `local_postgame`, and
the Sheets.
→ sync-storage.js

---

## Before 2026-08-24

Not backfilled. For earlier history: `git log --oneline`, and the frozen
`LAPTOP-HANDOVER.md` (with `mpl-ph-s17-backend/HANDOVER-INDEX.md` for the
cross-repo ordering).
