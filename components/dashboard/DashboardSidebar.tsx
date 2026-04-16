'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

type ActivePage = 'dashboard' | 'quotes' | 'history' | 'settings'

function IconDashboard({ color = 'rgba(255,255,255,0.3)' }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
}

function IconQuotes({ color = 'rgba(255,255,255,0.3)' }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  )
}

function IconHistory({ color = 'rgba(255,255,255,0.3)' }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )
}

function IconSettings({ color = 'rgba(255,255,255,0.3)' }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  )
}

function NavIcon({ href, title, active, children }: {
  href: string
  title: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }} title={title}>
      <div style={{
        width: '34px', height: '34px', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'rgba(242,86,35,0.15)' : 'transparent',
        border: active ? '1px solid rgba(242,86,35,0.3)' : '1px solid transparent',
      }}>
        {children}
      </div>
    </Link>
  )
}

export default function DashboardSidebar({ active }: { active: ActivePage }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [popupOpen, setPopupOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  const initials = user
    ? (user.name || user.email?.split('@')[0] || 'U')
        .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const ACCENT = '#f25623'

  useEffect(() => {
    if (!popupOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [popupOpen])

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderRight: '0.5px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '14px 0', gap: '6px',
      position: 'sticky', top: 0, height: '100vh',
      zIndex: 50,
    }}>
      {/* Logo mark */}
      <Link href="/" style={{ textDecoration: 'none' }} title="Home">
        <div style={{
          width: '30px', height: '30px', borderRadius: '7px',
          background: `linear-gradient(135deg,${ACCENT},#c43d10)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '8px',
          cursor: 'pointer',
        }}>L</div>
      </Link>

      <NavIcon href="/dashboard" title="Dashboard" active={active === 'dashboard'}>
        <IconDashboard color={active === 'dashboard' ? ACCENT : 'rgba(255,255,255,0.3)'} />
      </NavIcon>

      <NavIcon href="/dashboard/quotes" title="Quotes" active={active === 'quotes'}>
        <IconQuotes color={active === 'quotes' ? ACCENT : 'rgba(255,255,255,0.3)'} />
      </NavIcon>

      <NavIcon href="/dashboard/history" title="History" active={active === 'history'}>
        <IconHistory color={active === 'history' ? ACCENT : 'rgba(255,255,255,0.3)'} />
      </NavIcon>

      <NavIcon href="/dashboard/settings" title="Settings" active={active === 'settings'}>
        <IconSettings color={active === 'settings' ? ACCENT : 'rgba(255,255,255,0.3)'} />
      </NavIcon>

      <div style={{ flex: 1 }} />

      {/* Avatar + popup */}
      <div ref={popupRef} style={{ position: 'relative' }}>
        {/* Popup */}
        {popupOpen && (
          <div style={{
            position: 'absolute', bottom: '38px', left: '8px',
            background: 'rgba(18,18,26,0.98)', border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '12px',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            minWidth: '180px', zIndex: 100,
          }}>
            {/* User info */}
            <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Your account'}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
            {/* Actions */}
            <button
              onClick={() => { setPopupOpen(false); router.push('/dashboard/settings') }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '7px 8px', borderRadius: '7px', marginBottom: '3px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '12px', color: 'rgba(255,255,255,0.65)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              Settings
            </button>
            <button
              onClick={() => { setPopupOpen(false); logout() }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '7px 8px', borderRadius: '7px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '12px', color: '#f87171',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              Sign out
            </button>
          </div>
        )}

        {/* Avatar button */}
        <button
          onClick={() => setPopupOpen(o => !o)}
          title="Account"
          style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: popupOpen ? 'rgba(242,86,35,0.3)' : 'rgba(242,86,35,0.2)',
            border: `1px solid ${popupOpen ? 'rgba(242,86,35,0.6)' : 'rgba(242,86,35,0.4)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 600, color: ACCENT, cursor: 'pointer',
            outline: 'none', transition: 'all 0.15s',
          }}
        >{initials}</button>
      </div>
    </div>
  )
}
