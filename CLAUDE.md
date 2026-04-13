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
