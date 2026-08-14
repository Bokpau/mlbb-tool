# Plan — Era-correct PH player photos (`ph_playerimage`)

**Goal:** the MPL PH site shows each player wearing the jersey they actually wore that
season, instead of their current-season photo on every historical surface.

**Status:** assets staged, no code reads them yet. Nothing is live.

---

## 1. Verified current state

| Path | Contents |
|---|---|
| `mlbb-tool/playerimage/` | 67 S18 photos + `default.png` (68 PNG) |
| `mlbb-tool/ph_playerimage/` | 69 `*_FRONT_s17.png` + `default.png` (70 PNG) |
| `mlbb-tool/_raw/s18/` | 68 uncropped masters, gitignored |

- Photo resolution today: [`mpl-ph-s17/lib/images.js:45`](../mpl-ph-s17/lib/images.js) →
  `img.player(name)` → `mlbb-tool@main/playerimage/{name}_FRONT.png`. Season is not
  an input.
- Exactly **one** caller: `PlayerImg` in
  [`components/Images.js:62`](../mpl-ph-s17/components/Images.js). ~20 `<PlayerImg>`
  render sites across `app/`.
- `ph_playerimage` has **zero consumers** — confirmed by grep across all projects.

**Consequence right now:** the 31 S17-only players (`Ch4knu`, `Kielvj`, `Aqua`,
`Bonchan`, `3Mar`, …) 404 on `playerimage/` and fall through to `default.png`.
Historical pages lost their photos the moment S18 replaced the folder.

---

## 2. Rules this must obey

From [`mpl-ph-s17/identity-rules.md`](../mpl-ph-s17/identity-rules.md) — mandatory,
and CLAUDE.md requires following it:

- **Rule 5 — Logos/photos are per era**, keyed by `(tournament_id, season, team_key)`,
  self-hosted in `mlbb-tool` only, and **stored as data in the DB**, not derived in
  component code.
- **Rule 3 — Rebrands are added with data, not code.** No `CASE` statements, no
  hardcoded season branches in a resolver.
- **Rule 2 — Player identity is `player_key`**, stable across IGN changes. Name
  aliases are season-scoped `(tournament_id, season, ign)`.

The team-logo work (commit `623bc08`) is the direct precedent and its lesson applies
verbatim: deriving a filename from an identity code alone **flattens genuinely
different per-season images onto one asset** and silently renders the wrong season's
branding. It needed one asset per *season*, not per code.

---

## 3. Naming convention — RESOLVED

Era assets in this repo use a **lowercase `_s{N}` suffix**:

```
teamlogo/apbr_s12.png      teamlogo/echo_s8.png      teamlogo/aura_ph_s6.png
```

The archive originally used an `S17_` **prefix**. It was renamed to match the
teamlogo convention before anything referenced it:

```
S17_Aeon_FRONT.png   ->   Aeon_FRONT_s17.png
```

All 69 files renamed, content verified byte-identical. `default.png` deliberately
keeps its plain name. The directory is **`ph_playerimage`** — all lowercase, matching
`playerimage`, `teamlogo`, `intl_teamlogo`. This matters because GitHub and jsDelivr
are case-sensitive while macOS is not, so the committed case is the permanent one.

Still to adopt from the teamlogo precedent: the `first_season` idea — when a player
wears the same kit across consecutive seasons, **one file covers the range** rather
than duplicating it per season.

---

## 4. Scope reality check

Era-correct is currently only **partially achievable**:

- Photos exist for **S17 and S18 only**.
- **S6–S16 have no player photos at all** — those surfaces will keep falling back
  regardless of what is built here.

So this work makes S17 surfaces correct and establishes the mechanism; it does not
make all history era-correct. Worth deciding whether that justifies the DB-backed
approach now or an interim one.

---

## 5. Two implementation paths

### Path A — DB-backed (matches Rule 5, recommended)

Store the resolved photo URL per `(tournament_id, season, player_key)`, exactly as
`team_logo_dark` works for logos.

1. Add a `player_photo` column to the player-era table / view (backend repo).
2. Seed it with a `repoint_player_photos_ph.sql`, matched on `(season, ign)` —
   **not** `player_key`, whose seed values predate franchise merges (same caveat the
   teamlogo seed documents).
3. Extend `resolvePlayer(row, mode)` in
   [`lib/identity.js`](../mpl-ph-s17/lib/identity.js) to return `photo` +
   `fallbackPhoto` alongside `name`, mirroring `resolveTeam`'s
   `logo` / `fallbackLogo` shape.
4. `PlayerImg` takes `photo`/`fallback` props instead of calling `img.player(name)`.
5. `img.player()` stays as the CDN fallback, deliberately **not** the stored value —
   same as unsuffixed `teamlogo/{era_slug}.png`.

*Pros:* rule-compliant, handles IGN changes through existing alias data, no code change
per season. *Cons:* touches backend + SQL + ~20 render sites.

### Path B — Code-derived path (interim)

`img.player(name, season)` builds `ph_playerimage/{name}_FRONT_s{season}.png` with a
fallback chain to `playerimage/` then `default.png`.

*Pros:* one file changed, ships in an afternoon. *Cons:* conflicts with Rule 3
("data, not code"), and repeats the exact mistake the teamlogo commit fixed as soon as
a player's photo changes mid-run. **Treat as a stopgap with a follow-up ticket, not
the destination.**

---

## 6. Open questions (blocking Path A)

1. **Where does `season` reach `PlayerImg`?** `identityMode(context, season)` already
   exists, but the ~20 render sites pass only `name` and `roleid`. Do rows already
   carry `season`, or does it come from the page route / a context provider?
2. **Which table owns player-era rows** in `mpl-ph-s17-backend`, and is there an
   existing `player_era`-style table to add the column to?
3. **`image_name` field** — `app/history/*` pages already pass `r.image_name` to
   `PlayerImg` rather than `player_name`. Is that already an intended photo-identity
   field? If so it may be the right column to extend instead of adding a new one.

---

## 7. Cleanups to fold in

- **Normalizer mismatch.** `mpl-ph-s17` uses the raw trimmed name
  (`encodeURIComponent(name.trim())`); `post_game` uses
  `photoName()` = strip whitespace, keep `[a-zA-Z0-9._]`. The same player can resolve
  to two different filenames depending on which project renders them. Pick one and
  document it.
- ~~IGN changes.~~ **RESOLVED as data** (handled in `mpl-ph-s17-backend`, alongside
  its `IDENTITY-RESOLVER-PLAN.md` and the `fix_*_alias.sql` / `rollback_*` pattern).
  `playerimage/` is S18-only, so no duplicate files remain.

  Note the archive deliberately keeps the **era** IGN in the filename —
  `Perkziva_FRONT_s17.png`, `Wurahhhh_FRONT_s17.png`, `Domengkite_FRONT_s17.png`,
  `Raizen._FRONT_s17.png`, `Daiki__FRONT_s17.png`, `Eson_FRONT_s17.png`. That is
  correct under Rule 5: an S17 asset is keyed by the name that player used in S17, and
  the alias rows resolve `player_key` → era IGN → filename. **Do not rename these to
  the S18 IGNs** — doing so would break the era lookup it exists to serve.
- ~~`MasterTheBasics` has no usable filename.~~ **RESOLVED.** The two files were
  genuinely different takes (21% of pixels differ), not duplicates. `_FRONT_1` was
  promoted to `MasterTheBasics_FRONT.png`; `_FRONT_2` was dropped from
  `playerimage/`. Both masters remain in `_raw/s18/`, so the other take can be
  re-cropped at any time.
- ~~Junk `(1)` files in the archive.~~ **Not junk** — `COACH.BLUFFZY_FRONT(1)_s17.png`
  and `Eson_FRONT(1)_s17.png` were byte-compared against their twins and are
  **different images**, so both were kept.
- **Normalizer note:** two files carry a case that differs from what a strict
  `photoName()` would produce (`shizou`, `Dexstar`, `Sn4p`, `Haze`,
  `MasterTheBasics`). Existing casing was deliberately preserved so the CDN replaces
  rather than duplicates. Any new resolver must match on the stored filename, not a
  freshly-derived one.

---

## 8. Suggested order

1. ~~Settle the naming convention and rename the staged files.~~ **Done** (§3).
2. ~~Fix `MasterTheBasics`.~~ **Done** (§7).
3. Commit + push assets so jsDelivr can serve them; check the CDN pin scheme and the
   purge step in the auto-export workflow. **Until this happens every URL in
   `mpl_ph_s18_playerimage.csv` 404s.**
4. Answer the three questions in §6.
5. Decide the IGN-change mapping (§7) — alias rows, not files.
6. Implement Path A (or Path B with a follow-up ticket).
7. Backfill earlier seasons only if/when photos are sourced.

---

## 9. Risks

- **Renaming after the first push is a breaking change** — the repo rule exists because
  a rename takes down live broadcast graphics. Do it before, not after.
- **`playerimage/` is the shared fallback for four projects** (`mpl-ph-s17`,
  `post_game`, `postgame-ssr`, `local_postgame` via symlink). It is not PH-specific;
  changes there are not scoped to the PH site.
- **jsDelivr caches by tag/commit** — assets need a commit + push before any consumer
  can read them, and stale pins will not pick them up.
