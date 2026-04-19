# Lancer — TODO

Active tasks and up-next items. Blocked/deferred work lives in BACKLOG.md.

---

## Next session — start here

**Shipped 2026-04-19 (this session):**
- Quote status bars: 6→4 segments, draft detection (gray), superseded purple (#a78bfa)
- Status legend `?` button (left of sort dropdown) with all 7 states explained
- Draft badge: shows "Draft" in gray instead of "Pending" in yellow on list + panel
- Revised flow gap logged to BACKLOG under "Quote status machine"
- Alpha session countdown timer: PocketBase-backed (`alpha_session` collection, record `kewmwjn3tdlq465`), realtime sync across all connected clients
- Timer admin-gated: only `oskz.gameartist@gmail.com` can set/reset
- Auto-logout: non-admin testers kicked to `/login` when timer expires
- Suspense boundary added to quotes page (required for production build)
- Ask me "start alpha test, X hours/minutes" — I handle PB timer + give credentials

**Next priorities (all unblocked):**
- Clients screen (Basic+ gate) — new page, separate task
- Empty state + first-quote guided flow — onboarding polish
- Onboarding trim to 3 steps (currently 6)

**Active branches:**
- `main` — v10 corrections, status rename, history page (all shipped)
- `alpha-testing` — tester switcher + Cloudflare tunnel scripts + countdown timer

**To start an alpha session (correct procedure):**
1. Start PocketBase: `./pocketbase_0.36.9_windows_amd64/pocketbase.exe serve`
2. Start PB tunnel: `npm run tunnel:pb` — grab the `*.trycloudflare.com` URL
3. Update `.env.local` → `NEXT_PUBLIC_POCKETBASE_URL=https://<pb-tunnel-url>`
4. Build: `npm run build`
5. Start prod server: `npm start`
6. Start app tunnel: `npm run tunnel:app` — share this URL with testers
7. Ask Cortana to set the timer: "start alpha test, X minutes"
8. **After session:** revert `.env.local` back to `http://127.0.0.1:8090`

---

## Hosting

- **Switch Oracle Cloud → Hetzner Cloud CX22** — Oracle Cloud Free VM rejected in v10 (reclamation risk, no SLA). Hetzner CX22 recommended: €4.50/mo, 2 vCPU / 4GB, EU residency. Provision account + VM before deploy.

---

## Blocked (waiting on Lancer OÜ registration)

- Stripe integration + checkout page
- Resend.com email integration
- ANTHROPIC_API_KEY (needs separate API billing, not Claude subscription)
