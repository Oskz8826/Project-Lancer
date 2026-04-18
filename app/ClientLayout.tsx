'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import PageTransition from '@/components/ui/PageTransition'
import { NAV_ROUTES } from '@/lib/navRoutes'

const NAV_PATHS = new Set(NAV_ROUTES.map(r => r.href))

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (NAV_PATHS.has(pathname)) {
    return (
      <>
        <Navbar />
        <div style={{ overflowX: 'hidden' }}>
          <PageTransition>{children}</PageTransition>
        </div>
      </>
    )
  }

  return <>{children}</>
}
