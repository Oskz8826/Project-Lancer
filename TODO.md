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

**Up next: M1 — Token foundation.** Replace `app/globals.css` `:root` with the full design-ref token set (8 colors + spacing 1–20 + radii xs–pill + shadow recipes). Map to Tailwind v4 `@theme inline`. Load Instrument Sans + JetBrains Mono via `next/font/google`. Mechanical sweep of hardcoded `#F25623` / `#0D0D12` / `#131318` literals → `var(--token)`. Read full M1 deliverables in plan file before starting.

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

---

## Hosting

- **Switch Oracle Cloud → Hetzner Cloud CX22** — Oracle Cloud Free VM rejected in v10 (reclamation risk, no SLA). Hetzner CX22 recommended: €4.50/mo, 2 vCPU / 4GB, EU residency. Provision account + VM before deploy.

---

## Blocked (waiting on Lancer OÜ registration)

- Stripe integration + checkout page
- Resend.com email integration
- ANTHROPIC_API_KEY (needs separate API billing, not Claude subscription)
