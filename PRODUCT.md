# Product

<!-- impeccable:product-schema 1 -->

Scope: the **MLBB Live Tracker** app in this repo (`src/` → built `index.html`,
`api/`). The image asset library that shares this repo has no UI and is not
covered here.

## Platform

web

## Users

- **BOK — esports statistician / analyst desk.** Watches an MPL match live and
  reads the tracker to find the numbers behind the game: gold swings, lane
  matchups, item timings, kills and objectives, momentum.
- **Casters and desk talent.** Glance at it during the broadcast for a stat or
  matchup worth saying on air. A glance, not a study: the answer has to be
  readable in seconds while they are talking.

## Product Purpose

Show one live MLBB pro game as it happens, in depth, to the people who talk
about it. Success: during a live game, BOK or a caster can open the tracker at
any moment, see the whole game so far from 00:00, and pull a correct, citable
number without clicking around.

## Positioning

The only view that combines the official live game feed with the league's own
database: real player names, roster lanes, team logos and the full per-second
history recorded by the backend, for whichever league is chosen in the admin
panel. Sibling `local_postgame` is the broadcast-overlay side (OBS/vMix); this
tool is the hosted, password-protected analyst dashboard that can be used from
anywhere and sometimes feeds what goes to air.

## Operating Context

- Used live, during matchdays, under time pressure; often opened mid-game.
- Runs on a laptop at ~1366–1536 px wide, a 1920×1080 monitor, and sometimes a
  phone or tablet.
- Hosted on Vercel behind a password login. Data comes server-side from the
  Render backend (`mpl-ph-s17-backend`) and Moonton's official battle feed.
- League/season it follows is set in the Render admin panel
  (`// mlbb-tool league`); currently MPL PH S18.

## Capabilities and Constraints

- **Auto mode:** follows the live battle on its own (polls the backend every
  10 s); manual Fetch/Load override it.
- **Backfill:** opened mid-game, gold graphs, PvP compare, map positions and
  item timings start at 00:00 from the backend's per-second record; kills and
  objectives come from the official feed's own event list.
- Panels: team header and score, lane-pair player cards, team comparison,
  player rankings, minimap, gold-lead graphs (player and team), draft, PvP,
  gold distribution, map/death review with kill list, item progression, stats
  donut.
- **Identity:** players by roleid and teams by Moonton team_id, never by name
  (workspace `identity-rules.md`). Unknown player = in-game name + ⚠; roster
  player without a lane = "?".
- **Load on shared infrastructure:** one Moonton auth key is shared with the
  backend's collectors, so the tool must not add polling load.
- Source in `src/`, deployed `index.html` is generated and obfuscated
  (`BUILD.md`). Secrets stay server-side in Vercel env.
- Undecided: how much of the dashboard should work on a phone, vs. a reduced
  glance view.

## Brand Commitments

- Name: "MLBB Live Tracker by the BOK" / header "MLBB LIVE by the BOK".
- Team identity colours: camp 1 = blue, camp 2 = red, throughout.
- Team logos and player photos are self-hosted per era (Rule 5), never
  third-party hotlinks.

## Evidence on Hand

- Real league data via the backend: rosters, teams, logos, heroes, items, maps,
  per-second game history. Asset art in this repo (heroes, items, runes, maps,
  role icons).
- No user research, usage analytics or testimonials exist; do not invent them.

## Product Principles

1. **Correct before clever.** A wrong name, lane or number said on air is the
   worst failure; identity comes from IDs, and missing data is shown as missing.
2. **Readable at a glance, under pressure.** A caster mid-sentence must find the
   number in seconds.
3. **Whole game, whenever you open it.** Arriving late never means missing the
   story so far.
4. **Zero babysitting on matchday.** It finds and follows the live game itself;
   manual controls are an override, not the workflow.
5. **Light on shared infrastructure.** Never trade the backend's or Moonton's
   rate limits for UI refresh speed.

## Accessibility & Inclusion

No formal standard set. Practical floor from the use: text legible at a glance
on a laptop at venue lighting, and contrast that holds up on a second monitor.
