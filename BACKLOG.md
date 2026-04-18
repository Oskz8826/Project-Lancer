# Lancer — Backlog

Items approved in concept but deferred — either gated by external dependencies or scoped to V2+.

---

## Deferred — External Dependencies

- **Stripe integration** — subscription billing. Blocked on Lancer OÜ company registration.
- **Resend.com email integration** — transactional email (welcome, quote saved, etc.). Blocked on company registration.
- **ANTHROPIC_API_KEY** — AI assist is fully built, just needs the key. Deferred until API billing is set up separately from Claude subscription.

---

## V2 Features

### Multi-Asset Quotes (Pro/Max tier)
Allow Pro/Max users to bundle multiple assets into a single quote — one quote per client engagement instead of one per asset.

**Why deferred:** Requires a relational `quote_items` collection (proper data model, not JSON array). Significant schema change + builder rework.

**Agreed approach:**
- New `quote_items` PocketBase collection linked to `quotes` via relation
- First asset built through normal 5-step flow as today
- Pro/Max users get "+ Add asset" on Step 5 — simplified inline form (discipline, asset type, hours, rate)
- Final price = sum of all line items; breakdown shows each item separately
- QuoteOverview upgraded to show line-item list
- Quota counter increments once per quote (not per asset)
- **Tier gate:** Pro + Max only. Free/Basic = single asset per quote.

### Multi-Discipline User Profiles (Pro/Max tier)
Allow Pro/Max users to set multiple primary disciplines on their profile. Currently a single `primary_discipline` field. V2 would allow an array of disciplines, pre-filling the quote builder discipline selector with all their active disciplines.
Schema change: `primary_discipline` (text) → `disciplines` (JSON array or relation).
**Tier gate:** Pro + Max only.

### User-Selectable Dashboard Transition Style (Settings)
Allow users to pick their preferred dashboard tab transition animation from the Settings page. Three options: Drift (fade, current default), Scale (opacity + scale spring), Rise (opacity + upward slide spring). Store preference in PocketBase user record or localStorage.

### PDF Builder (Pro/Max tier)
Allow higher-tier users to customise the quote PDF template — upload their own logo, add a signature, and optionally set a custom accent color. Free/Basic get the default Lancer template. Exact tier gate TBD.

**Why deferred:** PDF template design not finalised yet. Builder UI + PocketBase file storage for logo/signature needed. Depends on settling on a PDF template first.

### Other V2+
- Budget estimator — studio side, estimate full project cost across multiple assets/contractors
- Team seats
- AI budget analysis
- Live rate data (replace static benchmarks)
- Mobile optimization
