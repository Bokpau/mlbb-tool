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

## Before 2026-08-24

Not backfilled. For earlier history: `git log --oneline`, and the frozen
`LAPTOP-HANDOVER.md` (with `mpl-ph-s17-backend/HANDOVER-INDEX.md` for the
cross-repo ordering).
