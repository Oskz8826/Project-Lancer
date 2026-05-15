@AGENTS.md

## Known Architecture Decisions
- **PocketBase auth + middleware**: PB JS SDK stores auth in localStorage, not cookies. The middleware reads a `pb_auth` cookie. The fix is in `lib/pocketbase.ts` — `authStore.onChange` writes the cookie so middleware can read it. Do not remove this or the login redirect loop returns.
- **No react-hook-form**: Simple forms in this project use plain controlled state (`useState`). react-hook-form + zod v4 silently fails form submission. Don't reintroduce it.
- **No native checkboxes**: Always use the custom `Checkbox` component (styled `<div>` + SVG checkmark). Native inputs clash with the glassmorphism dark theme.
- **PocketBase startup**: Must be running before auth works. Start with: `./pocketbase_0.36.9_windows_amd64/pocketbase.exe serve` from the lancer folder. Dev server: `npm run dev`.

## UI Reference
`Lancer_UI_Reference.html` — authoritative design reference. Read before building any new screen or component. Contains:
- Brand colors: #0D0D12 bg · #F25623 accent · #131318 card surface
- Glassmorphism recipe: rgba(255,255,255,0.03–0.06) bg · rgba(255,255,255,0.07–0.12) border · blur(10–16px) · border-radius 12–16px
- Typography, component specs (buttons, inputs, checkboxes, badges)
- Wireframes for all 8 screens
- Tech stack: Next.js · PocketBase · Stripe · Claude API

## Code Patterns

**PocketBase returns `""` for unset text fields, never `null`** — Always use `||` not `??` when reading PocketBase text fields in React state or display logic. `??` only catches `null`/`undefined` — it passes through empty strings, causing silent fallback failures for currency, discipline, region, and any other text field that may be unset.

**Outer page wrapper must be transparent** — Never set a solid `background` on the outermost page container. The root layout provides the `#0D0D12` body background and the fixed star canvas at z-index 0. A solid background on the wrapper covers the canvas and breaks `backdrop-filter` (nothing to blur through). Use `background: transparent` or omit the property entirely. Let `body` handle the base color.

## PocketBase Admin API

Auth endpoint (v0.23+):
```
POST http://127.0.0.1:8090/api/collections/_superusers/auth-with-password
{"identity": "...", "password": "..."}
```
Returns `{ token }`. Use `Authorization: <token>` header for all subsequent calls.

Common operations:
- **Get collection**: `GET /api/collections/{name}`
- **Patch schema (two-step — never skip)**: (1) `GET /api/collections/{name}` → save full response to `C:/Users/oskzg/pb_schema.json`; (2) parse `fields` array, append new fields, write to `C:/Users/oskzg/pb_patch.json`; (3) `PATCH /api/collections/{id}` with that file. Sending a partial fields array silently drops existing fields and breaks access rules.
- **List records**: `GET /api/collections/{name}/records?filter=...&sort=-created`
- **Delete record**: `DELETE /api/collections/{name}/records/{id}`
- **Update record**: `PATCH /api/collections/{name}/records/{id}` with `{ field: value }`

Write JSON payloads to a temp file (`C:/Users/oskzg/pb_patch.json`) and pass with `-d @file` — avoids shell escaping issues.
