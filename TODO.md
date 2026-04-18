# Lancer — TODO

Active tasks and up-next items. Blocked/deferred work lives in BACKLOG.md.

---

## Next session — start here

All previous TODO items completed 2026-04-19. See BACKLOG.md for V2+ work.

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
