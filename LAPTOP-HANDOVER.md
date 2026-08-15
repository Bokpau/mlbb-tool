# Laptop handover — everything done on the replacement laptop

**Living document.** Started 2026-08-15, after the main laptop broke with all files
and repos on it. It exists so that when that disk is recovered, it is possible to
tell in one pass what is new here, what is stale there, and what only ever existed
on that machine.

Companion to the file of the same name in `mpl-ph-s17-backend`. §7 says who updates
what.

- **Device window base:** `623bc08` (2026-08-10) — the last commit before this
  laptop. This clone was made **2026-08-13 18:34** directly from
  `github.com/Bokpau/mlbb-tool` at that commit, so *everything after `623bc08` was
  done here*, with no ambiguity.
- **Untracked recovery list:** §4. For this repo that list is the whole reason the
  old disk matters — and unlike the backend, one entry on it (`hero_transparent/`)
  **has no copy anywhere else**.

## 0. Current state

| | |
|---|---|
| Head of window | `623bc08` → `3ca979b` |
| Commits on this device | 5 |
| Diff | 143 files, +1,324 lines of text, ~120 binary assets |
| Push state | **All pushed.** local `main` == `origin/main` == `3ca979b`, 0 ahead / 0 behind |
| Working tree | clean, no untracked files |
| Last reviewed | 2026-08-15 |

**Nothing tracked by git is stranded on this laptop.** GitHub (`Bokpau/mlbb-tool`)
has all five commits. The exposure in this repo is entirely in §4.

## 1. What was done here — 2026-08-14

One session, newest first. All of it is the **MPL PH S18 player photo rollover**.

| # | Commit | What it did |
|---|---|---|
| 5 | `3ca979b` fix(csv) | **Perkz** and **Coach Eson** keep their established filenames (`Perkziva_FRONT.png`, `Eson_FRONT.png`) rather than taking their new S18 IGN, so `mpl_ph_s18_playerimage.csv` was pointing at two URLs that do not exist. Both files verified to be the S18 crops, not the S17 originals. |
| 4 | `ebb6b6e` fix(playerimage) | `Master The Basics_FRONT.png` was **unreachable**. Every consumer resolves photos through `photoName()`, which strips whitespace before building the URL, so the site could only ever request `MasterTheBasics_FRONT.png` — the spaced filename could never be hit and the coach rendered no photo. Renamed to match the name it used before the S18 replacement. |
| 3 | `62522ff` feat(tools) | **`player_cropper_server.py`** — turns the full-body broadcast masters in `_raw/s18` into 1080×1080 web assets. The crop is *solved* from the alpha channel, not guessed: a single bbox pass measures the whole standing figure, so a wide stance inflates the width and the head-and-torso crop lands too small. The solver re-measures inside the candidate crop and rescales until the visible subject hits the target fill; converges in a few rounds and reproduced the existing spec to within 0.1% on all 68 masters. **`player_cropper.html`** is the manual tuning grid for the ones auto gets wrong (live canvas preview, per-player zoom/x/y, overrides persisted so re-runs stay reproducible). Also adds `PH_PLAYERIMAGE_PLAN.md` (194 lines), the era-correct rollout plan. **Needs Pillow, which is not installed system-wide** — see the module docstring. |
| 2 | `6d2ac4a` feat(ph_playerimage) | New **`ph_playerimage/`** folder: a snapshot of `playerimage/` as it stood before the S18 replacement, so historical MPL PH surfaces render era-correct photos instead of a player's current jersey. Named to the teamlogo era convention (`Aeon_FRONT_s17.png`). Filenames deliberately keep the **S17-era IGN** — Perkziva, Wurahhhh, Domengkite, Raizen., Daiki_, Eson — not the S18 names, because per `identity-rules.md` Rule 5 an era asset is keyed by the name used that season and the alias rows resolve `player_key → era IGN → filename`. Renaming these to S18 IGNs would break the exact lookup this folder exists to serve. **No consumer reads this folder yet.** |
| 1 | `bdcfdb7` feat(playerimage) | **67 S18 photos replace the S17 set** in `playerimage/`, cropped from the broadcast masters to the same 1080×1080 spec the existing assets followed (subject 74.6% of frame width, 0.9% headroom, torso running off the bottom edge, centred). The 29 S17-only players are **not deleted** — they move to `ph_playerimage/` in commit 2, byte-identical. `default.png` stays put: it is the fallback that `post_game`, `postgame-ssr`, `local_postgame` and `mpl-ph-s17` all reference. Filenames reuse the existing spelling and case wherever a player already had an asset (shizou, Dexstar, Sn4p, Haze, MasterTheBasics) so the CDN **replaces** the file rather than silently creating a case-variant duplicate. Adds `mpl_ph_s18_playerimage.csv` listing every player and their CDN URL. |

### Why this one is riskier than a normal commit range

This window **overwrote 41 binary assets in place** at paths that live broadcast
graphics already request. The old laptop's clone still has the S17 bytes at those
same paths. If the recovered clone is ever pushed, force-pushed, or copied over this
one, it silently reverts every S18 photo. Treat §3 Case A as the expected outcome
and do not "restore" the old copy over this one.

## 2. Files touched, `623bc08..3ca979b`

New text files, all at repo root:

```
PH_PLAYERIMAGE_PLAN.md          +194   (NEW)  era-correct rollout plan
player_crop_solved.json         +478   (NEW)  solved crop params, 68 masters
player_cropper_server.py        +283   (NEW)  alpha-bbox crop solver
player_cropper.html             +231   (NEW)  manual tuning grid
player_crop_names.json          +70    (NEW)  master filename → player map
mpl_ph_s18_playerimage.csv      +68    (NEW)  player → CDN URL  (2 lines fixed in 3ca979b)
```

Binary assets:

| Folder | Before | After | Change |
|---|---|---|---|
| `playerimage/` | 70 | 68 | 41 modified in place (re-cropped S18), 26 added (new S18 players), 28 moved out to `ph_playerimage/` |
| `ph_playerimage/` | — | 70 | **new folder.** 28 arrived as pure moves (S17-only players, byte-identical), 42 as new files (players who also have an S18 photo, so the S17 copy is an addition) |

## 3. Reconciliation procedure — run these when the old laptop's disk is back

Assume the recovered clone is mounted at `/Volumes/OLD/…/mlbb-tool`.
**Do not `git pull` inside the recovered clone before doing this** — a merge or
rebase would destroy the evidence of what its state actually was. `git fetch` on its
own is safe: it never touches the working tree or local commits.

### Start here — one command

`reconcile-old-laptop.sh` does the whole of this section automatically and
read-only. It won't exist in the recovered clone (it was written after that disk
died), so pull it from `origin` without checking anything out:

```bash
cd /Volumes/OLD/path/to/mlbb-tool && git fetch origin && git show origin/main:reconcile-old-laptop.sh > /tmp/reconcile.sh && bash /tmp/reconcile.sh
```

It prints and saves a report to `~/mlbb-tool-reconcile-<timestamp>.md` covering:
which machine the clone came from, the Case A/B/C verdict below, uncommitted work,
stashes, un-pushed branches, and a sized inventory of the §4 items. It refuses to
mislead you if run on the wrong clone — it detects the replacement laptop and says
so. It runs no command that writes to the repository.

The same banner and command are at the top of `CLAUDE.md`, so Claude on the
recovered machine finds this path on its own after a `git fetch`.

### Or by hand

```bash
cd /Volumes/OLD/path/to/mlbb-tool && git log --oneline -1 && git status --porcelain
```

That one command answers most of it. Three cases:

**Case A — its HEAD is an ancestor of `3ca979b` and the tree is clean.** This is the
expected result. Nothing tracked was lost. **Do not copy the old clone over this
one** (see §1). Harvest §4 from the disk, then the clone itself can go.

```bash
cd /Volumes/OLD/path/to/mlbb-tool && git merge-base --is-ancestor HEAD 3ca979b && echo "OLD IS BEHIND — nothing unique on it"
```

**Case B — the tree is dirty, or there are commits not on GitHub.** Pull them across
as a remote rather than copying files by hand:

```bash
cd ~/Documents/github/mlbb-tool && git remote add oldlaptop /Volumes/OLD/path/to/mlbb-tool && git fetch oldlaptop && git log --oneline --left-right --cherry-mark HEAD...oldlaptop/main
```

Anything marked `>` exists only on the old machine. Diff a specific file with
`git diff oldlaptop/main -- path/to/file`. Uncommitted work on the old clone won't
appear in a fetch — check `git status` and `git stash list` there directly.

For this repo specifically, the useful question is *which assets differ*, since a
binary diff tells you nothing readable:

```bash
git diff --stat oldlaptop/main HEAD -- playerimage ph_playerimage teamlogo intl_teamlogo
```

**Case C — the old clone is ahead on a branch other than main.**

```bash
cd /Volumes/OLD/path/to/mlbb-tool && git branch -a -v && git stash list
```

## 4. What is NOT in git — the only real reason to recover the disk

These are gitignored and exist only on disk.

| Path | Status here | Notes |
|---|---|---|
| `hero_transparent/` | **ABSENT — never committed, no copy anywhere** | 🔴 **The single highest-value item on the disk.** Broadcast cut-out portraits, files up to 25MB. Gitignored because jsDelivr rejects >20MB, and `git log --all -- hero_transparent` confirms it has **never** been committed in this repo's history. It is not on GitHub, not on the CDN, and not on this laptop. If the disk is unrecoverable these are gone and must be re-cut from source. Recover this folder **first**. |
| `_raw/` | present, but **S18 only** | 1.9 GB, 136 files, all under `_raw/s18`, all created on this laptop 2026-08-13 or later — these are the S18 broadcast masters that `player_cropper_server.py` consumes. The old disk's `_raw/` will hold everything *earlier* (S17 and prior masters, working PSDs, scratch). `CLAUDE.md` calls `_raw/` "the backup-less folder" — there is no other copy. Merge the old tree in **alongside** `s18`, do not replace. |
| `.env` | **absent** | Never created here; the tool app was not run locally on this laptop. `APP_PASSWORD`, `SESSION_SECRET`, `MLBB_AUTH`. Recoverable from **Vercel env settings** without the disk, so this is a convenience, not a risk. `.env.example` (committed) holds the placeholders. |
| `.vercel/` | absent | Project link. Rebuilt by `vercel link`. Ignore. |
| `node_modules/` | absent | Rebuildable. Ignore. |
| `int_player_history/resources/`, `*.html`, `player_img_map2.json` | not present here | Gitignored as "generated/scraped — too large/ephemeral for git". If they were regenerated or hand-corrected on the old laptop, that work is **not** on GitHub. Worth a look. |
| `.claude/` | n/a for this repo | Note the backend's finding: its `role-guardian` and `identity-checker` agents were lost with the old laptop because `.claude/` was gitignored. If this repo ever gains local agents, un-ignore them. |

## 5. Consumers — who reads these assets

This repo is the **single centralized image source**, so a path change here is a live
breakage somewhere else. Present on this laptop: `local_postgame`, `mpl-int`,
`mpl-ph-s17`, `mpl-ph-s17-backend`, `post_game`, `postgame-ssr`.

- `local_postgame/assets/img` is a **symlink → `../../mlbb-tool`** (recreated here
  2026-08-13 18:34). Git does not carry it usefully across machines; if the recovered
  clone's symlink points somewhere else, this one is correct.
- The S18 photo swap in `bdcfdb7` reused existing filenames on purpose, so consumers
  needed **no code change** — they pick up the new bytes on the next jsDelivr cache
  turn. `801b8af` (pre-window) added a CDN purge step to the export workflow.
- `ph_playerimage/` has **no consumer yet**. Wiring it up is the open work; see
  `PH_PLAYERIMAGE_PLAN.md`.
- `mpl-ph-s17` and `mpl-ph-s17-backend` also had commits in this window (through
  2026-08-15) — the backend keeps its own `LAPTOP-HANDOVER.md`. Run the §3 procedure
  in every clone when the disk is recovered.

## 6. Commit ledger

| Commit | Date | Subject |
|---|---|---|
| `3ca979b` | 2026-08-14 22:32 | fix(csv): point Perkz and Coach Eson at their actual filenames |
| `ebb6b6e` | 2026-08-14 22:26 | fix(playerimage): drop spaces from MasterTheBasics filename |
| `62522ff` | 2026-08-14 22:22 | feat(tools): add player photo cropper + era-correct rollout plan |
| `6d2ac4a` | 2026-08-14 22:22 | feat(ph_playerimage): archive S17 PH player photos, era-suffixed |
| `bdcfdb7` | 2026-08-14 22:22 | feat(playerimage): replace with 67 S18 MPL PH player photos |

Regenerate at any time:

```bash
git log --reverse --date=format:'%Y-%m-%d %H:%M' --pretty=format:'| `%h` | %ad | %s |' 623bc08..HEAD
```

## 7. Who updates what

| Part | Owner | When |
|---|---|---|
| §0 current state | **Claude** | when the window is reviewed |
| §1, §2 narrative | **Claude** | whenever a change is worth explaining — an asset rename, a folder convention, anything a subject line can't carry |
| §3 procedure | BOK | if the recovery plan changes |
| §4 untracked list | **Claude** | whenever something gitignored is added, or `.gitignore` changes |
| §5 consumers | **Claude** | when an asset path changes that another repo reads |
| §6 ledger | **Claude**, or the command above | per session with commits |

This is enforced by the **"Replacement-laptop handover log"** rule in `CLAUDE.md`,
which is auto-loaded every session — so the obligation travels with the repo instead
of depending on anyone remembering it.

Unlike `mpl-ph-s17-backend`, this repo has **no `post-commit` hook** driving the
ledger — §6 is maintained by hand or by the one-liner above. This repo commits in
infrequent bursts, so a hook would earn less than it costs. To install one anyway,
port `update-handover-ledger.js` from the backend repo and run it with
`--install-hook`.

### Retiring this

Once the disk is recovered and reconciled, delete together: this file,
`reconcile-old-laptop.sh`, the `⚠️ READ FIRST` banner at the top of `CLAUDE.md`, and
the `Replacement-laptop handover log` section of `CLAUDE.md`. Leaving a stale
recovery banner in place is worse than having none — the next reader will trust it.
