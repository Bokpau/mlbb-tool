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
> — §3 is the decision tree, §4 is the recovery list.
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

## Replacement-laptop handover log

`LAPTOP-HANDOVER.md` records everything done on the replacement machine since
`623bc08`, so the recovered disk can be reconciled in one pass. It is a living
document and **Claude keeps it current** — nobody will remember to ask.

Update it in the same commit as the change, not later:

| Trigger | What to update |
|---|---|
| A commit worth explaining — an asset rename, a folder convention, a filename↔IGN decision, anything a subject line can't carry | §1 narrative, §2 file table, §6 ledger |
| Something gitignored is added, or `.gitignore` changes | §4 — the recovery list. **This is the section that matters most**; it is the only record of what exists on one disk only |
| An asset path changes that another repo reads | §5 consumers |
| The window's head moves | §0 current state |

Regenerate the §6 ledger with:

```bash
git log --reverse --date=format:'%Y-%m-%d %H:%M' --pretty=format:'| `%h` | %ad | %s |' 623bc08..HEAD
```

Leave `DEVICE_BASE`/`DEVICE_HEAD` in `reconcile-old-laptop.sh` in step with §0.
Retire this section, `LAPTOP-HANDOVER.md`, the banner at the top of this file, and
the script together once the disk is recovered and reconciled — not before.
