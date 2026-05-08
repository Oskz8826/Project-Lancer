# PocketBase schema split — NordBit ID

**Status:** Design only. Not yet applied to dev or prod PB.
**Trigger:** Apply when Phase 4 of the NordBit Account System build (`~/.claude/plans/bubbly-gliding-planet.md`) starts — at that point we need a real schema to back the `/api/me` surface.
**Cutover:** Production application happens at `frontend-rebuild` → `main` merge per Q8.

## Why

Current `users` collection on PocketBase mixes NordBit-level identity (auth, name, region, timezone) with seven Lancer-specific fields. The NordBit Account System design assumes shared identity across products. Schema split moves Lancer fields into a dedicated `lancer_profiles` collection so future products can add their own `*_profiles` against the same `users.id`.

## Current state (read 2026-05-08)

Source: `pocketbase_0.36.9_windows_amd64/pb_migrations/1776347043_updated_users.js` plus `pb_schema.json`. Live PB is at Zone.ee VPS (`api.lancer.nordbit.ee`); local dev PB at `127.0.0.1:8090`.

Fields on `users` today (collection ID: `_pb_users_auth_`, type: `auth`):
- *(built-in:* `id`, `email`, `password`, `verified`, `created`, `updated`, etc.)
- `name` — text
- `role` — select: `freelancer`, `studio`
- `primary_discipline` — select: 11 values (`3d_hard_surface`, `3d_character`, `2d_concept_art`, `environment_art`, `vfx_technical`, `ui_ux`, `2d_animation`, `3d_animation`, `game_design`, `development`, `sound_design`)
- `additional_skills` — json
- `region` — text
- `country` — text
- `working_currency` — select: `EUR`, `GBP`, `USD`
- `tier` — select: `free`, `basic`, `pro`, `max`
- `ai_addon` — bool
- `quotes_used_this_month` — number (in `pb_schema.json`; not in inspected migration — verify against live PB before applying)

## Target state

### `users` (slim, NordBit-level)
| Field | Type | Required | Notes |
|---|---|---|---|
| *(built-in)* `id`, `email`, `password`, `verified`, `created`, `updated` | — | — | Standard auth-collection fields |
| `firstName` | text | Yes (new signups) | Onboarding wizard collects |
| `lastName` | text | No (optional during migration; required UX-side at profile edit) | |
| `displayName` | text | No | Optional override; derived from `${firstName} ${lastName}` if empty |
| `region` | text | No | Kept from current schema |
| `country` | text | No | Kept from current schema (still used by Lancer's currency baseline) |
| `timezone` | text | No | New |
| `avatar` | file | No | Defined as field for V2; unused in V1 (initials-only) |

### `lancer_profiles` (new, Lancer-specific)
| Field | Type | Required | Notes |
|---|---|---|---|
| `user` | relation → `users.id` | Yes | `unique: true`, `cascadeDelete: true` |
| `role` | select: `freelancer`, `studio` | Yes | Moved |
| `primary_discipline` | select: 11 values (as above) | No | Moved |
| `additional_skills` | json | No | Moved |
| `working_currency` | select: `EUR`, `GBP`, `USD` | No | Moved |
| `tier` | select: `free`, `basic`, `pro`, `max` | No | Moved (Lancer's product subscription tier; distinct from a future NordBit-level plan field if Stripe adds one) |
| `ai_addon` | bool | No | Moved |
| `quotes_used_this_month` | number | No | Moved |

### Access rules (target)
- `users` — read self only; auth + verified email rules unchanged.
- `lancer_profiles` — read/write where `@request.auth.id = user.id` (owner only). Admin can read all.

## Migration approach

Single migration file, written by hand (not auto-generated) so the data move is explicit.

**Up:**
1. Create `lancer_profiles` collection with the 8 fields above.
2. For each existing record in `users`, create a `lancer_profiles` row copying `role / primary_discipline / additional_skills / working_currency / tier / ai_addon / quotes_used_this_month`. Set `user` relation to the original `users.id`.
3. Add new fields to `users`: `firstName`, `lastName`, `displayName`, `timezone`, `avatar`. For each existing user, split `name` on first whitespace → `firstName` (head) + `lastName` (tail). Single-token names → `firstName` only.
4. Remove Lancer-specific fields from `users`: `role`, `primary_discipline`, `additional_skills`, `working_currency`, `tier`, `ai_addon`, `quotes_used_this_month`. Keep `region`, `country`. Keep `name` for now (deprecated, consumers use `firstName`/`lastName`/`displayName` going forward — drop in a follow-up migration once code stops reading `name`).

**Down:**
1. For each `lancer_profiles` record, copy fields back onto the matching `users` record.
2. Drop the new `users` fields (`firstName`, `lastName`, `displayName`, `timezone`, `avatar`).
3. Delete `lancer_profiles` collection.

## Cross-product considerations

- **Apex cookie session (Q2)** — users authenticate via `id.nordbit.ee`, get a PB auth token set as `nordbit_session` cookie on `.nordbit.ee` apex. Lancer reads cookie + queries `users` (for identity) and `lancer_profiles` (for product-specific data) in two calls — or one call via PB's `expand` parameter on a relation.
- **Future products** — RTS or any next product adds its own `<product>_profiles` collection with the same `user` relation pattern.

## Risks

- **`quotes_used_this_month` provenance** — present in `pb_schema.json`, not in the inspected `_updated_users.js` migration. Either added in a later migration not surfaced in a quick scan, or hand-added via Admin UI. Confirm against live PB Admin API before writing the migration.
- **`name` split heuristic** — splitting on first whitespace is lossy for users with multi-token first/last names. Acceptable for an MVP migration; users can correct in profile edit post-cutover.
- **Code paths reading old fields** — every consumer of `users.role / users.primary_discipline / users.tier / etc.` in Lancer's `app/` and `components/` needs to be repointed to `lancer_profiles`. Grep before merge: `users\.\(role\|primary_discipline\|additional_skills\|working_currency\|tier\|ai_addon\|quotes_used_this_month\)`.
- **Auth API rules** — current `users` access rules may reference `tier` for tier-gated reads. Audit collection rules before split.
- **Timing** — applying this migration mid-session on local dev PB will mutate `pb_data` permanently. If rolling back is needed, restore from the backup at `D:/0. Claude Projects/_backups/lancer-pre-frontend-rebuild-2026-04-26/pb_data/`.

## Pre-application checklist (run when Phase 4 starts)

1. Confirm `quotes_used_this_month` exists on live `users` — `GET http://127.0.0.1:8090/api/collections/_pb_users_auth_` with admin auth.
2. Backup current `pb_data/` to a timestamped folder.
3. Audit collection access rules for any reference to fields being moved.
4. Grep Lancer codebase for consumers of moved fields; tag them for refactor in Phase 7.
5. Write the migration file in `pb_migrations/` with timestamp prefix.
6. Restart local PB; verify migration ran successfully; smoke-test sign-up + login.
7. Document the migration in this file's "Resolved" section once applied.

## Resolved

*(empty until migration is applied)*
