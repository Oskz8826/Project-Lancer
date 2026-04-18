// Ordered list of top-level nav routes.
// Add new pages here in display order — the navbar and slide transitions both derive from this.
export const NAV_ROUTES: { href: string; label: string }[] = [
  { href: '/',        label: 'Home' },
  { href: '/pricing', label: 'Pricing' },
]

export function getRouteDepth(path: string): number {
  const idx = NAV_ROUTES.findIndex(r => r.href === path)
  return idx === -1 ? -1 : idx
}
