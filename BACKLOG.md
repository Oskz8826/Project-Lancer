# Lancer — Backlog

Items approved in concept but deferred. Organized by release milestone.

---

## Deferred — External Dependencies

- **Stripe integration** — subscription billing. Blocked on Lancer OÜ registration.
- **Resend.com email integration** — transactional email. Blocked on registration.
- **ANTHROPIC_API_KEY** — AI assist is fully built, just needs the key. Deferred until API billing set up.
- **Hetzner Cloud CX22 deploy** — VM provisioning + deployment. Deferred until closer to launch.

---

## v10.1 Brief Updates — Deferred (needs API key first)

Brief updated 2026-04-19. Three changes landed:

1. **Credit system rewrite (§4.3/4.4/5.5/13.3/Appendix B)** — model access: Basic=Haiku, Pro=Haiku+Sonnet, Max=all three. Credit ratio 1:3:15. Budgets 15/60/600 by tier. Pack sizes: Basic 15/€4, Pro 60/€10, Max 150/€15 (all TBD). Unified `ai_credit_balance` data model. When implementing: update `TIER_LIMITS` in `lib/constants.ts` and any model assignment logic.
2. **EA discount is yearly-only** — monthly always full price. Cancellation preserves EA status; only explicit surrender or full account deletion forfeits it permanently.
3. **12 months, not 14** — effective monthly prices: Basic €3.20, Pro €6.83, Max €17.28. Recalculate any hardcoded billing tables when Stripe goes live.

---

## Alpha Testing (deferred — no timeline yet)

Infrastructure built on the `alpha-testing` branch. Not merging to main until alpha is ready to launch.

- **Admin tester switcher** — floating pill (bottom-right) visible only to oskz.gameartist@gmail.com. Toggles `lancer_preview_as_tester` in localStorage; `useAuth` returns `tier:'tester'` override so all tier gates and AlphaBanner reflect tester view without touching PocketBase. Toggle off → real tier restored on reload.
- **Cloudflare Tunnel** — cloudflared 2025.8.1 installed at `C:\Program Files (x86)\cloudflared\`. Scripts in `package.json` on alpha branch: `npm run tunnel:app` (port 3000), `npm run tunnel:pb` (port 8090). Update `NEXT_PUBLIC_POCKETBASE_URL` in `.env.local` to the PB tunnel URL when sharing externally.

**To start an alpha session (once ready):**
1. Merge `alpha-testing` → `main`
2. Start PocketBase + Next.js
3. `npm run tunnel:app` → share the `*.trycloudflare.com` URL

---

## MVP — Not yet built

These are in-scope for the v1 MVP per the v10 brief but not yet implemented.

### Quote builder — multi-asset architecture (v10 §5.1)
Quotes are now containers with N line items. Each line item has its own discipline / asset type / complexity / hours / rate / usage rights / rush toggle.

**Schema change required:**
- New `quote_line_items` PocketBase collection (fields: quote_id, order_index, discipline, asset_type, complexity_tier, quantity, hours_per_unit, hourly_rate_eur, revisions, usage_rights, rush, computed_base_eur)
- Quote header remains; line items are children
- Quote totals = sum of all line items (low/mid/high)

**Builder change:** 5-step flow creates first line item; Step 5 gets "Add another asset" button (inline simplified form for subsequent items).
**Tier gate:** All tiers get multi-asset (it's part of the core builder, not a Pro feature).

### Quote status machine (v10 §12.2)
Full state machine replacing current draft/ready/sent/accepted/rejected/completed:

| Status | Notes |
|---|---|
| pending | Default on creation |
| accepted | Terminal — prompts "accepted at what amount?" |
| declined | Terminal |
| revised | Spawns child quote with parent_quote_id |
| superseded | Auto-set on parent when child reaches terminal |
| expired | Auto-set after 30 days pending |

Requires: `parent_quote_id` self-relation on quotes, `accepted_value` field, daily expiry cron job, revision flow UI.

**Current gap (noted 2026-04-19):** The "Revised" status is currently settable via the status dropdown in QuoteOverview, but there's no actual revision flow. Setting it manually is a workaround — there's no child quote spawned, no parent link, no continuity. When the status machine is implemented, the dropdown option for "Revised" should be replaced by a dedicated "Revise" button that triggers the child-quote flow. Until then, users manually marking quotes as Revised is misleading.

### Onboarding — trim to 3 steps (v10 §6.1)
Currently 6 steps. v10 specifies 3: (1) email + password, (2) role + discipline, (3) working currency. Location and additional skills collected at first-quote time, not blocking onboarding.

### Clients screen (v10 §7 screen 8, Basic+)
Client list with individual profile view, linked quotes, relationship tag (auto-suggests "Ongoing" at 3+ quotes), duplicate detection (fuzzy name + email match), email validation.

New `clients` PocketBase collection. `client_id` relation on quotes.

### Quote builder — Tax/VAT section (v10 §5.6)
Optional section, default OFF. Fields: "Include tax?" toggle, tax rate %, tax label (e.g. "VAT 20%"), "Reverse charge applies" toggle. Displayed as line in output + PDF. No jurisdiction logic — user enters own numbers.

### Quote builder — Payment schedule (v10 §5.7)
Optional section, default: single payment. Options: single / 50-50 split / custom milestones (N splits with % + trigger label). Reflected in PDF. Display-only, no invoicing.

### Empty state + first-quote guided flow (v10 §6.2)
Empty dashboard: primary "Create your first quote" CTA, widget placeholders with value copy ("Quote your first project to see your rate vs benchmark"), "Load sample data" option (3 example quotes, clearable). First-quote builder: modal walkthrough "Let's build your first quote in 60 seconds" with skip.

### Yearly billing toggle (v10 §4.1)
Pricing page and landing page need monthly/yearly billing toggle. Yearly prices: Basic €59/yr, Pro €126/yr, Max €319/yr.

### 14-day Pro trial (v10 §6.6)
Triggered for "Indie dev / studio" role at onboarding. No credit card. 14 days full Pro (no AI add-on). Day 7: reminder email + in-product banner. Day 14: reverts to Basic-lite. FingerprintJS abuse prevention (one trial per device + email, 6-month cooldown).

### Early Adopter program (v10 §4.5)
Time-limited (3 months post-launch). Yearly plans only. Y1: 35% off + 2 bonus months. Y2+: 15% off lifetime, continuous renewal required. Badge in-product. Lapse = forfeit rate permanently.

Schema: `users.early_adopter_cohort` (bool), `users.early_adopter_lock_date` (datetime), `users.early_adopter_status` (active/lapsed).

### AI top-up packs (v10 §4.3)
One-time purchases for extra AI quota beyond monthly included. Prices TBD (provisional: 10 Haiku €4 / 10 Sonnet €12 / 10 Opus €25). 60-day expiry. Auto-top-up optional (user sets monthly ceiling). Non-refundable.

Schema: new `ai_packs` collection. `users.ai_credit_balance` JSON field.

### Stripe Customer Portal (billing portal, v10 §7 screen 11)
Embed Stripe Customer Portal for: payment method management, invoice history, plan changes, cancellation. Paid tiers only.

### Stripe dunning flow (v10 §14.1)
Full failure recovery sequence: Day 0 fail → Smart Retries → Day 7 grace (AI locked, read-only) → Day 14 downgrade to Free. Triggered by Stripe webhooks.

### GDPR endpoints (v10 §15.2)
- `/account/export` — JSON bundle of user + quotes + line items + clients + AI history. Rate-limited 1/day.
- `/account/delete` — two-step confirmation, 30-day undo window, then hard purge.

### Background jobs / cron (v10 §13.2)
- Daily 02:00 UTC: currency rate refresh (ECB via frankfurter.app)
- Daily 03:00 UTC: quote expiry sweep (pending >30 days → expired)
- Daily 09:00 UTC: expiring-quote reminder emails (T-3 days, via Resend)
- Hourly: PocketBase snapshot to Backblaze B2

### Billing portal + subscription management (v10 §6.7)
Upgrade (immediate, prorated), downgrade (end of period, read-only), cancellation (30-day grace then archive), reactivation.

---

## V1.1 — Within 60 days of MVP launch

Per v10: MVP launches as private beta at €0. V1.1 ships within 60 days; public launch + Early Adopter pricing activates then.

- **Analytics screen** (Pro+) — quote volume chart, revenue trend, win rate, outcome breakdown, top 5 asset types, rate trend. Free/Basic see blurred preview + upgrade CTA.
- **Passive AI insights** — weekly cron, Haiku/Sonnet/Opus by tier. Requires 3–5 few-shot examples per insight type before shipping. Thumbs up/down feedback loop.
- **Auto top-up toggle** — UI for setting monthly AI pack ceiling and enabling auto-purchase.
- **Shareable OG-card** — "I charge 22% above the Northern Europe 3D char average — via Lancer." One-click from insight card.
- **Peer comparison benchmark** — activates at N=20 users per discipline/region segment. Anonymous, aggregated, opt-out.
- **Branded PDF template** (Max) — logo upload, signature, custom accent color. Depends on PDF template design being finalised first.

---

## V2+

- Budget estimator — studio side: full asset list builder, per-category breakdown, team size + timeline tools, outsourcing planner
- Max tier — multi-project tracking, 3 team seats (seat 4+: €15/mo), AI outsourcing analysis
- Revised quote UI — side-by-side diff, revision tree (parent_quote_id ships in MVP schema, UI deferred)
- User-selectable dashboard transition animation (Drift / Scale / Rise) in Settings
- Multi-discipline user profiles (Pro/Max) — `disciplines` JSON array replacing single `primary_discipline`
- Live market rate data replacing hardcoded benchmarks
- Full mobile quote creation
- REST API for studio integrations (Notion / Airtable / Harvest)
- Studio tier above Max (€89/mo, 10 seats, 300 AI req/mo)
- Expand disciplines + asset types

---

## Deferred — Design decisions pending

- **PDF template design** — standard (Basic/Pro) and branded (Max). Mock both before dev.
- **Passive insight prompts** — 3–5 few-shot examples per type (rate_alert, pattern, win_rate, market_update). Oskar to author.
- **AI eval dataset** — 20 client briefs across disciplines for weekly model eval. Oskar to author.
- **Resend email templates** — welcome, trial reminders, dunning sequence, expiry digest, weekly insights.
