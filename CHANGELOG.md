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
