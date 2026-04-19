# Lancer — TODO

Active tasks and up-next items. Blocked/deferred work lives in BACKLOG.md.

---

## Next session — start here

**Shipped 2026-04-19 (alpha-testing branch):**
- Client context expansion in Step 4: client budget (over/under indicator in Step 5), payment schedule (single/50-50/milestones), tax/VAT % with breakdown in Step 5
- PocketBase `quotes` schema: 3 new fields (`client_budget`, `payment_schedule`, `tax_rate`)
- Dedicated tester account: `tester@lancer.local` / `1234567890` — tester mode auto-enabled on login
- v10.1 brief changes logged to BACKLOG (credit system, EA yearly-only, 12-month billing)

**Next priorities (all unblocked):**
- Clients screen (Basic+ gate) — new page, separate task
- Empty state + first-quote guided flow — onboarding polish
- Onboarding trim to 3 steps (currently 6)

**Active branches:**
- `main` — v10 corrections, status rename, history page (all shipped)
- `alpha-testing` — tester switcher + Cloudflare tunnel scripts

**To start an alpha session:**
1. Start PocketBase: `./pocketbase_0.36.9_windows_amd64/pocketbase.exe serve`
2. Start Next.js: `npm run dev`
3. Open tunnel: `npm run tunnel:app` (new terminal) — share the `*.trycloudflare.com` URL with testers
4. Update `.env.local` → `NEXT_PUBLIC_POCKETBASE_URL` if testers need PocketBase access through the tunnel

---

## Hosting

- **Switch Oracle Cloud → Hetzner Cloud CX22** — Oracle Cloud Free VM rejected in v10 (reclamation risk, no SLA). Hetzner CX22 recommended: €4.50/mo, 2 vCPU / 4GB, EU residency. Provision account + VM before deploy.

---

## Blocked (waiting on Lancer OÜ registration)

- Stripe integration + checkout page
- Resend.com email integration
- ANTHROPIC_API_KEY (needs separate API billing, not Claude subscription)
