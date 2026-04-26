# Lancer — TODO

Active tasks and up-next items. Blocked/deferred work lives in BACKLOG.md.

---

## Frontend Rework — Major Priority (2026-04-23)

Design review by Claude Design (full review + self-review + design system proposal) confirmed the current frontend reads as "generic dark SaaS" — competent but rented. Diagnosis: the gap is brand identity + information density, not structure. Structural calls (dashboard, onboarding flow, builder primitive) are all correctly named in the v10 brief; the visual execution is the leak.

**Key insight from Claude Design's self-review:** *"A design system is not a deliverable. It's a starting point."* The brand work this product needs can't be produced by an AI in one pass — it needs a type designer, an illustrator, and a domain-vocabulary review with a real game dev.

**Evidence:** `Lancer Design Review _standalone_.html`, `Lancer Self-Review _standalone_.html`, `Lancer Design System _standalone_.html` in Oskar's Downloads. Extracted text dumps at `C:\Users\oskzg\lancer_review_extracted\`.

**Status:** active priority. Founder-time refactors + MVP cheap wins unblocked now. Specialist commissions pending budget approval (€2.8–4.5k external).

### Phase 1 — Cheap MVP wins (ship first, no external spend)
- **Tier badge component** — S/M/C/H, 3 sizes, saturated tier-indexed colour. Used on quote rows, PDF line items, pricing comparison, builder. 1 day of work. Single cheapest "built for game devs" signal in the whole system. *Do this one first.*
- **UI string domain pen pass** — "Add line item" → "Add deliverable," "Asset complexity" → "Asset tier," etc. Vocabulary borrowed from polycount / 80.lv / ArtStation. ½ day, founder + 1 game-dev friend.
- **Actionable confidence indicator** — replace decorative progress bar with "tighten by: [X]" affordance at every confidence state. ½ day.

### Phase 2 — Founder-time refactors (2–5 days each)
- **Type system install** — `next/font` load for display + UI + mono, expose via Tailwind 4 `@theme`, sweep `app/globals.css`.
- **Reduce orange to CTA + one data highlight per view** — audit every `#F25623` usage, demote decorative orange to white scale, add mid-greys (`#16161D`, `#1E1E27`, `#2A2A35`) for surfaces that currently lean on accent borders for hierarchy.
- **Tiered surface system** — full glass on marketing surfaces only (landing/pricing/login), solid `#131318` on container surfaces, `#16161D` on data surfaces. Kill starfield on working screens (dashboard/builder/history/settings).
- **Dashboard → quote ledger** — thin metric strip (64px, tabular mono, no cards) → "Needs attention" row (only if populated) → full sortable/filterable quote list. Current 4-metric-card dashboard optimises for a user phase that lasts two weeks.
- **Quote builder → single-page form + sticky live-estimate panel** — drop the 5-step wizard primitive. All fields visible at once. Live estimate updates on keystroke (150ms debounce). Multi-asset "+ Add deliverable" inline.
- **Onboarding: trim 6 steps to 3** (brief §6.1, separate line item under MVP — overlaps with this rework).
- **Settings: split single-form into 3 tabs** — Profile / Work defaults / Billing & AI. Credit ledger becomes its own first-class surface.
- **PDF export redesign** — currently generic. Needs wordmark header, tabular mono for all numbers, tier badges on line items, orange reserved for grand total only. Second theme (Studio vs Clean) considered.

### Phase 3 — Specialist spend (pending budget approval, ~€2.8–4.5k external)
- **Wordmark + display face** — commission a type designer. €1.5–3k for wordmark + monogram + favicon set. €200–800 for a licensed display face (GT Sectra, Söhne Breit, ABC Diatype Mono — *not* another free Google font like Fraunces or Instrument Serif, both reject-listed as "the 2024 Vercel-template starter pack"). 2 weeks calendar.
- **3–5 illustrative assets** — wireframe/blueprint style: landing hero, empty states, PDF cover, pricing-page tier-progression diagram. €800–1.5k from a 3D / concept illustrator (hire from the marketplace Lancer serves). 1 week.

**Realistic total: €2.8–4.5k external spend + ~3 days of founder time + ~3 weeks calendar.**

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

**Next session kickoff (2026-04-23):**
Start with **Frontend Rework — Phase 1** (see top of this file). Oskar confirmed this is the next thing to tackle. Sequence:
1. **Tier badge component** — cheapest win, 1 day. Ship this first.
2. **UI string domain pen pass** — ½ day.
3. **Actionable confidence indicator** — ½ day.

All three are founder-time, zero external spend, and unblock the Phase 2 refactors that follow. Design review evidence: `Lancer Design Review _standalone_.html`, `Lancer Self-Review _standalone_.html`, `Lancer Design System _standalone_.html` in Oskar's Downloads.

**Other open priorities (deprioritized behind rework Phase 1):**
- Clients screen (Basic+ gate) — new page, separate task
- Empty state + first-quote guided flow — overlaps with rework, consider folding into Phase 2
- Onboarding trim to 3 steps — now tracked inside Frontend Rework Phase 2

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
