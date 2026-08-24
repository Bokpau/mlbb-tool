# CLAUDE.md — mlbb-tool (Shared Asset Repo + Tool App)

> ## ⚠️ READ FIRST IF THIS CLONE IS ON THE RECOVERED MAIN LAPTOP
>
> The main laptop broke on/around **2026-08-13** with every repo on it. Work
> continued on a replacement machine. If you are Claude running against a clone
> whose `HEAD` is at or before **`623bc08`** (2026-08-10), you are on the **old
> disk**, this file you are reading is **stale**, and there is a newer procedure
> waiting for you on `origin`.
>
> **Do not `git pull`, merge, rebase, checkout, or stash anything first.** The old
> clone's dirty files, stashes, and un-pushed branches are the evidence of what was
> lost; a pull merges them away with no undo. `git fetch` alone is safe — it never
> touches the working tree or local commits.
>
> Do exactly this:
>
> ```bash
> git fetch origin && git show origin/main:reconcile-old-laptop.sh > /tmp/reconcile.sh && bash /tmp/reconcile.sh
> ```
>
> That prints and saves a full read-only report: which machine the clone is from,
> whether anything tracked is stranded, uncommitted work, stashes, un-pushed
> branches, and an inventory of the gitignored files that exist **only** on that
> disk. Then read `LAPTOP-HANDOVER.md` (`git show origin/main:LAPTOP-HANDOVER.md`)
> — §3 is the decision tree, §4 is the recovery list. The cross-repo ordering lives
> in `mpl-ph-s17-backend/HANDOVER-INDEX.md`.
>
> **This machine resumes as primary (decided 2026-08-16).** So: harvest the §4 items
> off this disk, *then* `git merge --ff-only origin/main`, then re-arm (see the index).
> **Do not delete this clone** — earlier wording said it could go once checked, which
> was written when the replacement laptop was expected to stay home. That advice is
> withdrawn.
>
> **Two things to get right, both irreversible:**
> - `hero_transparent/` has **never been committed** in this repo's history. It is
>   not on GitHub, not on the CDN, and not on the replacement laptop. If it exists
>   on the recovered disk, copy it off **before anything else**.
> - The replacement laptop's `playerimage/` holds the **S18** photos; the old disk
>   holds superseded **S17** bytes at those same paths. Copying the old clone over
>   the new one silently reverts 41 live broadcast assets. Never resolve a binary
>   asset conflict by taking the old side.

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

## Changelog — every behaviour change gets an entry

`CHANGELOG.md` is this repo's revision record: `git log` says what changed, the
changelog says **why**. Write the entry **in the same commit as the change**, not
at the end of a session. The format and the log/skip rule are at the top of
`CHANGELOG.md` — read it before the first entry.

This repo is mostly assets that live sites read by exact path, so the rule that
matters here: **a rename, replacement or removal always gets an entry**, naming
which sites consume that path. A purely additive upload nothing references yet
does not. Same convention in `mpl-ph-s17`, `mpl-ph-s17-backend` and `mpl-intl`.

## Replacement-laptop handover log — FROZEN

`LAPTOP-HANDOVER.md` is frozen as of 2026-08-24. **Do not update it.** Ongoing
changes go in `CHANGELOG.md`. It stays as the record of the replacement-laptop
window, and because §4 — the list of gitignored files that exist on one disk only
— is still live if the recovered disk is reconciled. `reconcile-old-laptop.sh`
and its `DEVICE_BASE`/`DEVICE_HEAD` values are frozen at the same point.

Retire this section, `LAPTOP-HANDOVER.md`, the banner at the top of this file, and
the script together once the disk is recovered and reconciled — not before.
