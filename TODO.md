# Lancer — TODO

Active tasks and up-next items. Blocked/deferred work lives in BACKLOG.md.

---

## Next session — start here

- **Admin tester switcher** — floating button on `alpha-testing` branch so Oskar can preview tester experience without changing his PocketBase tier. Build on branch, not main.
- **Code corrections (v10)** — knock out the four items below; all are small targeted fixes, start with free tier quota (one line)
- **Cloudflare Tunnel** — coordinate with Oskar each session alpha opens. Port 3000 (Next.js) + port 8090 (PocketBase). Setup docs in next session.

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
