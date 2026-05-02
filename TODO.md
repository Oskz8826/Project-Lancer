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

**M0 complete.** ✓ Branch cut, tagged, backup, plan amended.

**Two threads to pick from:**

1. **Continue rebuild — M1 Token foundation.** Replace `app/globals.css` `:root` with the full design-ref token set (8 colors + spacing 1–20 + radii xs–pill + shadow recipes). Map to Tailwind v4 `@theme inline`. Load Instrument Sans + JetBrains Mono via `next/font/google`. Mechanical sweep of hardcoded `#F25623` / `#0D0D12` / `#131318` literals → `var(--token)`. Read full M1 deliverables in plan file before starting.
2. **Decide auth architecture split (raised 2026-05-02).** Current `users` mixes auth + Lancer-specific fields. See "Design decisions needed → Auth architecture split" below — three options A/B/C, lean is B.

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
- **Auth architecture split (raised 2026-05-02)** — `pb_schema.json` `users` collection mixes auth primitives with 7 Lancer-specific fields (`role`, `primary_discipline`, `additional_skills`, `working_currency`, `tier`, `ai_addon`, `quotes_used_this_month`). `region`/`country` are gray-area. Three options:
  - **A. Defer.** Keep `users` as-is. Migrate when product #2 actually needs shared auth. Zero work now, more pain later — but you'd know product #2's needs by then.
  - **B. Split now, single PocketBase.** Restructure into `users` (NordBit-level auth) + new `lancer_profiles` (relation to `users.id`) inside same Zone.ee VPS PB. Future products add `*_profiles` collections.
  - **C. Split now, separate auth service.** Stand up `auth.nordbit.ee` (PB or otherwise), Lancer reads via API/JWT. Heaviest lift, cleanest separation.
  - **Lean:** B — Lancer is currently the only product needing user auth (NordBit site has none, RTS has no auth surface yet), but splitting *before* Stripe + paying users land costs less than after. A is defensible if M1+ ships first. Decision pending.

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
