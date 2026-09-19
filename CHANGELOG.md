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
