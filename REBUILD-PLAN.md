# REBUILD-PLAN.md — Lancer Frontend Rebuild

**Status:** Planning phase. Q3 (design direction) and Q4 (NordBit carry-over) open.
**Created:** 2026-04-26
**Branch (when created):** `frontend-rebuild` off `main`
**Dev port:** `:3001` (parallel to main `:3000`)
**Note:** active branch at planning time was `alpha-testing` — switch to `main` before cutting `frontend-rebuild`.

---

## Context

Full clean-slate rebuild of the Lancer frontend, starting from the home page and building outward one page at a time. Backend (PocketBase) stays wired throughout. Desktop-first; mobile/tablet rebuild deferred. No deadline — quality over speed, with explicit milestones per phase.

Lancer is a product of NordBit and will live on a NordBit subdomain (e.g. `lancer.nordbit.com`). The two sites need a UX transition story — currently undefined, flagged for design phase below.

---

## Locked Decisions

- **Approach:** clean-slate, one page at a time, home page first, iterate until each page feels right before moving on
- **Branch base:** `main` (NOT `alpha-testing`)
- **Branch name:** `frontend-rebuild`
- **Dev port:** `:3001`
- **Responsive:** desktop first, mobile/tablet later
- **Alpha integration strategy:** rebuild alpha-testing's features fresh on the new frontend AFTER the rebuild merges into main. NO merge of alpha's frontend code into the rebuild branch.
- **Backend:** PocketBase stays connected throughout. Some backend changes possible during rebuild — handle as they surface.
- **No deadline.** Detailed plan with named milestones required before execution.

---

## Open Decisions

### Q3 — Design direction
Evolve current Lancer aesthetic vs introduce a new visual language. Constraint: don't lose what works in current Lancer. Resolution path: visual exploration via Claude desktop chat artifact mockups (Claude design is rate-maxed — using regular chat).

### Q4 — NordBit carry-over tier
How much of NordBit's design DNA Lancer should adopt:
- **Tier 1** — Light touch (color + font only shared)
- **Tier 2** — Family resemblance (tokens, type scale, motion, core component patterns shared)
- **Tier 3** — Full alignment (NordBit identity 1:1, product-surface variation only)

Custom blend allowed — outcome of mockup exercise will likely be a hybrid grounded in preserve/improve lists.

---

## NordBit-Lancer Connection (TBD)

Lancer is a subdomain of NordBit — both projects need to be aware of this relationship. The user transition between `nordbit.com` and `lancer.nordbit.com` is currently undefined. Design considerations:

- Auth/session handoff (single sign-on across subdomains?)
- Visual continuity (TBD by Q4 outcome)
- Navigation between sites (top-bar link? "Back to NordBit" affordance? Subdomain switcher?)
- Shared elements (logo placement, footer, legal pages)

This work is part of the rebuild planning phase. Not blocking the home page rebuild itself, but must be defined before global nav/footer get built.

---

## Existing Design Reference Artifacts

Two large standalone HTML design references exist or are planned. Both are direct inputs to the design audit step.

- **Lancer Design Reference v1** — `C:\Users\oskzg\Downloads\NEW_Lancer_Design_Reference_v1.html` (~107KB, dated 2026-04-25). Comprehensive single-page reference: dark/glassmorphic visual language, starfield, orange CTAs, full token set, component inventory. **Authoritative Lancer design ground truth** — read in full during audit before extracting anything from source code.
- **NordBit Design Reference v1** — planned at `C:\Users\oskzg\Downloads\NEW_NordBit_Design_Reference_v1.html`, mirrors the Lancer ref's structure but in NordBit's blueprint / dark+light dual-mode language. Plan file: `C:\Users\oskzg\.claude\plans\lazy-singing-eclipse.md` (active, output not yet generated). When this ref ships, it pairs with the Lancer ref for tier-mockup parity in Q4.

The Lancer ref makes the Lancer-side audit drastically faster — read once, summarize, paste into the Claude desktop prompt. NordBit-side: either wait for the NordBit ref or extract from source code per NordBit memory's source-of-truth hierarchy (`brand/design-share/project/NordBit Website.html` is authoritative).

---

## Sequence

1. **Cortana runs the design audit** — read-only across:
   - Lancer design foundation (CSS tokens, color palette, typography, spacing, motion, component patterns)
   - NordBit design foundation (same layers)
   - Prior design references (`design-share/`, `brand/`, `tool-results/webfetch-*.bin`, project-adjacent HTMLs)
2. **Oskar fills in 6 preference inputs** (see template below)
3. **Oskar runs the Claude desktop prompt** for three Tier mockups + custom blend recommendation
4. **Q3/Q4 decided** from mockup output + Oskar's read
5. **Cortana writes the full implementation plan** with named milestones per rebuild phase
6. **Branch + execute** — create `frontend-rebuild` from `main`, build page by page

---

## Claude Desktop Prompt Template

For Oskar to paste into regular Claude chat (NOT `/design` — rate-maxed). Fill every `<<placeholder>>` first.

```
I'm rebuilding the frontend of Lancer — <<short product description: 1-2 lines on what Lancer is, who uses it, what it does for them>>. Lancer lives on a subdomain of its parent brand NordBit. I need to see what different design-alignment options actually look like on real Lancer content so I can pick one.

CURRENT LANCER DESIGN FOUNDATION:
<<paste Cortana audit: Lancer section>>

NORDBIT DESIGN FOUNDATION:
<<paste Cortana audit: NordBit section>>

PREVIOUS DESIGN REFERENCES:
<<paste Cortana audit: prior prototype HTML summary + links if any>>

WHAT TO PRESERVE FROM CURRENT LANCER:
- <<preserve list>>

WHAT TO IMPROVE:
- <<pain points>>

INSPIRATION:
- <<refs>>

NORDBIT-CONNECTION STRENGTH:
On a 1-10 scale, I want Lancer to read as NordBit: <<your number>>. (1 = fully standalone product, 10 = seamless extension of NordBit.)

Generate three HTML artifacts showing the SAME Lancer home/landing page rendered three ways:

TIER 1 — Light touch: Lancer keeps its own identity; shares only color palette + font family with NordBit.
TIER 2 — Family resemblance: Shared tokens, typography scale, motion, core component patterns. Lancer has its own personality but reads as a NordBit product.
TIER 3 — Full alignment: Lancer wears NordBit's visual identity 1:1, only product-surface variation.

Each home page should pack enough surface to show design language clearly:
- Top nav (logo, 3-4 nav links, login/CTA button)
- Hero (headline, sub, primary CTA, visual/illustration placeholder)
- 3 feature cards
- Secondary CTA band with button
- Footer with link columns

Same content across all three; only visual language differs. Label each artifact TIER 1 / TIER 2 / TIER 3 clearly.

After showing all three, give me a short honest read:
1. Which tier best preserves what I wanted to keep
2. Which best fixes what's bugging me
3. Which feels most natural as a NordBit subdomain product given my 1-10 score
4. If none are exactly right, propose a custom blend — e.g. "Tier 2's color system + Tier 1's typography, keeping Lancer's current heading style" — grounded in the preserve/improve lists.
```

---

## Inputs Required

### Oskar provides (6 inputs)
1. **Short product description** — 1-2 lines. Candidate source: `Lancer_Product_Brief_v10.md` (untracked, in repo root).
2. **Preserve list** — specific UI elements/patterns/feelings from current Lancer to keep
3. **Pain points** — specific design issues to fix
4. **Inspiration refs** — 2-3 products/sites for direction
5. **NordBit-connection score** — 1-10
6. **Sanity scan** — eyeball filled-in prompt before paste

### Cortana provides (3 inputs, from audit)
1. Lancer design foundation summary
2. NordBit design foundation summary
3. Prior design references summary

---

## Open Items at Session Pause

- [ ] Cortana runs the design audit (greenlit, not yet executed)
- [ ] Oskar fills in 6 preference inputs
- [ ] Oskar runs Claude desktop prompt for Tier mockups
- [ ] Q3/Q4 resolved
- [ ] Full implementation plan with named milestones authored
- [ ] `frontend-rebuild` branch created from `main`
- [ ] NordBit-Lancer transition UX defined

---

## Alpha Features Pending Re-build

After `frontend-rebuild` merges into `main`, these features (currently on `alpha-testing`) need to be rebuilt fresh on the new frontend:

- Quote builder — client context expansion (step 4)
- Dedicated tester account with auto-enabled preview mode
- Status bar redesign + draft badge + alpha session timer
- Page transition fixes (defer panel open by one frame)
- Builder open-on-`?new=1` behavior
- "New quote" button navigation flow
- AI addon "Coming soon" state
- Alpha testing deployment procedure (already in CLAUDE.md)

Not exhaustive — re-audit `alpha-testing` log before rebuild Phase 2 begins.

---

## Reference

- Active branch at plan time: `alpha-testing` (uncommitted: `BACKLOG.md`, `TODO.md`, `.rune/metrics/*`)
- Branches available: `alpha-testing`, `feature/page-transitions`, `main` (all mirrored to origin)
- Lancer Product Brief v10: untracked, repo root — reference for product description placeholder
