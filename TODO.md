# Lancer — TODO

Active tasks and up-next items. Blocked/deferred work lives in BACKLOG.md.

---

## Frontend rebuild — in progress

**Branch:** `frontend-rebuild` (cut from `main` 2026-04-26, tag `pre-frontend-rebuild` marks the cut point)
**Dev port:** `:3001` (parallel to old frontend on `:3000`)
**Plan file:** `~/.claude/plans/hey-cortana-joyful-token.md` — 16 milestones (M0–M15), iteration gate between each.
**Meta-plan:** [REBUILD-PLAN.md](REBUILD-PLAN.md) on `alpha-testing` — locked decisions, alpha integration strategy.
**Backup:** `D:/0. Claude Projects/_backups/lancer-pre-frontend-rebuild-2026-04-26/` — pb_data + .env.local snapshot.

### Next session — start here

**Auth split RESOLVED 2026-05-08** — committed to a NordBit ID account system at `id.nordbit.ee` (Astro + PocketBase native auth + apex cookie session sharing across `*.nordbit.ee`). 10-decision gating set locked, 8-phase build sequenced. **Master plan:** `~/.claude/plans/bubbly-gliding-planet.md`. **Schema split design:** `docs/schema-split.md` (this repo). Phase 1 (NordBit token gap-fill + schema split design) and Phase 2 (account app scaffold at `D:/0. Claude Projects/5. NordBitID/`) shipped 2026-05-08. Phase 6 of that plan is Lancer's M1 + brand pivot — absorbs the queued M1 work below into a shared NordBit token system.

**M0 complete.** ✓ Branch cut, tagged, backup, plan amended.

**Two threads to pick from:**

1. **Continue NordBit Account System — Phase 3 onboarding flows.** Six pixel-faithful screens against the V2 split layout from `C:/Users/oskzg/nordbit_handoff/design_handoff_account_system/`. Forces OAuth callback URL setup in Google + Discord consoles. Build lives at `D:/0. Claude Projects/5. NordBitID/`.
2. **Continue Lancer rebuild — M1 / Phase 6.** Now folded into Phase 6 of the master plan — replaces `app/globals.css` `:root` with the SHARED NordBit token system (light + dark) instead of the original Lancer-specific token set. Chrome adopts `--accent` (NordBit blue); orange demoted to product-scoped surfaces. Read Phase 6 in the master plan for full deliverables. M1's original plan file at `~/.claude/plans/hey-cortana-joyful-token.md` remains valid for the mechanics; the master plan governs the brand direction.

### Branch protocol

- Every milestone has an iteration gate — Oskar reviews before next milestone starts.
- `alpha-testing` keeps running on `:3000` for live tester sessions throughout the rebuild — its frontend features get rebuilt fresh on the new frontend after `frontend-rebuild` merges to main.
- v10 backend corrections below (free tier quota, rush multiplier, usage rights, AI confidence) are independent of the frontend rebuild and should land on `main` or `alpha-testing` directly when addressed — NOT in the rebuild branch.

---

## Code corrections (v10 discrepancies — fix before alpha)

These are gaps between the current build and what v10 specifies. Small, targeted fixes.

- **Free tier quota** — `lib/constants.ts` TIER_LIMITS has `quotes_per_month: 3`, v10 says **10**
- **Rush multiplier** — v10 specifies +30% flat. Verify against `lib/benchmarks.ts` (may already be correct)
- **Usage rights multipliers** — v10: Indie ×1.3, Commercial ×1.8, AAA ×2.5. Verify these match the benchmarks file
- **AI confidence — rule-based** — v10 says compute confidence in app logic, not from Claude output. Strip `confidence` and `confidence_reason` from AI prompt; compute server-side: High (all fields specific + benchmark match) / Medium (one ambiguity) / Low (multiple nulls or vague)

---

## Design decisions needed (before building)

- **History page** — placeholder at `/dashboard/history`. v10 §7 says: saved quotes + estimates, status tags, client filter, date filter, sort, expiring-quote highlight. Needs design sign-off before building.
- **Quote status rename** — v10 changes status names entirely: `pending / accepted / declined / revised / superseded / expired` (currently `draft / ready / sent / accepted / rejected / completed`). This touches the DB schema, QuoteOverview, quotes page, and history. Decide when to migrate.
- **Auth architecture split — RESOLVED 2026-05-08.** Committed to a separate NordBit ID surface at `id.nordbit.ee` (essentially Option C from the original A/B/C, with PocketBase native auth on the existing Zone.ee VPS — no new vendor, no new bill). Schema split design: `docs/schema-split.md`. Master plan: `~/.claude/plans/bubbly-gliding-planet.md` (10 gating decisions locked, 8 phases). Cutover holds until `frontend-rebuild` merges per Q8.

---

## Hosting (locked 2026-04-27 — Option B, all-Estonian backend)

- **Domain:** `nordbit.ee` registered at Zone.ee (single domain — Lancer is a subdomain, no separate `lancer.ee`).
- **DNS:** managed at Cloudflare (free, proxy + DDoS as bonus).
- **Frontend:** Cloudflare Pages → `lancer.nordbit.ee`. Next.js via `@cloudflare/next-on-pages` adapter — API routes constrained to edge runtime.
- **Backend:** Zone.ee VPS → `api.lancer.nordbit.ee`. Runs PocketBase Go binary + SQLite.
- **Cost:** ~€11/mo total (€1/mo amortized domain + €10/mo VPS).
- **Override note:** prior plan was Hetzner Cloud CX22 (€4.50/mo). Switched to Zone.ee VPS for Estonian infrastructure / locality story (+€5/mo accepted). Oracle Cloud Free VM was rejected earlier (reclamation risk, no SLA).

---

## Blocked (waiting on NordBit OÜ registration)

- Stripe integration + checkout page
- Resend.com email integration
- ANTHROPIC_API_KEY (needs separate API billing, not Claude subscription)
- Hosting account ownership transfer (currently personal → NordBit OÜ for tax deductibility + VAT reclaim)
