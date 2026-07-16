# Graph Report - mlbb-tool  (2026-07-10)

## Corpus Check
- 15 files · ~69,757,197 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 82 nodes · 89 edges · 11 communities (9 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a9c12ecf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- main-config.js
- isAuthenticated
- build.js
- package.json
- login.js
- middleware.js
- sortPlayersByRoleSafe
- vercel.json
- Build & edit workflow
- CLAUDE.md — mlbb-tool (Shared Asset Repo + Tool App)

## God Nodes (most connected - your core abstractions)
1. `isAuthenticated()` - 10 edges
2. `Build & edit workflow` - 4 edges
3. `handler()` - 3 edges
4. `middleware()` - 3 edges
5. `sortPlayersByRoleSafe()` - 3 edges
6. `parseCookies()` - 2 edges
7. `handler()` - 2 edges
8. `handler()` - 2 edges
9. `passwordMatches()` - 2 edges
10. `isRateLimited()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `main()` --references--> `javascript-obfuscator`  [EXTRACTED]
  build.js → package.json
- `handler()` --calls--> `isAuthenticated()`  [EXTRACTED]
  api/items.js → api/_auth.js
- `handler()` --calls--> `isAuthenticated()`  [EXTRACTED]
  api/latestbattle.js → api/_auth.js
- `handler()` --calls--> `isAuthenticated()`  [EXTRACTED]
  api/mlbb.js → api/_auth.js
- `handler()` --calls--> `isAuthenticated()`  [EXTRACTED]
  api/verify.js → api/_auth.js

## Import Cycles
- None detected.

## Communities (11 total, 2 thin omitted)

### Community 0 - "main-config.js"
Cohesion: 0.07
Nodes (13): BOSS_SNAP_POINTS, CUSTOM_ICONS, DEFAULT_ACTIVE_TOWERS, GOLD_SOURCE_LABELS, HERO_DATA, ICON_SIZE_BASE, ITEM_DATA, milestones (+5 more)

### Community 1 - "isAuthenticated"
Cohesion: 0.35
Nodes (6): isAuthenticated(), parseCookies(), handler(), handler(), handler(), handler()

### Community 2 - "build.js"
Cohesion: 0.20
Nodes (8): __dirname, main(), OUT_HTML, REQUIRED_NAMES, SRC_CONFIG, SRC_HTML, devDependencies, javascript-obfuscator

### Community 3 - "package.json"
Cohesion: 0.25
Nodes (7): description, name, private, scripts, build, type, version

### Community 4 - "login.js"
Cohesion: 0.60
Nodes (4): attempts, handler(), isRateLimited(), passwordMatches()

### Community 5 - "middleware.js"
Cohesion: 0.60
Nodes (4): config, isValidSession(), middleware(), readSessionCookie()

### Community 6 - "sortPlayersByRoleSafe"
Cohesion: 0.67
Nodes (3): getPlayerRoleSafe(), ROLE_ORDER, sortPlayersByRoleSafe()

### Community 9 - "Build & edit workflow"
Cohesion: 0.40
Nodes (4): Before trusting a build in production, Build & edit workflow, Files, To make a change

## Knowledge Gaps
- **31 isolated node(s):** `attempts`, `__dirname`, `SRC_HTML`, `SRC_CONFIG`, `OUT_HTML` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `build.js` to `package.json`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `attempts`, `__dirname`, `SRC_HTML` to the rest of the system?**
  _31 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `main-config.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._