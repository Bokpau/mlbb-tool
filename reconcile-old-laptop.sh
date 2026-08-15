#!/usr/bin/env bash
#
# reconcile-old-laptop.sh — evidence collector for the recovered main-laptop disk.
#
# Run this INSIDE the recovered clone, before doing anything else to it.
#
# STRICTLY READ-ONLY. It runs no command that writes to the repository: no pull,
# no merge, no rebase, no checkout, no stash, no gc, no config change. The only
# thing it writes is its report, to $HOME (never inside the repo, so the working
# tree it is measuring stays untouched).
#
# Why read-only matters: the old clone's dirty files, stashes, and un-pushed
# branches ARE the evidence. A `git pull` here would merge them away and there is
# no undo. Collect first, decide second.
#
# Usage:
#   bash reconcile-old-laptop.sh                 # inspect the repo you are cd'd into
#   bash reconcile-old-laptop.sh /Volumes/OLD/…/mlbb-tool
#
# If this script does not exist in the recovered clone (it won't — it was written
# after that disk died), get it without touching the working tree:
#
#   git fetch origin                             # fetch is safe; it changes nothing local
#   git show origin/main:reconcile-old-laptop.sh > /tmp/reconcile.sh
#   bash /tmp/reconcile.sh
#
set -uo pipefail

# The head of the replacement-laptop work window. See LAPTOP-HANDOVER.md.
DEVICE_BASE="623bc08"
DEVICE_HEAD="dcd673a"

REPO="${1:-$(pwd)}"
cd "$REPO" 2>/dev/null || { echo "FATAL: cannot cd to $REPO"; exit 1; }
TOP="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "FATAL: $REPO is not a git repository"; exit 1; }
cd "$TOP"

STAMP="$(date +%Y%m%d-%H%M%S)"
REPORT="$HOME/mlbb-tool-reconcile-$STAMP.md"

# Everything below is tee'd into the report as well as printed.
exec > >(tee "$REPORT") 2>&1

say() { printf '\n## %s\n\n' "$*"; }
kv()  { printf '%-34s %s\n' "$1" "$2"; }

echo "# mlbb-tool — recovered-disk reconciliation report"
echo
kv "Generated:" "$(date '+%Y-%m-%d %H:%M:%S %z')"
kv "Repo inspected:" "$TOP"
kv "Host:" "$(hostname 2>/dev/null || echo unknown)"
echo
echo "Read-only. No repository state was modified by this script."

# ---------------------------------------------------------------------------
say "1. Which machine is this clone from?"

CLONE_LINE="$(git reflog show --date=iso 2>/dev/null | grep -m1 'clone:' || true)"
kv "Clone reflog entry:" "${CLONE_LINE:-(none — clone predates reflog, or reflog expired)}"
kv "HEAD:" "$(git log -1 --pretty='%h %ad %s' --date=iso 2>/dev/null)"
kv "Current branch:" "$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"

if git merge-base --is-ancestor "$DEVICE_HEAD" HEAD 2>/dev/null; then
  kv "Verdict:" "This looks like the REPLACEMENT laptop (contains $DEVICE_HEAD). Wrong clone?"
else
  kv "Verdict:" "Does NOT contain $DEVICE_HEAD — consistent with the old disk."
fi

# ---------------------------------------------------------------------------
say "2. Is anything tracked stranded here? (the Case A / B / C question)"

if ! git cat-file -e "${DEVICE_HEAD}^{commit}" 2>/dev/null; then
  echo "NOTE: $DEVICE_HEAD is not in this clone's object store yet."
  echo "      Run 'git fetch origin' (safe — it does not touch the working tree"
  echo "      or your commits) and re-run this script for a complete answer."
  echo
fi

DIRTY="$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
UNTRACKED="$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | tr -d ' ')"
STASHES="$(git stash list 2>/dev/null | wc -l | tr -d ' ')"

kv "Dirty/modified entries:" "$DIRTY"
kv "Untracked (non-ignored) files:" "$UNTRACKED"
kv "Stashes:" "$STASHES"

if git cat-file -e "${DEVICE_HEAD}^{commit}" 2>/dev/null; then
  if git merge-base --is-ancestor HEAD "$DEVICE_HEAD" 2>/dev/null; then
    ANCESTRY="YES — HEAD is an ancestor of $DEVICE_HEAD"
  else
    ANCESTRY="NO — this clone has commits NOT in $DEVICE_HEAD"
  fi
else
  ANCESTRY="UNKNOWN — fetch origin first"
fi
kv "HEAD already on GitHub?:" "$ANCESTRY"

echo
if [ "$DIRTY" = "0" ] && [ "$STASHES" = "0" ] && [ "${ANCESTRY:0:3}" = "YES" ]; then
  echo "  >>> CASE A. Clean, behind, nothing unique in git."
  echo "      Nothing tracked was lost. Do NOT copy this clone over the new one —"
  echo "      it still holds the pre-S18 photo bytes at live asset paths and would"
  echo "      silently revert 41 broadcast assets. Harvest section 4 below, then"
  echo "      FAST-FORWARD this clone:  git merge --ff-only origin/main"
  echo "      (This machine resumes as primary — do NOT delete this clone.)"
elif [ "${ANCESTRY:0:2}" = "NO" ] || [ "$DIRTY" != "0" ] || [ "$STASHES" != "0" ]; then
  echo "  >>> CASE B or C. Something exists only here. Details in sections 3 and 5."
  echo "      Move it with a remote/bundle, never by copying files over the new clone."
else
  echo "  >>> INCONCLUSIVE. Run 'git fetch origin' and re-run."
fi

# ---------------------------------------------------------------------------
say "3. Uncommitted work here (would be destroyed by a pull)"

if [ "$DIRTY" != "0" ]; then
  echo '```'
  git status --porcelain
  echo '```'
  echo
  echo "Text-file diffs (binaries omitted):"
  echo '```'
  git diff --stat -- '*.md' '*.csv' '*.js' '*.json' '*.html' '*.py' '*.yml' '*.sh' 2>/dev/null | tail -40
  echo '```'
else
  echo "None. Working tree is clean."
fi

if [ "$STASHES" != "0" ]; then
  echo
  echo "Stashes (NOT transferred by fetch — must be handled explicitly):"
  echo '```'
  git stash list --date=iso
  echo '```'
fi

# ---------------------------------------------------------------------------
say "4. Gitignored recovery items — the real reason this disk matters"

check_path() {
  local p="$1" label="$2"
  if [ -e "$p" ]; then
    local n sz newest
    n="$(find "$p" -type f 2>/dev/null | wc -l | tr -d ' ')"
    sz="$(du -sh "$p" 2>/dev/null | cut -f1)"
    newest="$(find "$p" -type f -exec stat -f '%Sm %N' -t '%Y-%m-%d' {} + 2>/dev/null | sort -r | head -1)"
    printf '%-28s PRESENT   %6s  %5s files   newest: %s\n' "$label" "$sz" "$n" "${newest:-n/a}"
  else
    printf '%-28s ABSENT\n' "$label"
  fi
}

echo '```'
check_path "hero_transparent" "hero_transparent/"
check_path "_raw"             "_raw/"
check_path ".env"             ".env"
check_path "int_player_history/resources" "int_player_history/resources/"
check_path "int_player_history/player_img_map2.json" "int_player_history/…map2.json"
check_path ".claude"          ".claude/"
echo '```'
echo
echo "PRIORITY ORDER — copy these OFF the disk before anything else:"
echo
echo "1. hero_transparent/  — HIGHEST. Never committed in this repo's entire history"
echo "   (verify: git log --all --oneline -- hero_transparent  → empty). Not on GitHub,"
echo "   not on the CDN, not on the replacement laptop. Broadcast cut-out portraits up"
echo "   to 25MB. If this disk dies, they are gone and must be re-cut from source."
echo
echo "2. _raw/  — the 'backup-less folder'. The replacement laptop has ONLY _raw/s18."
echo "   Everything older (S17 and prior masters, working PSDs) exists only here."
echo "   MERGE alongside s18 — do not replace the folder."
echo
echo "3. int_player_history/  — generated/scraped, gitignored. Only matters if it was"
echo "   hand-corrected rather than regenerated."
echo
echo "4. .env  — convenience only. Recoverable from Vercel env settings without this disk."

if [ -d "_raw" ]; then
  echo
  echo "_raw/ subdirectories found here (compare against s18-only on the new laptop):"
  echo '```'
  find _raw -maxdepth 1 -mindepth 1 -type d -exec sh -c \
    'printf "%-30s %6s  %s files\n" "$1" "$(du -sh "$1" 2>/dev/null|cut -f1)" "$(find "$1" -type f|wc -l|tr -d " ")"' _ {} \; 2>/dev/null | sort
  echo '```'
fi

if [ -d "hero_transparent" ]; then
  echo
  echo "hero_transparent/ inventory (first 25 of $(find hero_transparent -type f | wc -l | tr -d ' ')):"
  echo '```'
  find hero_transparent -type f -exec basename {} \; 2>/dev/null | sort | head -25
  echo '```'
fi

# ---------------------------------------------------------------------------
say "5. Branches and un-pushed commits"

echo '```'
git branch -a -v 2>/dev/null | head -40
echo '```'

if git cat-file -e "${DEVICE_HEAD}^{commit}" 2>/dev/null; then
  echo
  echo "Commits here but NOT in $DEVICE_HEAD (marked '<' = unique to this disk):"
  echo '```'
  git log --oneline --left-right --cherry-mark "${DEVICE_HEAD}...HEAD" 2>/dev/null | head -40 || echo "(none)"
  echo '```'
fi

# ---------------------------------------------------------------------------
say "6. What to do next"

cat <<'NEXT'
Read HANDOVER-INDEX.md (in mpl-ph-s17-backend) for the cross-repo ordering, then
LAPTOP-HANDOVER.md section 3 for this repo. Short version:

  THIS MACHINE RESUMES AS PRIMARY. Harvest first, then fast-forward. Do not
  delete this clone, and do not pull before harvesting — a merge destroys the
  dirty files, stashes and un-pushed branches that are the only evidence of
  what was here, and no git operation recovers a gitignored file at all.

  Case A (clean + behind):
      Copy the section 4 items off this disk FIRST (hero_transparent/ before
      anything else — it has never been committed and exists nowhere else).
      Then:  git fetch origin && git merge --ff-only origin/main
      Do NOT copy this clone over the replacement laptop's.

  Case B (dirty, or commits not on GitHub) — from the REPLACEMENT laptop:
      git remote add oldlaptop /Volumes/OLD/path/to/mlbb-tool
      git fetch oldlaptop
      git log --oneline --left-right --cherry-mark HEAD...oldlaptop/main
      git diff --stat oldlaptop/main HEAD -- playerimage ph_playerimage teamlogo

      Uncommitted work does not travel via fetch. From THIS disk instead:
      git stash list ; git diff > ~/old-laptop-uncommitted.patch

  Case C (ahead on another branch):
      git branch -a -v ; git stash list

  Never resolve a binary asset conflict by taking the old side blindly. The
  replacement laptop's playerimage/ is the S18 set and is correct; this disk
  holds the superseded S17 bytes at those same paths.
NEXT

echo
echo "---"
echo "Report saved to: $REPORT"
