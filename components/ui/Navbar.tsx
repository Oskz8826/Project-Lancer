'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import TransitionLink from './TransitionLink'
import { NAV_ROUTES } from '@/lib/navRoutes'

export default function Navbar() {
  const pathname = usePathname()
  const { user, loading, logout } = useAuth()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', height: '56px',
      background: 'rgba(13,13,18,0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <TransitionLink href="/" style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', textDecoration: 'none', color: '#fff' }}>
        Lancer
      </TransitionLink>

      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
        {NAV_ROUTES.map(({ href, label }) => {
          const active = pathname === href
          return active ? (
            <span key={href} style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 600 }}>{label}</span>
          ) : (
            <TransitionLink key={href} href={href} style={{ fontSize: '0.88rem', textDecoration: 'none', color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
              {label}
            </TransitionLink>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {!loading && (user ? (
          <>
            <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)' }}>{user.name}</span>
            <Link href="/dashboard" className="btn-accent" style={{ textDecoration: 'none', fontSize: '0.88rem', padding: '0.45rem 1rem' }}>Dashboard</Link>
            <button onClick={logout} style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign out</button>
          </>
        ) : (
          <>
            <Link href="/login" style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Sign in</Link>
            <Link href="/onboarding" className="btn-accent" style={{ textDecoration: 'none', fontSize: '0.88rem', padding: '0.45rem 1rem' }}>Get started free</Link>
          </>
        ))}
      </div>
    </nav>
  )
}
