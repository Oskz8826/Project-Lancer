@AGENTS.md

## Known Architecture Decisions
- **PocketBase auth + middleware**: PB JS SDK stores auth in localStorage, not cookies. The middleware reads a `pb_auth` cookie. The fix is in `lib/pocketbase.ts` — `authStore.onChange` writes the cookie so middleware can read it. Do not remove this or the login redirect loop returns.
- **No react-hook-form**: Simple forms in this project use plain controlled state (`useState`). react-hook-form + zod v4 silently fails form submission. Don't reintroduce it.
- **No native checkboxes**: Always use the custom `Checkbox` component (styled `<div>` + SVG checkmark). Native inputs clash with the glassmorphism dark theme.
- **PocketBase startup**: Must be running before auth works. Start with: `./pocketbase_0.36.9_windows_amd64/pocketbase.exe serve` from the lancer folder. Dev server: `npm run dev`.

## Alpha Testing — External Tunnel Procedure
Running an alpha session over Cloudflare tunnels requires a production build, not dev. Dev mode's HMR WebSocket is incompatible with Cloudflare free tunnels — results in a blank page with no obvious error.

**Correct boot sequence:**
1. Start PocketBase: `./pocketbase_0.36.9_windows_amd64/pocketbase.exe serve`
2. Start PB tunnel: `npm run tunnel:pb` — grab the `*.trycloudflare.com` URL
3. Update `.env.local` → `NEXT_PUBLIC_POCKETBASE_URL=https://<pb-tunnel-url>` (must be public URL — `127.0.0.1:8090` resolves to the tester's own machine, not yours)
4. Build: `npm run build`
5. Start prod server: `npm start`
6. Start app tunnel: `npm run tunnel:app` — share this URL with testers
7. Ask Cortana to set the timer: "start alpha test, X minutes"
8. **After session:** revert `.env.local` back to `http://127.0.0.1:8090`

**Why production build:** `NEXT_PUBLIC_*` env vars are baked in at build time, not runtime. Rebuild is required any time the PB URL changes.

**Suspense gate:** `useSearchParams()` requires a `<Suspense>` boundary in production builds — dev silently ignores this. If `npm run build` fails with `useSearchParams` error, wrap the page export: `export default function Wrapper() { return <Suspense><Page /></Suspense> }`.

**Killing processes on Windows:** `taskkill //F //PID` via bash is unreliable. Use Python: `python -c "import subprocess; subprocess.run(['taskkill', '/F', '/PID', '<pid>'])"`.

**Tester credentials:** `tester@lancer.local` / `1234567890` — must be `verified: true` in PocketBase (set once via Admin API, persists).

**Alpha session timer:** Backed by PocketBase `alpha_session` collection, record ID `kewmwjn3tdlq465`. Cortana sets it via Admin API. All connected clients sync in realtime.

## UI Reference
`Lancer_UI_Reference.html` — authoritative design reference. Read before building any new screen or component. Contains:
- Brand colors: #0D0D12 bg · #F25623 accent · #131318 card surface
- Glassmorphism recipe: rgba(255,255,255,0.03–0.06) bg · rgba(255,255,255,0.07–0.12) border · blur(10–16px) · border-radius 12–16px
- Typography, component specs (buttons, inputs, checkboxes, badges)
- Wireframes for all 8 screens
- Tech stack: Next.js · PocketBase · Stripe · Claude API
